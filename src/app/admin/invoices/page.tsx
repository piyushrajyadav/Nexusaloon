import prisma from '@/lib/prisma'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { CreateInvoiceButton } from './create-invoice-button'

export const dynamic = 'force-dynamic'

export default async function AdminInvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: {
      customer: true,
      booking: {
        include: {
          service: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <CreateInvoiceButton />
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{format(invoice.createdAt, 'MMM d, yyyy')}</TableCell>
                  <TableCell>{invoice.customer.name}</TableCell>
                  <TableCell>{invoice.booking?.service.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={
                      invoice.status === 'PAID' ? 'default' :
                        invoice.status === 'PENDING' ? 'secondary' : 'destructive'
                    }>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">₹{Number(invoice.totalAmount).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <a href={`/admin/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
                      View
                    </a>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
