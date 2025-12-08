import { getInvoiceById, updatePaymentStatus } from './invoice-actions'
import { getSalonSettings } from '@/app/actions/admin-settings'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react'
import { DownloadPdfButton } from './pdf-button'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

async function markAsPaid(invoiceId: string) {
    'use server'
    await updatePaymentStatus(invoiceId, 'PAID')
    revalidatePath(`/admin/invoices/${invoiceId}`)
}

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
    const [invoiceResult, salon] = await Promise.all([
        getInvoiceById(params.id),
        getSalonSettings()
    ])

    if (!invoiceResult.success || !invoiceResult.data) {
        notFound()
    }

    const invoice = invoiceResult.data

    // Parse items for display
    let items: { description: string; quantity: number; price: number }[] = []

    if (Array.isArray(invoice.items)) {
        items = (invoice.items as { description?: string; serviceName?: string; quantity?: number; unitPrice?: number; price?: number }[]).map(item => ({
            description: item.description || item.serviceName || 'Service',
            quantity: item.quantity || 1,
            price: Number(item.unitPrice || item.price || 0)
        }))
    } else if (invoice.items && typeof invoice.items === 'object') {
        items = [{
            description: (invoice.items as { serviceName?: string }).serviceName || 'Service',
            quantity: 1,
            price: Number((invoice.items as { price?: number }).price || invoice.subtotal)
        }]
    } else if (invoice.booking) {
        items = [{
            description: invoice.booking.service.name,
            quantity: 1,
            price: Number(invoice.booking.service.price)
        }]
    }

    const statusConfig = {
        PAID: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Paid' },
        PENDING: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
        FAILED: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Failed' },
        REFUNDED: { icon: XCircle, color: 'bg-gray-100 text-gray-800', label: 'Refunded' }
    }

    const status = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.PENDING

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/invoices">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Invoice #{invoice.invoiceNumber}</h1>
                        <p className="text-muted-foreground">
                            Created on {format(new Date(invoice.createdAt), 'MMMM d, yyyy')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className={status.color}>
                        <status.icon className="h-4 w-4 mr-1" />
                        {status.label}
                    </Badge>
                    <DownloadPdfButton invoice={invoice as never} salon={salon} />
                </div>
            </div>

            {/* Invoice Preview Card */}
            <Card className="overflow-hidden">
                {/* Invoice Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold">{salon.salonName}</h2>
                            <p className="text-slate-300 mt-1">{salon.salonAddress}</p>
                            <p className="text-slate-300">{salon.salonCity}</p>
                            <p className="text-slate-300">{salon.salonPhone}</p>
                            <p className="text-slate-400 mt-2 text-sm">GSTIN: {salon.gstNumber}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-2xl font-bold text-blue-400">TAX INVOICE</h3>
                            <p className="text-slate-300 mt-2">#{invoice.invoiceNumber}</p>
                            <p className="text-slate-400">{format(new Date(invoice.createdAt), 'dd MMM yyyy')}</p>
                        </div>
                    </div>
                </div>

                <CardContent className="p-8">
                    {/* Customer & Service Info */}
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">BILL TO</h4>
                            <p className="font-semibold text-lg">{invoice.customer.name}</p>
                            <p className="text-muted-foreground">{invoice.customer.user.email}</p>
                            {invoice.customer.phone && (
                                <p className="text-muted-foreground">{invoice.customer.phone}</p>
                            )}
                            {invoice.customer.address && (
                                <p className="text-muted-foreground">{invoice.customer.address}</p>
                            )}
                        </div>
                        {invoice.booking && (
                            <div>
                                <h4 className="text-sm font-semibold text-muted-foreground mb-2">SERVICE DETAILS</h4>
                                <p className="font-semibold">{invoice.booking.service.name}</p>
                                <p className="text-muted-foreground">
                                    Date: {format(new Date(invoice.booking.date), 'dd MMM yyyy')}
                                </p>
                                {invoice.booking.staff && (
                                    <p className="text-muted-foreground">Stylist: {invoice.booking.staff.name}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Items Table */}
                    <div className="border rounded-lg overflow-hidden mb-8">
                        <table className="w-full">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="text-left p-4 font-semibold">#</th>
                                    <th className="text-left p-4 font-semibold">Description</th>
                                    <th className="text-center p-4 font-semibold">Qty</th>
                                    <th className="text-right p-4 font-semibold">Rate</th>
                                    <th className="text-right p-4 font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr key={idx} className="border-t">
                                        <td className="p-4 text-muted-foreground">{idx + 1}</td>
                                        <td className="p-4">{item.description}</td>
                                        <td className="p-4 text-center">{item.quantity}</td>
                                        <td className="p-4 text-right">₹{item.price.toFixed(2)}</td>
                                        <td className="p-4 text-right font-medium">₹{(item.quantity * item.price).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-72 space-y-2">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>₹{Number(invoice.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>GST (18%)</span>
                                <span>₹{Number(invoice.taxAmount).toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>₹{Number(invoice.totalAmount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className="mt-8 pt-8 border-t text-center text-muted-foreground text-sm">
                        <p>Thank you for choosing {salon.salonName}!</p>
                        <p>This is a computer-generated invoice. No signature required.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            {invoice.status === 'PENDING' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={markAsPaid.bind(null, invoice.id)}>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Paid
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
