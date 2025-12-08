'use client'

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'

type InvoiceData = {
    invoiceNumber: string
    createdAt: Date
    customer: {
        name: string
        phone: string | null
        address: string | null
        user: { email: string }
    }
    booking: {
        service: { name: string; price: number | string }
        staff: { name: string } | null
        date: Date
    } | null
    items: { description?: string; serviceName?: string; quantity?: number; unitPrice?: number; price?: number; total?: number }[] | { serviceName: string; price: number } | null
    subtotal: number | string
    taxAmount: number | string
    totalAmount: number | string
    status: string
}

type SalonSettings = {
    salonName: string
    salonAddress: string
    salonCity: string
    salonPhone: string
    salonEmail: string
    gstNumber: string
    gstRate: number
    salonWebsite: string
    invoiceFooter: string
    currency: string
}

export function DownloadPdfButton({ invoice, salon }: { invoice: InvoiceData; salon: SalonSettings }) {
    const [loading, setLoading] = useState(false)

    const generatePdf = () => {
        setLoading(true)

        try {
            const doc = new jsPDF()
            const pageWidth = doc.internal.pageSize.getWidth()

            // Header - Salon Info
            doc.setFontSize(24)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(33, 37, 41)
            doc.text(salon.salonName, 20, 25)

            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(108, 117, 125)
            doc.text(salon.salonAddress, 20, 33)
            doc.text(salon.salonCity, 20, 38)
            doc.text(`Phone: ${salon.salonPhone}`, 20, 43)
            doc.text(`Email: ${salon.salonEmail}`, 20, 48)

            // GST Number
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(33, 37, 41)
            doc.text(`GSTIN: ${salon.gstNumber}`, 20, 56)

            // Invoice Title & Number - Right aligned
            doc.setFontSize(28)
            doc.setTextColor(59, 130, 246)
            doc.text('TAX INVOICE', pageWidth - 20, 25, { align: 'right' })

            doc.setFontSize(11)
            doc.setTextColor(33, 37, 41)
            doc.setFont('helvetica', 'bold')
            doc.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - 20, 35, { align: 'right' })
            doc.setFont('helvetica', 'normal')
            doc.text(`Date: ${format(new Date(invoice.createdAt), 'dd MMM yyyy')}`, pageWidth - 20, 42, { align: 'right' })
            doc.text(`Status: ${invoice.status}`, pageWidth - 20, 49, { align: 'right' })

            // Divider line
            doc.setDrawColor(200, 200, 200)
            doc.line(20, 65, pageWidth - 20, 65)

            // Bill To section
            doc.setFontSize(11)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(33, 37, 41)
            doc.text('BILL TO:', 20, 78)

            doc.setFont('helvetica', 'normal')
            doc.setTextColor(66, 66, 66)
            doc.text(invoice.customer.name, 20, 86)
            doc.text(invoice.customer.user.email, 20, 92)
            if (invoice.customer.phone) {
                doc.text(invoice.customer.phone, 20, 98)
            }
            if (invoice.customer.address) {
                doc.text(invoice.customer.address, 20, 104)
            }

            // Service Details
            if (invoice.booking) {
                doc.setFont('helvetica', 'bold')
                doc.setTextColor(33, 37, 41)
                doc.text('SERVICE DETAILS:', pageWidth / 2 + 10, 78)

                doc.setFont('helvetica', 'normal')
                doc.setTextColor(66, 66, 66)
                doc.text(`Service Date: ${format(new Date(invoice.booking.date), 'dd MMM yyyy')}`, pageWidth / 2 + 10, 86)
                if (invoice.booking.staff) {
                    doc.text(`Stylist: ${invoice.booking.staff.name}`, pageWidth / 2 + 10, 92)
                }
            }

            // Items Table
            const tableStartY = 115

            // Parse items
            let itemsArray: { description: string; qty: number; rate: number; amount: number }[] = []

            if (Array.isArray(invoice.items)) {
                itemsArray = invoice.items.map(item => ({
                    description: item.description || item.serviceName || 'Service',
                    qty: item.quantity || 1,
                    rate: Number(item.unitPrice || item.price || 0),
                    amount: Number(item.total || item.price || 0)
                }))
            } else if (invoice.items && typeof invoice.items === 'object') {
                itemsArray = [{
                    description: (invoice.items as { serviceName: string }).serviceName || 'Service',
                    qty: 1,
                    rate: Number((invoice.items as { price: number }).price || invoice.subtotal),
                    amount: Number((invoice.items as { price: number }).price || invoice.subtotal)
                }]
            } else if (invoice.booking) {
                itemsArray = [{
                    description: invoice.booking.service.name,
                    qty: 1,
                    rate: Number(invoice.booking.service.price),
                    amount: Number(invoice.subtotal)
                }]
            }

            autoTable(doc, {
                startY: tableStartY,
                head: [['#', 'Description', 'Qty', 'Rate (₹)', 'Amount (₹)']],
                body: itemsArray.map((item, idx) => [
                    idx + 1,
                    item.description,
                    item.qty,
                    item.rate.toFixed(2),
                    item.amount.toFixed(2)
                ]),
                theme: 'striped',
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 10
                },
                styles: {
                    fontSize: 10,
                    cellPadding: 5
                },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 20, halign: 'center' },
                    3: { cellWidth: 35, halign: 'right' },
                    4: { cellWidth: 35, halign: 'right' }
                }
            })

            // Get the final Y position after table
            const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

            // Totals section - right aligned
            const totalsX = pageWidth - 80
            const totalsWidth = 60

            doc.setFillColor(248, 249, 250)
            doc.rect(totalsX - 10, finalY, totalsWidth + 30, 45, 'F')

            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(66, 66, 66)

            doc.text('Subtotal:', totalsX, finalY + 12)
            doc.text(`₹${Number(invoice.subtotal).toFixed(2)}`, totalsX + totalsWidth, finalY + 12, { align: 'right' })

            doc.text('GST (18%):', totalsX, finalY + 22)
            doc.text(`₹${Number(invoice.taxAmount).toFixed(2)}`, totalsX + totalsWidth, finalY + 22, { align: 'right' })

            doc.setDrawColor(200, 200, 200)
            doc.line(totalsX, finalY + 28, totalsX + totalsWidth, finalY + 28)

            doc.setFontSize(12)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(33, 37, 41)
            doc.text('Total:', totalsX, finalY + 38)
            doc.text(`₹${Number(invoice.totalAmount).toFixed(2)}`, totalsX + totalsWidth, finalY + 38, { align: 'right' })

            // Footer
            const footerY = finalY + 60

            doc.setDrawColor(200, 200, 200)
            doc.line(20, footerY, pageWidth - 20, footerY)

            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(108, 117, 125)
            doc.text('Thank you for choosing ' + salon.salonName + '!', pageWidth / 2, footerY + 10, { align: 'center' })
            doc.text('This is a computer-generated invoice. No signature required.', pageWidth / 2, footerY + 16, { align: 'center' })
            doc.text(salon.salonWebsite, pageWidth / 2, footerY + 22, { align: 'center' })

            // Save PDF
            doc.save(`Invoice-${invoice.invoiceNumber}.pdf`)
        } catch (error) {
            console.error('Error generating PDF:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button onClick={generatePdf} disabled={loading}>
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Download className="mr-2 h-4 w-4" />
            )}
            Download PDF
        </Button>
    )
}
