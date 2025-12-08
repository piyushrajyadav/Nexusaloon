import { getUserBookings } from '@/app/actions/booking'
import BookingList from './BookingList'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, ArrowRight, Receipt } from 'lucide-react'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { CustomerInvoiceDownload } from './CustomerInvoiceDownload'
import { getSalonSettings } from '@/app/actions/admin-settings'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/dashboard')
  }

  // Get customer profile
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: { customer: true }
  })

  // Check if user is admin or staff - redirect them appropriately
  if (dbUser?.role === 'ADMIN') {
    redirect('/admin')
  }
  if (dbUser?.role === 'STAFF') {
    redirect('/staff')
  }

  const bookings = await getUserBookings()
  const upcomingCount = bookings.filter(b =>
    new Date(b.startTime) > new Date() && b.status !== 'CANCELLED'
  ).length

  // Get customer invoices
  const invoices = dbUser?.customer ? await prisma.invoice.findMany({
    where: { customerId: dbUser.customer.id },
    orderBy: { createdAt: 'desc' },
    take: 10 // Show last 10 invoices
  }) : []

  const customerName = dbUser?.customer?.name || user.email?.split('@')[0] || 'Customer'

  // Get salon settings for PDF
  const salonSettings = await getSalonSettings()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="text-primary">{customerName}</span>!
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your appointments and book new services.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Link href="/book">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary group h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="mt-4">Book Appointment</CardTitle>
                <CardDescription>
                  Schedule a new service with your favorite stylist
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="bg-primary text-white h-full">
            <CardHeader>
              <div className="p-3 bg-white/20 rounded-xl w-fit">
                <Clock className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4 text-white">Upcoming</CardTitle>
              <CardDescription className="text-white/80">
                <span className="text-4xl font-bold text-white">{upcomingCount}</span>
                <span className="ml-2">appointments scheduled</span>
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all h-full">
            <CardHeader>
              <div className="p-3 bg-slate-100 rounded-xl w-fit">
                <User className="h-6 w-6 text-slate-600" />
              </div>
              <CardTitle className="mt-4">My Profile</CardTitle>
              <CardDescription>
                {user.email}
                {dbUser?.customer?.phone && (
                  <div className="mt-1 text-xs">{dbUser.customer.phone}</div>
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* My Invoices Section */}
        {invoices.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Receipt className="h-6 w-6 text-primary" />
                My Bills
              </h2>
            </div>
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Invoice #</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-center p-4 text-sm font-medium text-gray-600">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="p-4 font-medium">{invoice.invoiceNumber}</td>
                      <td className="p-4 text-gray-600">{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</td>
                      <td className="p-4 font-semibold">₹{Number(invoice.totalAmount).toFixed(2)}</td>
                      <td className="p-4">
                        <Badge variant={invoice.status === 'PAID' ? 'default' : 'secondary'}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <CustomerInvoiceDownload
                          invoice={invoice}
                          customerName={customerName}
                          salon={{
                            salonName: salonSettings.salonName,
                            salonAddress: salonSettings.salonAddress,
                            salonCity: salonSettings.salonCity || '',
                            gstNumber: salonSettings.gstNumber,
                            salonPhone: salonSettings.salonPhone || ''
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <BookingList bookings={bookings} />
      </div>
    </div>
  )
}