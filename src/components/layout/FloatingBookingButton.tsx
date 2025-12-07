'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CalendarCheck } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export function FloatingBookingButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Link href="/book">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg rounded-full px-6 py-4 flex items-center gap-2 font-semibold transition-all hover:scale-105">
              <CalendarCheck size={20} />
              Book Appointment
            </button>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
