'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'
import { getSalonSettings } from '@/app/actions/admin-settings'

// Generate proper invoice number using settings
async function generateInvoiceNumber() {
  const settings = await getSalonSettings()
  const count = await prisma.invoice.count()
  const datePart = format(new Date(), "yyyyMM")
  const sequence = (count + 1).toString().padStart(4, '0')
  return `${settings.invoicePrefix}-${datePart}-${sequence}`
}

export async function createManualInvoice(data: {
  customerId?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  amount: number
  description?: string
  serviceId?: string
  gstRate?: number // Custom GST rate from form
}) {
  try {
    let customerId = data.customerId

    // If no existing customer selected, create a new one or find by email
    if (!customerId && data.customerName) {
      // Check if customer exists by email
      if (data.customerEmail) {
        const existingUser = await prisma.user.findUnique({
          where: { email: data.customerEmail },
          include: { customer: true }
        })

        if (existingUser?.customer) {
          customerId = existingUser.customer.id
        } else if (existingUser) {
          // User exists but no customer profile
          const customer = await prisma.customer.create({
            data: {
              userId: existingUser.id,
              name: data.customerName,
              phone: data.customerPhone
            }
          })
          customerId = customer.id
        } else {
          // Create new user and customer
          const newUser = await prisma.user.create({
            data: {
              email: data.customerEmail,
              role: 'CUSTOMER',
              customer: {
                create: {
                  name: data.customerName,
                  phone: data.customerPhone
                }
              }
            },
            include: { customer: true }
          })
          customerId = newUser.customer!.id
        }
      } else {
        // No email provided - create walk-in customer with placeholder
        const walkInEmail = `walkin_${Date.now()}@salon.local`
        const newUser = await prisma.user.create({
          data: {
            email: walkInEmail,
            role: 'CUSTOMER',
            customer: {
              create: {
                name: data.customerName,
                phone: data.customerPhone
              }
            }
          },
          include: { customer: true }
        })
        customerId = newUser.customer!.id
      }
    }

    if (!customerId) {
      return { error: 'Customer is required' }
    }

    // Use custom GST rate if provided, otherwise fall back to settings
    const settings = await getSalonSettings()
    const gstRatePercent = data.gstRate !== undefined ? data.gstRate : settings.gstRate
    const gstRate = gstRatePercent / 100 // Convert from percentage
    const taxAmount = data.amount * gstRate
    const totalAmount = data.amount + taxAmount
    const invoiceNumber = await generateInvoiceNumber()

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId,
        subtotal: data.amount,
        taxAmount,
        totalAmount,
        status: 'PENDING',
        items: {
          description: data.description || 'Manual Invoice',
          quantity: 1,
          unitPrice: data.amount,
          total: data.amount
        }
      }
    })

    revalidatePath('/admin/invoices')
    return { success: true, invoiceId: invoice.id }
  } catch (error) {
    console.error('Error creating invoice:', error)
    return { error: 'Failed to create invoice. Please check all fields.' }
  }
}

export async function getCustomersAndServices() {
  const [customers, services] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { name: 'asc' },
      include: {
        user: {
          select: { email: true }
        }
      }
    }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  ])
  return { customers, services }
}
