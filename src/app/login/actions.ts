'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function checkUserRole() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: 'Not authenticated' }
  }

  // Check if user exists in Prisma
  let dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  })

  // If not, create them (default to CUSTOMER)
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id, // Sync Supabase ID with Prisma ID
        email: user.email!,
        role: 'CUSTOMER',
      },
    })
    
    // Also create Customer profile
    await prisma.customer.create({
      data: {
        userId: user.id,
        name: user.user_metadata.full_name || 'New Customer',
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
      return { redirect: '/book' }
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
