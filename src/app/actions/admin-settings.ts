'use server'

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import fs from 'fs/promises'
import path from 'path'

// Settings file path (in a real production app, this would be in a database)
const SETTINGS_FILE = path.join(process.cwd(), 'salon-settings.json')

// Default settings
const defaultSettings = {
  // Salon Information
  salonName: 'NexuSalon',
  salonAddress: '123 Beauty Street, Fashion District',
  salonCity: 'Mumbai, Maharashtra 400001',
  salonPhone: '+91 98765 43210',
  salonEmail: 'info@nexusalon.com',
  salonWebsite: 'www.nexusalon.com',

  // Invoice Settings
  gstNumber: 'GST27AABCT1234D1ZD',
  gstRate: 18, // 18% GST
  invoicePrefix: 'INV',
  invoiceFooter: 'Thank you for choosing our salon!',

  // Business Hours
  openTime: '09:00',
  closeTime: '20:00',

  // Currency
  currency: '₹',
  currencyCode: 'INR'
}

export type SalonSettings = typeof defaultSettings

// Get settings from file
export async function getSalonSettings(): Promise<SalonSettings> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8')
    return { ...defaultSettings, ...JSON.parse(data) }
  } catch {
    // File doesn't exist, return defaults
    return defaultSettings
  }
}

// Save settings to file
export async function saveSalonSettings(settings: Partial<SalonSettings>) {
  try {
    const currentSettings = await getSalonSettings()
    const newSettings = { ...currentSettings, ...settings }
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(newSettings, null, 2))
    revalidatePath('/admin/settings')
    revalidatePath('/admin/invoices')
    return { success: true }
  } catch (error) {
    console.error('Failed to save settings:', error)
    return { success: false, error: 'Failed to save settings' }
  }
}

// Password update
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
