'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getAdminAppointments() {
  return await prisma.booking.findMany({
    orderBy: { startTime: 'desc' },
    include: {
      customer: true,
      service: true,
      staff: true
    }
  })
}

import { BookingStatus } from '@prisma/client'

export async function updateBookingStatus(id: string, status: BookingStatus) {
  await prisma.booking.update({
    where: { id },
    data: { status }
  })
  revalidatePath('/admin/appointments')
}
