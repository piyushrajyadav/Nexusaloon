'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { format } from 'date-fns'

type Invoice = {
    id: string
    invoiceNumber: string
    subtotal: number | { toNumber(): number }
    taxAmount: number | { toNumber(): number }
    totalAmount: number | { toNumber(): number }
    status: string
    createdAt: Date
    description?: string | null
}

type SalonSettings = {
    salonName: string
    salonAddress: string
    salonCity: string
    gstNumber: string
    salonPhone: string
}

export function CustomerInvoiceDownload({
    invoice,
    customerName,
    salon
}: {
    invoice: Invoice
    customerName: string
    salon?: SalonSettings
}) {
    const [loading, setLoading] = useState(false)

    const downloadPdf = () => {
        setLoading(true)

        try {
            const doc = new jsPDF()
            const pageWidth = doc.internal.pageSize.getWidth()

            // Convert Decimal types
            const subtotal = typeof invoice.subtotal === 'object' ? invoice.subtotal.toNumber() : Number(invoice.subtotal)
            const taxAmount = typeof invoice.taxAmount === 'object' ? invoice.taxAmount.toNumber() : Number(invoice.taxAmount)
            const totalAmount = typeof invoice.totalAmount === 'object' ? invoice.totalAmount.toNumber() : Number(invoice.totalAmount)

            // Header
            doc.setFillColor(30, 41, 59)
            doc.rect(0, 0, pageWidth, 45, 'F')

            // Salon name
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(24)
            doc.setFont('helvetica', 'bold')
            doc.text(salon?.salonName || 'NexuSalon', 20, 25)

            // Invoice label
            doc.setFontSize(12)
            doc.setFont('helvetica', 'normal')
            doc.text('TAX INVOICE', pageWidth - 20, 20, { align: 'right' })
            doc.text(`#${invoice.invoiceNumber}`, pageWidth - 20, 30, { align: 'right' })

            // Reset text color
            doc.setTextColor(0, 0, 0)

            // Salon info
            let yPos = 60
            doc.setFontSize(10)
            doc.setTextColor(100, 100, 100)
            if (salon?.salonAddress) doc.text(salon.salonAddress, 20, yPos)
            yPos += 6
            if (salon?.salonCity) doc.text(salon.salonCity, 20, yPos)
            yPos += 6
            if (salon?.gstNumber) doc.text(`GSTIN: ${salon.gstNumber}`, 20, yPos)

            // Invoice details
            yPos = 60
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(10)
            doc.text('Invoice Date:', pageWidth - 70, yPos)
            doc.text(format(new Date(invoice.createdAt), 'dd MMM yyyy'), pageWidth - 20, yPos, { align: 'right' })
            yPos += 8
            doc.text('Status:', pageWidth - 70, yPos)
            doc.setTextColor(invoice.status === 'PAID' ? 0 : 200, invoice.status === 'PAID' ? 150 : 0, 0)
            doc.text(invoice.status, pageWidth - 20, yPos, { align: 'right' })

            // Bill To
            yPos = 100
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(11)
            doc.setFont('helvetica', 'bold')
            doc.text('BILL TO:', 20, yPos)
            doc.setFont('helvetica', 'normal')
            yPos += 8
            doc.text(customerName, 20, yPos)

            // Table header
            yPos = 130
            doc.setFillColor(248, 250, 252)
            doc.rect(20, yPos - 5, pageWidth - 40, 12, 'F')
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text('Description', 25, yPos + 3)
            doc.text('Amount', pageWidth - 25, yPos + 3, { align: 'right' })

            // Table content
            yPos += 18
            doc.setFont('helvetica', 'normal')
            doc.text(invoice.description || 'Service', 25, yPos)
            doc.text(`Rs. ${subtotal.toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' })

            // Totals
            yPos += 30
            doc.setDrawColor(200, 200, 200)
            doc.line(pageWidth - 100, yPos - 5, pageWidth - 20, yPos - 5)

            // Subtotal
            doc.text('Subtotal:', pageWidth - 100, yPos)
            doc.text(`Rs. ${subtotal.toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' })

            // GST
            yPos += 10
            const gstRate = subtotal > 0 ? Math.round((taxAmount / subtotal) * 100) : 18
            doc.text(`GST (${gstRate}%):`, pageWidth - 100, yPos)
            doc.text(`Rs. ${taxAmount.toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' })

            // Total
            yPos += 12
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(12)
            doc.text('TOTAL:', pageWidth - 100, yPos)
            doc.text(`Rs. ${totalAmount.toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' })

            // Footer
            yPos = 250
            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(100, 100, 100)
            doc.text('Thank you for choosing us!', pageWidth / 2, yPos, { align: 'center' })

            // Download
            doc.save(`Invoice-${invoice.invoiceNumber}.pdf`)
        } catch (error) {
            console.error('PDF generation error:', error)
        }

        setLoading(false)
    }

    // Only show download for PAID invoices
    if (invoice.status !== 'PAID') {
        return <span className="text-xs text-gray-400">-</span>
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={downloadPdf}
            disabled={loading}
            className="h-8 px-2"
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
        </Button>
    )
}
