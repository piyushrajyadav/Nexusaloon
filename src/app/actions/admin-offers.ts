'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getOffers() {
    try {
        const offers = await prisma.offer.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: offers }
    } catch (error) {
        console.error("Failed to fetch offers:", error)
        return { success: false, error: "Failed to fetch offers" }
    }
}

export async function createOffer(data: {
    code: string
    description?: string
    discountPct?: number
    flatAmount?: number
    validFrom: Date
    validUntil: Date
}) {
    try {
        // Check if code already exists
        const existing = await prisma.offer.findUnique({
            where: { code: data.code }
        })
        if (existing) {
            return { success: false, error: "Offer code already exists" }
        }

        const offer = await prisma.offer.create({
            data: {
                code: data.code.toUpperCase(),
                description: data.description,
                discountPct: data.discountPct,
                flatAmount: data.flatAmount,
                validFrom: data.validFrom,
                validUntil: data.validUntil,
                isActive: true
            }
        })
        revalidatePath("/admin/offers")
        return { success: true, data: offer }
    } catch (error) {
        console.error("Failed to create offer:", error)
        return { success: false, error: "Failed to create offer" }
    }
}

export async function updateOffer(id: string, data: {
    code?: string
    description?: string
    discountPct?: number | null
    flatAmount?: number | null
    validFrom?: Date
    validUntil?: Date
}) {
    try {
        const offer = await prisma.offer.update({
            where: { id },
            data
        })
        revalidatePath("/admin/offers")
        return { success: true, data: offer }
    } catch (error) {
        console.error("Failed to update offer:", error)
        return { success: false, error: "Failed to update offer" }
    }
}

export async function toggleOfferStatus(id: string, isActive: boolean) {
    try {
        const offer = await prisma.offer.update({
            where: { id },
            data: { isActive }
        })
        revalidatePath("/admin/offers")
        return { success: true, data: offer }
    } catch (error) {
        console.error("Failed to toggle offer status:", error)
        return { success: false, error: "Failed to update offer status" }
    }
}

export async function deleteOffer(id: string) {
    try {
        await prisma.offer.delete({
            where: { id }
        })
        revalidatePath("/admin/offers")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete offer:", error)
        return { success: false, error: "Failed to delete offer" }
    }
}
