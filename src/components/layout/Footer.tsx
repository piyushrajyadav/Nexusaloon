import Link from 'next/link'
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Scissors } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-200 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white text-black p-2 rounded-full">
                <Scissors size={20} />
              </div>
              <span className="text-xl font-bold text-white">SALON LUXE</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Experience the art of beauty with our premium salon services. 
              Dedicated to making you look and feel your absolute best.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="hover:text-white transition-colors"><Instagram size={20} /></Link>
              <Link href="#" className="hover:text-white transition-colors"><Facebook size={20} /></Link>
              <Link href="#" className="hover:text-white transition-colors"><Twitter size={20} /></Link>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Services</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>Hair Cutting & Styling</li>
              <li>Hair Coloring</li>
              <li>Facial Treatments</li>
              <li>Manicure & Pedicure</li>
              <li>Bridal Makeup</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Contact Info</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0" />
                <span>123 Luxury Avenue, Fashion District, NY 10012</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} />
                <span>hello@salonluxe.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Salon Luxe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
