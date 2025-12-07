import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
  // Fetch services from database
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(service)
    return acc
  }, {} as Record<string, typeof services>)

  const categories = Object.keys(groupedServices)

  return (
    <div className='min-h-screen bg-slate-50 pb-20'>
      {/* Header */}
      <div className='relative h-[400px] bg-slate-900 flex items-center justify-center text-white overflow-hidden'>
        <div className='absolute inset-0 opacity-40'>
          <Image
            src='https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop'
            alt='Services Header'
            fill
            className='object-cover'
          />
        </div>
        <div className='relative z-10 text-center px-4'>
          <h1 className='text-5xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700'>
            Our Menu
          </h1>
          <p className='text-xl text-gray-200 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100'>
            Curated treatments designed to enhance your natural beauty and provide deep relaxation.
          </p>
        </div>
      </div>

      {/* Services Tabs */}
      <div className='container mx-auto px-4 -mt-10 relative z-20'>
        {categories.length > 0 ? (
          <Tabs defaultValue={categories[0]} className='w-full'>
            <TabsList className='w-full justify-center h-auto p-2 bg-white shadow-lg rounded-full mb-12 flex-wrap'>
              {categories.map((cat) => (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  className='text-lg px-8 py-3 rounded-full data-[state=active]:bg-black data-[state=active]:text-white transition-all capitalize'
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <TabsContent key={category} value={category}>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {categoryServices.map((service) => (
                    <Card key={service.id} className='h-full hover:shadow-md transition-shadow border-none shadow-sm'>
                      <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
                        <div>
                          <CardTitle className='text-xl font-bold'>{service.name}</CardTitle>
                          <CardDescription className='mt-1 flex items-center gap-2'>
                            <Clock size={14} /> {service.duration} min
                          </CardDescription>
                        </div>
                        <div className='text-xl font-bold text-primary'>
                          ${Number(service.price).toFixed(2)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className='text-gray-600 mb-4'>{service.description}</p>
                        <Link href='/book'>
                          <Button variant='outline' size='sm' className='w-full group'>
                            Book Now 
                            <Check size={16} className='ml-2 opacity-0 group-hover:opacity-100 transition-opacity' />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <h3 className="text-2xl font-semibold text-gray-600">No services available at the moment.</h3>
            <p className="text-gray-500 mt-2">Please check back later.</p>
          </div>
        )}
      </div>

      {/* Membership Banner */}
      <div className='container mx-auto px-4 mt-24'>
        <div className='bg-black text-white rounded-3xl p-12 text-center relative overflow-hidden'>
          <div className='relative z-10'>
            <h2 className='text-3xl font-bold mb-4'>Join Our VIP Membership</h2>
            <p className='text-gray-300 mb-8 max-w-2xl mx-auto'>
              Enjoy exclusive perks, priority booking, and 20% off all retail products.
            </p>
            <Button className='bg-white text-black hover:bg-gray-200 rounded-full px-8 py-6 text-lg'>
              Learn More
            </Button>
          </div>
          <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl -mr-16 -mt-16' />
          <div className='absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl -ml-16 -mb-16' />
        </div>
      </div>
    </div>
  )
}
