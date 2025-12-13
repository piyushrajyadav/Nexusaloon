'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Check, ChevronRight, ChevronLeft, Calendar as CalendarIcon, Clock, User, Scissors, AlertCircle, Loader2 } from 'lucide-react'
import { getAvailableSlots, createBooking } from '@/app/actions/booking'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Service = {
  id: string
  name: string
  description?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  price: any
  duration: number
  category?: string
  imageUrl?: string | null
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
  // Fetch available slots when date changes (for any staff or specific staff)
  useEffect(() => {
    if (date && selectedService) {
      setLoadingSlots(true)
      // If no specific staff selected, pass empty string to get general availability
      const staffId = selectedStaff?.id || ''
      getAvailableSlots(date, staffId, selectedService.duration)
        .then(setAvailableSlots)
        .finally(() => setLoadingSlots(false))
    }
  }, [date, selectedStaff, selectedService])

  const handleNext = () => {
    if (step === 1 && !selectedService) return
    // Step 2: Allow proceeding - null means "Any Available" which is valid
    if (step === 3 && (!date || !timeSlot)) return
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!selectedService || !date || !timeSlot) return

    setIsSubmitting(true)
    const result = await createBooking({
      serviceId: selectedService.id,
      staffId: selectedStaff?.id || null, // null means "any available"
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

  // No services available
  if (services.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-orange-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Services Available</h2>
          <p className="text-muted-foreground mb-6">
            There are no services available for booking at the moment.
            Please check back later or contact us for assistance.
          </p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {['Service', 'Stylist', 'Date & Time', 'Confirm'].map((label, i) => (
            <span key={i} className={`text-sm font-medium ${step > i ? 'text-primary' : step === i + 1 ? 'text-foreground' : 'text-gray-400'}`}>
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
          {/* Step 1: Select Service */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Choose a Service</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all hover:shadow-lg overflow-hidden ${selectedService?.id === service.id ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}`}
                    onClick={() => setSelectedService(service)}
                  >
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Service Image */}
                        {service.imageUrl ? (
                          <div className="w-28 h-28 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={service.imageUrl}
                              alt={service.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-28 h-28 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <Scissors className="h-10 w-10 text-slate-400" />
                          </div>
                        )}
                        {/* Service Info */}
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{service.name}</h3>
                            {service.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{service.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {service.duration} mins
                              </span>
                              {service.category && (
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">
                                  {service.category}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xl font-bold text-primary">
                              ₹{Number(service.price)}
                            </div>
                            {selectedService?.id === service.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Staff (Optional) */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Choose Your Stylist</h2>
              <p className="text-muted-foreground mb-4">Select a stylist or let us assign one for you</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Any Available Option - Always show first */}
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg ${selectedStaff === null ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}`}
                  onClick={() => setSelectedStaff(null)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <User size={36} className="text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg">Any Available</h3>
                    <p className="text-sm text-muted-foreground">Let us assign the best stylist</p>
                    {selectedStaff === null && (
                      <Check className="h-5 w-5 text-primary mt-3 mx-auto" />
                    )}
                  </CardContent>
                </Card>

                {/* Individual Stylists */}
                {staffList.map((staff) => (
                  <Card
                    key={staff.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${selectedStaff?.id === staff.id ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}`}
                    onClick={() => setSelectedStaff(staff)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <User size={36} className="text-primary" />
                      </div>
                      <h3 className="font-bold text-lg">{staff.name}</h3>
                      <p className="text-sm text-muted-foreground">{staff.specialization || 'Hair Stylist'}</p>
                      {selectedStaff?.id === staff.id && (
                        <Check className="h-5 w-5 text-primary mt-3 mx-auto" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Pick Date & Time</h2>
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
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Available Time Slots
                  </h3>
                  {loadingSlots ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Checking availability...
                    </div>
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
                    <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-400" />
                      No slots available for this date.
                      <br />
                      <span className="text-sm">Try selecting a different date.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <Card className="border-2 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Confirm Your Booking</h2>
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Scissors className="text-primary h-5 w-5" />
                      </div>
                      <span className="text-muted-foreground">Service</span>
                    </div>
                    <span className="font-bold">{selectedService?.name}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="text-primary h-5 w-5" />
                      </div>
                      <span className="text-muted-foreground">Stylist</span>
                    </div>
                    <span className="font-bold">{selectedStaff?.name}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CalendarIcon className="text-primary h-5 w-5" />
                      </div>
                      <span className="text-muted-foreground">Date</span>
                    </div>
                    <span className="font-bold">{date ? format(date, 'PPP') : ''}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Clock className="text-primary h-5 w-5" />
                      </div>
                      <span className="text-muted-foreground">Time</span>
                    </div>
                    <span className="font-bold">{timeSlot}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Clock className="text-primary h-5 w-5" />
                      </div>
                      <span className="text-muted-foreground">Duration</span>
                    </div>
                    <span className="font-bold">{selectedService?.duration} minutes</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 bg-primary/5 -mx-4 px-4 py-4 rounded-lg">
                    <span className="text-lg font-bold">Total Amount</span>
                    <span className="text-3xl font-bold text-primary">₹{Number(selectedService?.price)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1 || isSubmitting}
          className="px-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        {step < 4 ? (
          <Button
            onClick={handleNext}
            disabled={
              (step === 1 && !selectedService) ||
              (step === 3 && (!date || !timeSlot))
            }
            className="px-6"
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                Confirm Booking <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}