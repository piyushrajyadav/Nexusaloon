'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { X } from 'lucide-react'

const images = [
  { src: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop', category: 'Hair', title: 'Blonde Balayage' },
  { src: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=2070&auto=format&fit=crop', category: 'Nails', title: 'Minimalist Art' },
  { src: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2070&auto=format&fit=crop', category: 'Makeup', title: 'Bridal Glam' },
  { src: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop', category: 'Hair', title: 'Textured Bob' },
  { src: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=2070&auto=format&fit=crop', category: 'Spa', title: 'Relaxation Room' },
  { src: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2036&auto=format&fit=crop', category: 'Interior', title: 'Main Lounge' },
  { src: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=2078&auto=format&fit=crop', category: 'Hair', title: 'Vivid Colors' },
  { src: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1935&auto=format&fit=crop', category: 'Makeup', title: 'Editorial Look' },
  { src: 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?q=80&w=2070&auto=format&fit=crop', category: 'Hair', title: 'Classic Updo' },
]

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <div className='min-h-screen bg-white pb-20'>
      <div className='pt-32 pb-12 text-center container mx-auto px-4'>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-5xl font-bold mb-6'
        >
          Our Portfolio
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='text-xl text-gray-600 max-w-2xl mx-auto'
        >
          A visual journey through our finest work and the serene atmosphere of our salon.
        </motion.p>
      </div>

      <div className='container mx-auto px-4'>
        <div className='columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8'>
          {images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className='break-inside-avoid relative group cursor-zoom-in rounded-2xl overflow-hidden'
              onClick={() => setSelectedImage(img.src)}
            >
              <Image
                src={img.src}
                alt={img.title}
                width={800}
                height={600}
                className='w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105'
              />
              <div className='absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end p-6'>
                <div className='text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0'>
                  <p className='text-sm font-medium text-amber-300 mb-1'>{img.category}</p>
                  <h3 className='text-xl font-bold'>{img.title}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4'
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className='absolute top-6 right-6 text-white hover:text-gray-300 transition-colors'
            onClick={() => setSelectedImage(null)}
          >
            <X size={40} />
          </button>
          <div className='relative w-full max-w-5xl h-[80vh]' onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedImage}
              alt='Gallery Preview'
              fill
              className='object-contain'
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}