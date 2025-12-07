'use client'

import { useState } from 'react'
import { format, isPast } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Scissors, AlertCircle } from 'lucide-react'
import { cancelBooking } from '@/app/actions/booking'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Booking = {
  id: string
  date: Date
  startTime: Date
  status: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  service: { name: string; price: any; duration: number }
  staff: { name: string } | null
}

export default function BookingList({ bookings }: { bookings: Booking[] }) {
  const { toast } = useToast()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCancelling, setIsCancelling] = useState(false)

  const handleCancel = async (id: string) => {
    setIsCancelling(true)
    const result = await cancelBooking(id)
    setIsCancelling(false)

    if (result.success) {
      toast({
        title: "Booking Cancelled",
        description: "Your appointment has been cancelled.",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to cancel booking.",
        variant: "destructive"
      })
    }
  }

  const upcomingBookings = bookings.filter(b => !isPast(new Date(b.startTime)) && b.status !== 'CANCELLED')
  const pastBookings = bookings.filter(b => isPast(new Date(b.startTime)) || b.status === 'CANCELLED')

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="text-primary" /> Upcoming Appointments
        </h2>
        {upcomingBookings.length === 0 ? (
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Calendar size={48} className="mb-4 opacity-20" />
              <p>No upcoming appointments.</p>
              <Button variant="link" className="mt-2" asChild>
                <a href="/book">Book Now</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {upcomingBookings.map((booking) => (
              <Card key={booking.id} className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{booking.service.name}</CardTitle>
                      <CardDescription>{format(new Date(booking.date), 'EEEE, MMMM do, yyyy')}</CardDescription>
                    </div>
                    <Badge>{booking.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} />
                      <span>{format(new Date(booking.startTime), 'h:mm a')} ({booking.service.duration} mins)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <User size={16} />
                      <span>with {booking.staff?.name || 'Any Stylist'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Scissors size={16} />
                      <span>${Number(booking.service.price)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-full">Cancel Appointment</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will cancel your appointment for {booking.service.name} on {format(new Date(booking.date), 'MMM do')}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleCancel(booking.id)} className="bg-red-600 hover:bg-red-700">
                          Yes, Cancel
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-500">History</h2>
        <div className="space-y-4">
          {pastBookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-4 bg-white rounded-lg border opacity-75 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${booking.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                  {booking.status === 'CANCELLED' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                </div>
                <div>
                  <p className="font-bold">{booking.service.name}</p>
                  <p className="text-sm text-gray-500">{format(new Date(booking.date), 'MMM do, yyyy')} • {format(new Date(booking.startTime), 'h:mm a')}</p>
                </div>
              </div>
              <Badge variant={booking.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
                {booking.status}
              </Badge>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function CheckCircle({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}