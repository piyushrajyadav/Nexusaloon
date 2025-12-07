import { getUserBookings } from '@/app/actions/booking'
import BookingList from './BookingList'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/dashboard')
  }

  const bookings = await getUserBookings()

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
            <p className="text-gray-600">Manage your appointments and view history.</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <p className="text-sm text-gray-500">Welcome back,</p>
              <p className="font-bold">{user.email}</p>
            </div>
          </div>
        </div>
        
        <BookingList bookings={bookings} />
      </div>
    </div>
  )
}