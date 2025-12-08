'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { PaymentStatus, PaymentMethod } from '@prisma/client'

export async function getInvoiceById(id: string) {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                customer: {
                    include: {
                        user: {
                            select: { email: true }
                        }
                    }
                },
                booking: {
                    include: {
                        service: true,
                        staff: true
                    }
                },
                payments: true
            }
        })

        if (!invoice) {
            return { success: false, error: 'Invoice not found' }
        }

        return { success: true, data: invoice }
    } catch (error) {
        console.error('Failed to fetch invoice:', error)
        return { success: false, error: 'Failed to fetch invoice' }
    }
}

export async function updatePaymentStatus(invoiceId: string, status: PaymentStatus) {
    try {
        const invoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status }
        })
        revalidatePath('/admin/invoices')
        revalidatePath(`/admin/invoices/${invoiceId}`)
        return { success: true, data: invoice }
    } catch (error) {
        console.error('Failed to update payment status:', error)
        return { success: false, error: 'Failed to update payment status' }
    }
}

export async function recordPayment(data: {
    invoiceId: string
    amount: number
    method: PaymentMethod
    transactionId?: string
}) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Create payment record
            const payment = await tx.payment.create({
                data: {
                    invoiceId: data.invoiceId,
                    amount: data.amount,
                    method: data.method,
                    status: 'PAID',
                    transactionId: data.transactionId
                }
            })

            // Update invoice status to PAID
            await tx.invoice.update({
                where: { id: data.invoiceId },
                data: { status: 'PAID' }
            })

            return payment
        })

        revalidatePath('/admin/invoices')
        revalidatePath(`/admin/invoices/${data.invoiceId}`)
        return { success: true, data: result }
    } catch (error) {
        console.error('Failed to record payment:', error)
        return { success: false, error: 'Failed to record payment' }
    }
}
