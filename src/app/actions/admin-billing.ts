'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { format } from "date-fns"

// Helper to generate invoice number
async function generateInvoiceNumber() {
  const count = await prisma.invoice.count()
  const datePart = format(new Date(), "yyyyMM")
  const sequence = (count + 1).toString().padStart(4, '0')
  return `INV-${datePart}-${sequence}`
}

export async function createInvoiceForBooking(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        customer: true
      }
    })

    if (!booking) {
      return { success: false, error: "Booking not found" }
    }

    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { bookingId }
    })

    if (existingInvoice) {
      return { success: false, error: "Invoice already exists for this booking" }
    }

    const price = Number(booking.service.price)
    const taxRate = 0.18 // 18% GST
    const taxAmount = price * taxRate
    const totalAmount = price + taxAmount
    const invoiceNumber = await generateInvoiceNumber()

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        bookingId,
        customerId: booking.customerId,
        subtotal: price,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        status: "PENDING",
        items: [
          {
            description: booking.service.name,
            quantity: 1,
            unitPrice: price,
            total: price
          }
        ]
      }
    })

    revalidatePath("/admin/billing")
    return { success: true, data: invoice }
  } catch (error) {
    console.error("Failed to create invoice:", error)
    return { success: false, error: "Failed to create invoice" }
  }
}

export async function getInvoices() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
            address: true,
            user: {
              select: { email: true }
            }
          }
        },
        booking: {
          select: {
            date: true,
            service: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return { success: true, data: invoices }
  } catch (error) {
    console.error("Failed to fetch invoices:", error)
    return { success: false, error: "Failed to fetch invoices" }
  }
}

export async function updateInvoiceStatus(id: string, status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED') {
  try {
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status },
    })
    revalidatePath("/admin/billing")
    return { success: true, data: invoice }
  } catch (error) {
    console.error("Failed to update invoice status:", error)
    return { success: false, error: "Failed to update invoice status" }
  }
}

export async function getSalesReport(startDate?: Date, endDate?: Date) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      status: 'PAID'
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: startDate,
        lte: endDate
      }
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform for export
    const reportData = invoices.map(inv => ({
      InvoiceNumber: inv.invoiceNumber,
      Date: format(inv.createdAt, 'yyyy-MM-dd'),
      Customer: inv.customer.name,
      Subtotal: Number(inv.subtotal),
      GST: Number(inv.taxAmount),
      Total: Number(inv.totalAmount),
      Status: inv.status
    }))

    return { success: true, data: reportData }
  } catch (error) {
    console.error("Failed to generate sales report:", error)
    return { success: false, error: "Failed to generate sales report" }
  }
}
