'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { addMinutes, format, isBefore, setHours, setMinutes, startOfDay } from 'date-fns'
import { revalidatePath } from 'next/cache'

// Helper to get authenticated user
async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

// Helper to get or create Prisma customer profile
async function getOrCreateCustomer(userId: string, email: string) {
  let user = await prisma.user.findUnique({
    where: { email },
    include: { customer: true }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        role: 'CUSTOMER',
        customer: {
          create: {
            name: email.split('@')[0], // Default name
          }
        }
      },
      include: { customer: true }
    })
  } else if (!user.customer) {
    // Create customer profile if missing
    await prisma.customer.create({
      data: {
        userId: user.id,
        name: email.split('@')[0],
      }
    })
    user = await prisma.user.findUnique({
      where: { email },
      include: { customer: true }
    })
  }

  return user?.customer
}

// Fetch active services - no cache to ensure fresh data
export async function getServices() {
  return await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })
}

// Fetch active staff - no cache to ensure fresh data
export async function getStaff() {
  return await prisma.staff.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })
}

export async function getAvailableSlots(date: Date, staffId: string, serviceDuration: number) {
  // Salon hours: 9:00 AM to 8:00 PM
  const openTime = 9
  const closeTime = 20
  const interval = 30 // minutes

  const start = setHours(setMinutes(startOfDay(date), 0), openTime)
  const end = setHours(setMinutes(startOfDay(date), 0), closeTime)

  // Fetch existing bookings for the staff on this date
  const bookings = await prisma.booking.findMany({
    where: {
      staffId,
      date: {
        gte: startOfDay(date),
        lt: addMinutes(startOfDay(date), 24 * 60)
      },
      status: {
        notIn: ['CANCELLED', 'NO_SHOW']
      }
    }
  })

  const slots = []
  let current = start

  while (isBefore(current, end)) {
    const slotEnd = addMinutes(current, serviceDuration)

    // Check if slot exceeds closing time
    if (isBefore(end, slotEnd)) break

    // Check for collisions
    const isBusy = bookings.some((booking: { startTime: Date; endTime: Date }) => {
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)

      return (
        (current >= bookingStart && current < bookingEnd) || // Start overlaps
        (slotEnd > bookingStart && slotEnd <= bookingEnd) || // End overlaps
        (current <= bookingStart && slotEnd >= bookingEnd)   // Encloses
      )
    })

    if (!isBusy) {
      slots.push(format(current, 'HH:mm'))
    }

    current = addMinutes(current, interval)
  }

  return slots
}

export async function createBooking(data: {
  serviceId: string
  staffId: string | null  // null means "any available"
  date: Date
  time: string
}) {
  const authUser = await getAuthUser()
  if (!authUser || !authUser.email) {
    return { error: 'Unauthorized' }
  }

  const customer = await getOrCreateCustomer(authUser.id, authUser.email)
  if (!customer) {
    return { error: 'Could not create customer profile' }
  }

  const service = await prisma.service.findUnique({ where: { id: data.serviceId } })
  if (!service) return { error: 'Service not found' }

  // If no staff specified, assign first available staff
  let staffId = data.staffId
  if (!staffId) {
    const availableStaff = await prisma.staff.findFirst({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
    if (availableStaff) {
      staffId = availableStaff.id
    }
    // If still no staff, booking can proceed without staff assignment (for walk-in handling)
  }

  const [hours, minutes] = data.time.split(':').map(Number)
  const startTime = setMinutes(setHours(data.date, hours), minutes)
  const endTime = addMinutes(startTime, service.duration)

  try {
    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        serviceId: data.serviceId,
        staffId: staffId,
        date: data.date,
        startTime,
        endTime,
        status: 'CONFIRMED' // Auto-confirm for now
      }
    })

    // Stub for SMS/WhatsApp notification
    console.log(`Sending WhatsApp confirmation to customer ${customer.id} for booking ${booking.id}`)

    revalidatePath('/dashboard')
    return { success: true, bookingId: booking.id }
  } catch (error) {
    console.error('Booking error:', error)
    return { error: 'Failed to create booking' }
  }
}

export async function getUserBookings() {
  const authUser = await getAuthUser()
  if (!authUser || !authUser.email) return []

  const user = await prisma.user.findUnique({
    where: { email: authUser.email },
    include: { customer: true }
  })

  if (!user?.customer) return []

  const bookings = await prisma.booking.findMany({
    where: { customerId: user.customer.id },
    include: {
      service: true,
      staff: true
    },
    orderBy: { startTime: 'desc' }
  })

  // Check for feedback on each booking
  // Using try-catch in case Feedback model doesn't exist yet
  const bookingsWithFeedback = await Promise.all(
    bookings.map(async (booking) => {
      let hasFeedback = false
      try {
        // @ts-ignore - Feedback might not exist in Prisma types until regenerated
        const feedback = await prisma.feedback?.findUnique({
          where: { bookingId: booking.id }
        })
        hasFeedback = !!feedback
      } catch {
        // Feedback model doesn't exist yet
      }
      return { ...booking, hasFeedback }
    })
  )

  return bookingsWithFeedback
}

export async function cancelBooking(bookingId: string) {
  const authUser = await getAuthUser()
  if (!authUser) return { error: 'Unauthorized' }

  // Verify ownership
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: { include: { user: true } } }
  })

  if (!booking || booking.customer.user.email !== authUser.email) {
    return { error: 'Unauthorized' }
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' }
  })

  revalidatePath('/dashboard')
  return { success: true }
}
