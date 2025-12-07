'use server'

import prisma from '@/lib/prisma'

export async function createAdminInDb(id: string, email: string) {
  try {
    await prisma.user.upsert({
      where: { email },
      update: { role: 'ADMIN' },
      create: {
        id,
        email,
        role: 'ADMIN',
      },
    })
    return { success: true }
  } catch (error) {
    console.error('Error creating admin:', error)
    return { error: 'Failed to create admin in database' }
  }
}

export async function createStaffInDb(id: string, email: string) {
  try {
    await prisma.user.upsert({
      where: { email },
      update: { role: 'STAFF' },
      create: {
        id,
        email,
        role: 'STAFF',
      },
    })
    return { success: true }
  } catch (error) {
    console.error('Error creating staff:', error)
    return { error: 'Failed to create staff in database' }
  }
}
