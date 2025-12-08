'use server'

import prisma from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'

const ServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  duration: z.coerce.number().min(1),
  category: z.string().min(1),
  imageUrl: z.string().optional(),
})

export async function createService(formData: FormData) {
  const validatedFields = ServiceSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    duration: formData.get('duration'),
    category: formData.get('category'),
    imageUrl: formData.get('imageUrl'),
  })

  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  try {
    await prisma.service.create({
      data: { ...validatedFields.data, isActive: true },
    })
    revalidatePath('/admin/services')
    revalidatePath('/services')
    revalidatePath('/book')
    revalidateTag('services')
    return { success: true }
  } catch {
    return { error: 'Failed to create service' }
  }
}

export async function deleteService(id: string) {
  try {
    await prisma.service.delete({
      where: { id },
    })
    revalidatePath('/admin/services')
    revalidatePath('/services')
    revalidatePath('/book')
    revalidateTag('services')
    return { success: true }
  } catch {
    return { error: 'Failed to delete service' }
  }
}
