'use client'

import { useEffect, useState } from 'react'
import { getAdminAppointments, updateBookingStatus } from '@/app/actions/admin-appointments'
import { generateInvoice } from '@/app/actions/admin-invoices'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, CheckCircle, XCircle, Clock, FileText } from "lucide-react"
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { BookingStatus } from '@prisma/client'

import Link from 'next/link'

export default function AppointmentsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => {
    getAdminAppointments().then(setAppointments)
  }, [])

  const handleStatusChange = async (id: string, status: string) => {
    await updateBookingStatus(id, status as BookingStatus)
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a))
    toast.success(`Booking marked as ${status}`)
  }

  const handleGenerateInvoice = async (bookingId: string) => {
    const result = await generateInvoice(bookingId)
    if (result.success) {
      toast.success('Invoice generated successfully')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <Link href="/book">
          <Button>New Appointment</Button>
        </Link>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Stylist</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">
                  <div>{booking.customer.name}</div>
                  <div className="text-xs text-gray-500">{booking.customer.phone || 'No phone'}</div>
                </TableCell>
                <TableCell>{booking.service.name}</TableCell>
                <TableCell>{booking.staff?.name || 'Unassigned'}</TableCell>
                <TableCell>
                  <div>{format(new Date(booking.date), 'MMM dd, yyyy')}</div>
                  <div className="text-xs text-gray-500">{format(new Date(booking.startTime), 'h:mm a')}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    booking.status === 'CONFIRMED' ? 'default' : 
                    booking.status === 'COMPLETED' ? 'secondary' : 
                    booking.status === 'CANCELLED' ? 'destructive' : 'outline'
                  }>
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Confirm
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'COMPLETED')}>
                        <Clock className="mr-2 h-4 w-4" /> Complete
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleGenerateInvoice(booking.id)}>
                        <FileText className="mr-2 h-4 w-4" /> Generate Invoice
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'CANCELLED')} className="text-red-600">
                        <XCircle className="mr-2 h-4 w-4" /> Cancel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
