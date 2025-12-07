'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { BookingStatus } from "@prisma/client"
import { startOfDay, endOfDay } from "date-fns"

// In a real app, this would come from the session
// For demo purposes, we'll fetch the first staff member or use a hardcoded ID if provided
async function getCurrentStaffId() {
  const staff = await prisma.staff.findFirst()
  return staff?.id
}

export async function getStaffAppointments(date: Date = new Date()) {
  try {
    const staffId = await getCurrentStaffId()
    if (!staffId) return { success: false, error: "No staff account found" }

    const appointments = await prisma.booking.findMany({
      where: {
        staffId: staffId,
        date: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          }
        },
        service: {
          select: {
            name: true,
            duration: true,
          }
        }
      },
      orderBy: {
        startTime: 'asc',
      },
    })
    return { success: true, data: appointments }
  } catch (error) {
    console.error("Failed to fetch staff appointments:", error)
    return { success: false, error: "Failed to fetch appointments" }
  }
}

export async function updateStaffBookingStatus(bookingId: string, status: BookingStatus) {
  try {
    // Verify the booking belongs to the current staff (optional security check)
    const staffId = await getCurrentStaffId()
    if (!staffId) return { success: false, error: "Unauthorized" }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking || booking.staffId !== staffId) {
      return { success: false, error: "Booking not found or unauthorized" }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    })

    revalidatePath("/staff")
    return { success: true, data: updatedBooking }
  } catch (error) {
    console.error("Failed to update booking status:", error)
    return { success: false, error: "Failed to update booking status" }
  }
}

export async function getStaffCustomers() {
  try {
    const staffId = await getCurrentStaffId()
    if (!staffId) return { success: false, error: "No staff account found" }

    // Find customers who have had bookings with this staff member
    const customers = await prisma.customer.findMany({
      where: {
        bookings: {
          some: {
            staffId: staffId
          }
        }
      },
      include: {
        user: {
          select: {
            email: true
          }
        },
        _count: {
          select: {
            bookings: {
              where: {
                staffId: staffId
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return { success: true, data: customers }
  } catch (error) {
    console.error("Failed to fetch staff customers:", error)
    return { success: false, error: "Failed to fetch customers" }
  }
}
