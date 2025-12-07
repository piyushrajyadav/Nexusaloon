'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function getStaff() {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    })
    return { success: true, data: staff }
  } catch (error) {
    console.error("Failed to fetch staff:", error)
    return { success: false, error: "Failed to fetch staff" }
  }
}

export async function createStaff(data: {
  name: string
  email: string
  phone?: string
  specialization?: string
  commissionRate: number
  password?: string
}) {
  try {
    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return { success: false, error: "Email already exists" }
    }

    const hashedPassword = await bcrypt.hash(data.password || "password123", 10)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: "STAFF",
        }
      })

      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          name: data.name,
          phone: data.phone,
          specialization: data.specialization,
          commissionRate: data.commissionRate,
        }
      })

      return staff
    })

    revalidatePath("/admin/staff")
    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to create staff:", error)
    return { success: false, error: "Failed to create staff" }
  }
}

export async function updateStaff(id: string, data: {
  name?: string
  phone?: string
  specialization?: string
  commissionRate?: number
}) {
  try {
    const staff = await prisma.staff.update({
      where: { id },
      data,
    })
    revalidatePath("/admin/staff")
    return { success: true, data: staff }
  } catch (error) {
    console.error("Failed to update staff:", error)
    return { success: false, error: "Failed to update staff" }
  }
}

export async function toggleStaffStatus(id: string, isActive: boolean) {
  try {
    const staff = await prisma.staff.update({
      where: { id },
      data: { isActive },
    })
    revalidatePath("/admin/staff")
    return { success: true, data: staff }
  } catch (error) {
    console.error("Failed to update staff status:", error)
    return { success: false, error: "Failed to update staff status" }
  }
}
