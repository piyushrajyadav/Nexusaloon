'use server'

import prisma from "@/lib/prisma"

export async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        user: {
          select: {
            email: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return { success: true, data: customers }
  } catch (error) {
    console.error("Failed to fetch customers:", error)
    return { success: false, error: "Failed to fetch customers" }
  }
}
