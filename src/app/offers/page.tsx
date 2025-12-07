'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Timer, Gift, Sparkles } from 'lucide-react'
import Link from 'next/link'

const offers = [
  {
    title: 'New Client Special',
    desc: 'Experience our luxury services for the first time with an exclusive discount.',
    discount: '20% OFF',
    code: 'WELCOME20',
    validUntil: 'Ongoing',
    icon: Sparkles,
    color: 'bg-amber-100 text-amber-600'
  },
  {
    title: 'Summer Glow Package',
    desc: 'Includes a full body exfoliation, spray tan, and express manicure.',
    discount: '$150 (Save $45)',
    code: 'SUMMERGLOW',
    validUntil: 'August 31st',
    icon: Gift,
    color: 'bg-rose-100 text-rose-600'
  },
  {
    title: 'Weekday Bliss',
    desc: 'Book any massage or facial between 10am - 2pm, Tuesday through Thursday.',
    discount: '15% OFF',
    code: 'WEEKDAY15',
    validUntil: 'Limited Time',
    icon: Timer,
    color: 'bg-blue-100 text-blue-600'
  }
]

export default function OffersPage() {
  return (
    <div className='min-h-screen bg-slate-50 pt-32 pb-20'>
      <div className='container mx-auto px-4'>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center mb-16'
        >
          <Badge className='mb-4 px-4 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 border-none'>
            Limited Time Specials
          </Badge>
          <h1 className='text-5xl font-bold mb-6'>Exclusive Offers</h1>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            Treat yourself to luxury for less with our seasonal packages and promotions.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto'>
          {offers.map((offer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className='h-full border-none shadow-lg hover:shadow-xl transition-shadow overflow-hidden relative'>
                <div className={`absolute top-0 right-0 p-4 rounded-bl-3xl ${offer.color}`}>
                  <offer.icon size={24} />
                </div>
                <CardHeader className='pt-12 pb-4'>
                  <CardTitle className='text-2xl font-bold'>{offer.title}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <p className='text-gray-600'>{offer.desc}</p>
                  <div className='flex items-center justify-between bg-slate-100 p-3 rounded-lg'>
                    <span className='font-mono font-bold text-gray-700'>{offer.code}</span>
                    <span className='text-sm text-gray-500'>Use at checkout</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <Timer size={14} />
                    <span>Valid until: {offer.validUntil}</span>
                  </div>
                </CardContent>
                <CardFooter className='flex items-center justify-between border-t pt-6 bg-slate-50/50'>
                  <span className='text-xl font-bold text-primary'>{offer.discount}</span>
                  <Link href='/book'>
                    <Button>Book Now</Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}