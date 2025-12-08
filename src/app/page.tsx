'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Star, ArrowRight, Clock, ShieldCheck } from 'lucide-react'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function Home() {
  return (
    <div className='overflow-hidden'>
      {/* Hero Section */}
      <section className='relative h-screen min-h-[600px] flex items-center justify-center text-white bg-slate-900'>
        <div className='absolute inset-0 z-0'>
          <Image
            src='https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop'
            alt='Luxury Salon Interior'
            fill
            className='object-cover brightness-[0.3]'
            priority
          />
        </div>
        <div className='container relative z-10 px-4 text-center'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className='text-5xl md:text-7xl font-bold mb-6 tracking-tight'>
              Redefine Your <span className='text-primary-foreground bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-yellow-500'>Elegance</span>
            </h1>
            <p className='text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto font-light'>
              Experience world-class hair styling, skincare, and spa treatments in a sanctuary of luxury.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link href='/book'>
                <Button size='lg' className='text-lg px-8 py-6 rounded-full bg-white text-black hover:bg-gray-100'>
                  Book Appointment
                </Button>
              </Link>
              <Link href='/services'>
                <Button size='lg' className='text-lg px-8 py-6 rounded-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all'>
                  View Services
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 bg-white'>
        <div className='container mx-auto px-4'>
          <motion.div
            variants={stagger}
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            className='grid grid-cols-1 md:grid-cols-3 gap-8'
          >
            {[
              { icon: Star, title: 'Expert Stylists', desc: 'Award-winning professionals dedicated to your perfect look.' },
              { icon: ShieldCheck, title: 'Premium Products', desc: 'We use only the finest, eco-friendly beauty products.' },
              { icon: Clock, title: 'Relaxing Atmosphere', desc: 'A serene environment designed for your ultimate comfort.' }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeIn} className='text-center p-6 rounded-2xl bg-slate-50 hover:shadow-lg transition-shadow'>
                <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6'>
                  <feature.icon size={32} />
                </div>
                <h3 className='text-xl font-semibold mb-3'>{feature.title}</h3>
                <p className='text-gray-600'>{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Preview */}
      <section className='py-24 bg-slate-50'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>Our Signature Services</h2>
            <p className='text-gray-600 max-w-2xl mx-auto'>Discover our range of premium treatments designed to rejuvenate your body and mind.</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[
              { title: 'Hair Styling', img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop' },
              { title: 'Spa Treatments', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop' },
              { title: 'Manicure', img: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=2070&auto=format&fit=crop' },
              { title: 'Makeup', img: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2070&auto=format&fit=crop' }
            ].map((service, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className='group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer'
              >
                <Image
                  src={service.img}
                  alt={service.title}
                  fill
                  className='object-cover transition-transform duration-500 group-hover:scale-110'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6'>
                  <h3 className='text-white text-2xl font-bold mb-2'>{service.title}</h3>
                  <Link href='/services' className='text-white/80 flex items-center gap-2 text-sm font-medium group-hover:text-white'>
                    Explore <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className='text-center mt-12'>
            <Link href='/services'>
              <Button variant='outline' size='lg' className='rounded-full px-8'>View All Services</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='py-24 bg-white'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-16'>Client Stories</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {[
              { name: 'Sarah Johnson', role: 'Regular Client', text: 'The best salon experience I\'ve ever had. The staff is incredibly professional and the atmosphere is pure luxury.' },
              { name: 'Michael Chen', role: 'VIP Member', text: 'I\'ve been coming here for 2 years. Their attention to detail and customer service is unmatched in the city.' },
              { name: 'Emma Davis', role: 'Bride', text: 'They made me look absolutely stunning for my wedding day. I couldn\'t have asked for a better team.' }
            ].map((testimonial, index) => (
              <Card key={index} className='border-none shadow-lg bg-slate-50'>
                <CardContent className='pt-8 px-8 pb-8'>
                  <div className='flex gap-1 text-yellow-400 mb-4'>
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill='currentColor' />)}
                  </div>
                  <p className='text-gray-600 mb-6 italic'>&quot;{testimonial.text}&quot;</p>
                  <div>
                    <p className='font-bold text-lg'>{testimonial.name}</p>
                    <p className='text-sm text-gray-500'>{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-24 bg-slate-900 text-white relative overflow-hidden'>
        <div className='absolute inset-0 opacity-20'>
          <Image
            src='https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2036&auto=format&fit=crop'
            alt='Background'
            fill
            className='object-cover'
          />
        </div>
        <div className='container relative z-10 px-4 text-center'>
          <h2 className='text-4xl md:text-5xl font-bold mb-6'>Ready to Transform Your Look?</h2>
          <p className='text-xl text-gray-300 mb-10 max-w-2xl mx-auto'>Book your appointment today and step into a world of elegance and style.</p>
          <Link href='/book'>
            <Button size='lg' className='text-lg px-10 py-6 rounded-full bg-white text-black hover:bg-gray-100'>
              Book Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}