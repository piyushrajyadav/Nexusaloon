'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createFeedback(bookingId: string, rating: number, comment: string | null) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Not authenticated' }
        }

        // Get customer from user
        const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { customer: true }
        })

        if (!dbUser?.customer) {
            return { error: 'Customer not found' }
        }

        // Check if booking belongs to this customer
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        })

        if (!booking || booking.customerId !== dbUser.customer.id) {
            return { error: 'Booking not found or unauthorized' }
        }

        // Check if feedback already exists
        const existingFeedback = await prisma.feedback.findUnique({
            where: { bookingId }
        })

        if (existingFeedback) {
            return { error: 'Feedback already submitted for this booking' }
        }

        // Create feedback
        await prisma.feedback.create({
            data: {
                customerId: dbUser.customer.id,
                bookingId,
                rating,
                comment
            }
        })

        revalidatePath('/dashboard')
        revalidatePath('/admin/feedbacks')

        return { success: true }
    } catch (error) {
        console.error('Error creating feedback:', error)
        return { error: 'Failed to submit feedback' }
    }
}

export async function getFeedbackForBooking(bookingId: string) {
    try {
        const feedback = await prisma.feedback.findUnique({
            where: { bookingId }
        })
        return { feedback }
    } catch (error) {
        console.error('Error getting feedback:', error)
        return { error: 'Failed to get feedback' }
    }
}

export async function getAllFeedbacks() {
    try {
        const feedbacks = await prisma.feedback.findMany({
            include: {
                customer: true,
                booking: {
                    include: {
                        service: true,
                        staff: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return { feedbacks }
    } catch (error) {
        console.error('Error getting all feedbacks:', error)
        return { error: 'Failed to get feedbacks' }
    }
}
