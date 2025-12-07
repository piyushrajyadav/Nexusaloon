import { getServices, getStaff } from '@/app/actions/booking'
import BookingWizard from './BookingWizard'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function BookPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/book')
  }

  const services = await getServices()
  const staffList = await getStaff()

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Book Your Appointment</h1>
          <p className="text-gray-600">Select your preferred service, stylist, and time.</p>
        </div>
        
        <BookingWizard services={services} staffList={staffList} />
      </div>
    </div>
  )
}