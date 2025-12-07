'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getAdminServices() {
  return await prisma.service.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function createService(data: FormData) {
  const name = data.get('name') as string
  const price = Number(data.get('price'))
  const duration = Number(data.get('duration'))
  const description = data.get('description') as string

  await prisma.service.create({
    data: {
      name,
      price,
      duration,
      description,
      isActive: true
    }
  })
  revalidatePath('/admin/services')
}

export async function toggleServiceStatus(id: string, isActive: boolean) {
  await prisma.service.update({
    where: { id },
    data: { isActive }
  })
  revalidatePath('/admin/services')
}
