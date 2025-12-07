'use server'

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function updatePassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user || !user.password) {
      return { success: false, error: "User not found" }
    }

    const isValid = await bcrypt.compare(currentPassword, user.password)

    if (!isValid) {
      return { success: false, error: "Incorrect current password" }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to update password:", error)
    return { success: false, error: "Failed to update password" }
  }
}
