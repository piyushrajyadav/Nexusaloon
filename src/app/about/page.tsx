'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

const team = [
  { name: 'Elena Rodriguez', role: 'Founder & Master Stylist', img: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1887&auto=format&fit=crop' },
  { name: 'David Kim', role: 'Senior Colorist', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop' },
  { name: 'Sarah Jenkins', role: 'Lead Esthetician', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop' },
  { name: 'Marcus Thorne', role: 'Massage Therapist', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop' }
]

export default function AboutPage() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Hero */}
      <section className='relative h-[60vh] min-h-[500px] flex items-center justify-center text-white overflow-hidden'>
        <div className='absolute inset-0 z-0'>
          <Image
            src='https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2070&auto=format&fit=crop'
            alt='Salon Team'
            fill
            className='object-cover brightness-[0.4]'
          />
        </div>
        <div className='container relative z-10 px-4 text-center'>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className='text-5xl md:text-7xl font-bold mb-6'
          >
            Our Story
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto font-light'
          >
            Founded on the belief that beauty is an art form, we have dedicated ourselves to mastering the craft of elegance.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className='py-24'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-16 items-center'>
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className='text-4xl font-bold mb-6'>A Sanctuary of Style</h2>
              <p className='text-gray-600 text-lg mb-6 leading-relaxed'>
                Since 2015, Luxe Salon has been a beacon of style and sophistication in the heart of the city. We believe that a visit to the salon should be more than just a maintenance appointment—it should be a transformative experience.
              </p>
              <p className='text-gray-600 text-lg leading-relaxed'>
                Our space is designed to be a retreat from the bustling world outside, where you can relax, recharge, and emerge feeling your absolute best. Every detail, from our curated playlist to our premium refreshments, is chosen with your comfort in mind.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className='relative h-[500px] rounded-3xl overflow-hidden shadow-2xl'
            >
              <Image
                src='https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070&auto=format&fit=crop'
                alt='Salon Interior'
                fill
                className='object-cover'
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className='py-24 bg-slate-50'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold mb-4'>Meet The Experts</h2>
            <p className='text-gray-600 max-w-2xl mx-auto'>
              Our team of dedicated professionals is passionate about helping you look and feel your best.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className='border-none shadow-lg overflow-hidden group'>
                  <div className='relative h-[350px] overflow-hidden'>
                    <Image
                      src={member.img}
                      alt={member.name}
                      fill
                      className='object-cover transition-transform duration-500 group-hover:scale-110'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                  </div>
                  <CardContent className='text-center pt-6 pb-6'>
                    <h3 className='text-xl font-bold mb-1'>{member.name}</h3>
                    <p className='text-primary font-medium'>{member.role}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}