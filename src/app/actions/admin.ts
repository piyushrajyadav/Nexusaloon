'use server'

import prisma from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export async function getDashboardStats() {
  const today = new Date()
  const startOfCurrentMonth = startOfMonth(today)
  const endOfCurrentMonth = endOfMonth(today)
  const startOfLastMonth = startOfMonth(subMonths(today, 1))
  const endOfLastMonth = endOfMonth(subMonths(today, 1))

  // 1. Total Revenue (This Month vs Last Month)
  // Note: In a real app, calculate from Invoices/Payments. Using Bookings for estimation if Invoices empty.
  const currentMonthRevenue = await prisma.invoice.aggregate({
    _sum: { totalAmount: true },
    where: {
      createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
      status: 'PAID'
    }
  })

  const lastMonthRevenue = await prisma.invoice.aggregate({
    _sum: { totalAmount: true },
    where: {
      createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      status: 'PAID'
    }
  })

  // 2. Total Appointments (This Month)
  const totalAppointments = await prisma.booking.count({
    where: {
      date: { gte: startOfCurrentMonth, lte: endOfCurrentMonth }
    }
  })

  // 3. New Customers (This Month)
  const newCustomers = await prisma.customer.count({
    where: {
      createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth }
    }
  })

  // 4. Low Stock Items
  const lowStockItems = await prisma.product.count({
    where: {
      stockQuantity: { lte: 5 } // Hardcoded threshold or use field
    }
  })

  return {
    revenue: {
      current: Number(currentMonthRevenue._sum.totalAmount || 0),
      last: Number(lastMonthRevenue._sum.totalAmount || 0)
    },
    appointments: totalAppointments,
    newCustomers,
    lowStockItems
  }
}

export async function getRecentBookings() {
  return await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      service: true,
      staff: true
    }
  })
}

export async function getRevenueChartData() {
  // Get last 6 months revenue
  const data = []
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const start = startOfMonth(date)
    const end = endOfMonth(date)

    const revenue = await prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: start, lte: end },
        status: 'PAID'
      }
    })

    data.push({
      name: format(date, 'MMM'),
      total: Number(revenue._sum.totalAmount || 0)
    })
  }
  return data
}

export async function getLowStockProducts() {
  return await prisma.product.findMany({
    where: {
      stockQuantity: {
        lte: prisma.product.fields.lowStockThreshold
      }
    },
    take: 5
  })
}
