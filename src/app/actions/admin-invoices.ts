'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function generateInvoice(bookingId: string) {
  try {
    // 1. Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        customer: true,
        invoice: true
      }
    })

    if (!booking) {
      return { error: 'Booking not found' }
    }

    if (booking.invoice) {
      return { error: 'Invoice already exists for this booking' }
    }

    // 2. Calculate totals
    const price = Number(booking.service.price)
    const taxRate = 0.18 // 18% GST
    const taxAmount = price * taxRate
    const totalAmount = price + taxAmount

    // 3. Create Invoice
    const invoice = await prisma.invoice.create({
      data: {
        bookingId: booking.id,
        customerId: booking.customerId,
        subtotal: price,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        status: 'PENDING',
        items: {
          serviceName: booking.service.name,
          price: price
        }
      }
    })

    revalidatePath('/admin/invoices')
    revalidatePath('/admin/appointments')
    return { success: true, invoiceId: invoice.id }
  } catch (error) {
    console.error('Error generating invoice:', error)
    return { error: 'Failed to generate invoice' }
  }
}
