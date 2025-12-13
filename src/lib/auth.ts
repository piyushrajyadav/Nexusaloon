import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function getSession() {
  const supabase = await createClient()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export async function getUserRole() {
  const user = await getSession()
  if (!user) return null

  const supabase = await createClient()
  const { data: dbUser } = await supabase
    .from('User')
    .select('role')
    .eq('email', user.email)
    .single()

  return dbUser?.role
}

export async function requireAuth() {
  const user = await getSession()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  const role = await getUserRole()

  if (role !== 'ADMIN') {
    redirect('/')
  }
  return user
}

export async function requireStaff() {
  const user = await requireAuth()
  const role = await getUserRole()

  if (role !== 'STAFF' && role !== 'ADMIN') {
    redirect('/')
  }
  return user
}
