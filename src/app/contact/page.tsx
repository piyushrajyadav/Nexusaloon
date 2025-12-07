'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className='min-h-screen bg-slate-50 pt-32 pb-20'>
      <div className='container mx-auto px-4'>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center mb-16'
        >
          <h1 className='text-5xl font-bold mb-6'>Get in Touch</h1>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            We&apos;d love to hear from you. Book an appointment, ask a question, or just say hello.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto'>
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className='space-y-8'
          >
            <div className='bg-white p-8 rounded-3xl shadow-sm'>
              <h3 className='text-2xl font-bold mb-6'>Contact Information</h3>
              <div className='space-y-6'>
                <div className='flex items-start gap-4'>
                  <div className='bg-primary/10 p-3 rounded-full text-primary'>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className='font-bold text-lg'>Visit Us</p>
                    <p className='text-gray-600'>123 Luxury Lane, Beverly Hills, CA 90210</p>
                  </div>
                </div>
                <div className='flex items-start gap-4'>
                  <div className='bg-primary/10 p-3 rounded-full text-primary'>
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className='font-bold text-lg'>Call Us</p>
                    <p className='text-gray-600'>+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className='flex items-start gap-4'>
                  <div className='bg-primary/10 p-3 rounded-full text-primary'>
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className='font-bold text-lg'>Email Us</p>
                    <p className='text-gray-600'>hello@luxesalon.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-white p-8 rounded-3xl shadow-sm'>
              <h3 className='text-2xl font-bold mb-6'>Opening Hours</h3>
              <div className='space-y-4'>
                <div className='flex justify-between items-center border-b pb-2'>
                  <span className='text-gray-600'>Monday - Friday</span>
                  <span className='font-bold'>9:00 AM - 8:00 PM</span>
                </div>
                <div className='flex justify-between items-center border-b pb-2'>
                  <span className='text-gray-600'>Saturday</span>
                  <span className='font-bold'>10:00 AM - 6:00 PM</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Sunday</span>
                  <span className='font-bold text-primary'>Closed</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className='bg-white p-8 md:p-10 rounded-3xl shadow-lg'
          >
            <h3 className='text-2xl font-bold mb-2'>Send a Message</h3>
            <p className='text-gray-500 mb-8'>Fill out the form below and we&apos;ll get back to you shortly.</p>
            
            <form className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>First Name</label>
                  <Input placeholder='Jane' />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Last Name</label>
                  <Input placeholder='Doe' />
                </div>
              </div>
              
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Email</label>
                <Input type='email' placeholder='jane@example.com' />
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Subject</label>
                <Input placeholder='Inquiry about services' />
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Message</label>
                <Textarea placeholder='How can we help you?' className='min-h-[150px]' />
              </div>

              <Button size='lg' className='w-full text-lg'>Send Message</Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}