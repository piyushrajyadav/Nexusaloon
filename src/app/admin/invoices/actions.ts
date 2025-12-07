'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const InvoiceSchema = z.object({
  customerId: z.string().min(1),
  serviceId: z.string().optional(),
  amount: z.coerce.number().min(0),
  description: z.string().optional(),
})

export async function createManualInvoice(formData: FormData) {
  const validatedFields = InvoiceSchema.safeParse({
    customerId: formData.get('customerId'),
    serviceId: formData.get('serviceId'),
    amount: formData.get('amount'),
    description: formData.get('description'),
  })

  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  const { customerId, serviceId, amount, description } = validatedFields.data
  const taxAmount = amount * 0.18
  const totalAmount = amount + taxAmount

  try {
    await prisma.invoice.create({
      data: {
        customerId,
        subtotal: amount,
        taxAmount,
        totalAmount,
        status: 'PENDING',
        items: {
          description: description || 'Manual Invoice',
          serviceId
        }
      }
    })
    revalidatePath('/admin/invoices')
    return { success: true }
  } catch (error) {
    console.error('Error creating invoice:', error)
    return { error: 'Failed to create invoice' }
  }
}

export async function getCustomersAndServices() {
  const [customers, services] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: 'asc' } }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  ])
  return { customers, services }
}
