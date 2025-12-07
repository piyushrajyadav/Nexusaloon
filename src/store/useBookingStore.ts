import { create } from 'zustand'

interface BookingState {
  selectedServiceId: string | null
  selectedDate: Date | null
  selectedTime: string | null
  setSelectedServiceId: (id: string | null) => void
  setSelectedDate: (date: Date | null) => void
  setSelectedTime: (time: string | null) => void
  resetBooking: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedServiceId: null,
  selectedDate: null,
  selectedTime: null,
  setSelectedServiceId: (id) => set({ selectedServiceId: id }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  resetBooking: () => set({ selectedServiceId: null, selectedDate: null, selectedTime: null }),
}))
