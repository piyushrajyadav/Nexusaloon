'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Check, ChevronRight, ChevronLeft, Calendar as CalendarIcon, Clock, User, Scissors } from 'lucide-react'
import { getAvailableSlots, createBooking } from '@/app/actions/booking'
import { useRouter } from 'next/navigation'

type Service = {
  id: string
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  price: any
  duration: number
}

type Staff = {
  id: string
  name: string
  specialization: string | null
}

export default function BookingWizard({ services, staffList }: { services: Service[], staffList: Staff[] }) {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [timeSlot, setTimeSlot] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Fetch slots when date or staff changes
  useEffect(() => {
    if (date && selectedStaff && selectedService) {
      setLoadingSlots(true)
      getAvailableSlots(date, selectedStaff.id, selectedService.duration)
        .then(setAvailableSlots)
        .finally(() => setLoadingSlots(false))
    }
  }, [date, selectedStaff, selectedService])

  const handleNext = () => {
    if (step === 1 && !selectedService) return
    if (step === 2 && !selectedStaff) return
    if (step === 3 && (!date || !timeSlot)) return
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!selectedService || !selectedStaff || !date || !timeSlot) return

    setIsSubmitting(true)
    const result = await createBooking({
      serviceId: selectedService.id,
      staffId: selectedStaff.id,
      date: date,
      time: timeSlot
    })

    if (result.success) {
      toast({
        title: "Booking Confirmed!",
        description: "We've sent a confirmation to your email.",
      })
      router.push('/dashboard')
    } else {
      toast({
        title: "Booking Failed",
        description: result.error || "Something went wrong. Please try again.",
        variant: "destructive"
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {['Service', 'Stylist', 'Time', 'Confirm'].map((label, i) => (
            <span key={i} className={`text-sm font-medium ${step > i ? 'text-primary' : 'text-gray-400'}`}>
              {label}
            </span>
          ))}
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card 
                  key={service.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${selectedService?.id === service.id ? 'border-primary ring-2 ring-primary/20' : ''}`}
                  onClick={() => setSelectedService(service)}
                >
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{service.name}</h3>
                      <p className="text-sm text-gray-500">{service.duration} mins</p>
                    </div>
                    <div className="text-primary font-bold text-xl">
                      ${Number(service.price)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {staffList.map((staff) => (
                <Card 
                  key={staff.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${selectedStaff?.id === staff.id ? 'border-primary ring-2 ring-primary/20' : ''}`}
                  onClick={() => setSelectedStaff(staff)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <User size={32} className="text-gray-400" />
                    </div>
                    <h3 className="font-bold">{staff.name}</h3>
                    <p className="text-sm text-gray-500">{staff.specialization || 'Stylist'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border shadow-sm bg-white"
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-4">Available Slots</h3>
                {loadingSlots ? (
                  <div className="text-center py-8 text-gray-500">Checking availability...</div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={timeSlot === slot ? "default" : "outline"}
                        onClick={() => setTimeSlot(slot)}
                        className="w-full"
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No slots available for this date.
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Confirm Booking</h2>
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <Scissors className="text-primary" />
                      <span className="text-gray-600">Service</span>
                    </div>
                    <span className="font-bold">{selectedService?.name}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <User className="text-primary" />
                      <span className="text-gray-600">Stylist</span>
                    </div>
                    <span className="font-bold">{selectedStaff?.name}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="text-primary" />
                      <span className="text-gray-600">Date</span>
                    </div>
                    <span className="font-bold">{date ? format(date, 'PPP') : ''}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <Clock className="text-primary" />
                      <span className="text-gray-600">Time</span>
                    </div>
                    <span className="font-bold">{timeSlot}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-primary">${Number(selectedService?.price)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1 || isSubmitting}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        {step < 4 ? (
          <Button onClick={handleNext} disabled={
            (step === 1 && !selectedService) ||
            (step === 2 && !selectedStaff) ||
            (step === 3 && (!date || !timeSlot))
          }>
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
            {isSubmitting ? 'Confirming...' : 'Confirm Booking'} <Check className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}