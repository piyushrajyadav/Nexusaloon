'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function checkUserRole() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: 'Not authenticated' }
  }

  // Check if user exists in Prisma
  let dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: { customer: true }
  })

  // If not, create them (default to CUSTOMER)
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id, // Sync Supabase ID with Prisma ID
        email: user.email!,
        role: 'CUSTOMER',
      },
      include: { customer: true }
    })

    // Also create Customer profile with name and phone from signup
    const userName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer'
    const userPhone = user.user_metadata?.phone || null

    await prisma.customer.create({
      data: {
        userId: user.id,
        name: userName,
        phone: userPhone
      }
    })
  }

  // Return redirect path based on role
  switch (dbUser.role) {
    case 'ADMIN':
      return { redirect: '/admin' }
    case 'STAFF':
      return { redirect: '/staff' }
    default:
      return { redirect: '/dashboard' }
  }
}

// Create or update customer profile with name and phone
export async function createCustomerProfile(name: string, phone?: string) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Find or create user
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          role: 'CUSTOMER',
        }
      })
    }

    // Find or create customer profile
    const existingCustomer = await prisma.customer.findUnique({
      where: { userId: dbUser.id }
    })

    if (existingCustomer) {
      // Update existing customer
      await prisma.customer.update({
        where: { userId: dbUser.id },
        data: {
          name: name || existingCustomer.name,
          phone: phone || existingCustomer.phone
        }
      })
    } else {
      // Create new customer
      await prisma.customer.create({
        data: {
          userId: dbUser.id,
          name: name,
          phone: phone || null
        }
      })
    }

    return { success: true }
  } catch (err) {
    console.error('Error creating customer profile:', err)
    return { error: 'Failed to create profile' }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
