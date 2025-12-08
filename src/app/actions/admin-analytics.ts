'use server'

import prisma from "@/lib/prisma"
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths, format, eachDayOfInterval, startOfWeek, endOfWeek, subDays } from "date-fns"

// Get revenue stats for dashboard
export async function getRevenueStats() {
    try {
        const now = new Date()
        const currentMonthStart = startOfMonth(now)
        const currentMonthEnd = endOfMonth(now)
        const lastMonthStart = startOfMonth(subMonths(now, 1))
        const lastMonthEnd = endOfMonth(subMonths(now, 1))

        // Current month revenue
        const currentMonthRevenue = await prisma.invoice.aggregate({
            _sum: { totalAmount: true },
            where: {
                status: 'PAID',
                createdAt: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd
                }
            }
        })

        // Last month revenue
        const lastMonthRevenue = await prisma.invoice.aggregate({
            _sum: { totalAmount: true },
            where: {
                status: 'PAID',
                createdAt: {
                    gte: lastMonthStart,
                    lte: lastMonthEnd
                }
            }
        })

        // Today's revenue
        const todayRevenue = await prisma.invoice.aggregate({
            _sum: { totalAmount: true },
            where: {
                status: 'PAID',
                createdAt: {
                    gte: startOfDay(now),
                    lte: endOfDay(now)
                }
            }
        })

        return {
            success: true,
            data: {
                currentMonth: Number(currentMonthRevenue._sum.totalAmount || 0),
                lastMonth: Number(lastMonthRevenue._sum.totalAmount || 0),
                today: Number(todayRevenue._sum.totalAmount || 0),
            }
        }
    } catch (error) {
        console.error("Failed to fetch revenue stats:", error)
        return { success: false, error: "Failed to fetch revenue stats" }
    }
}

// Get booking stats
export async function getBookingStats() {
    try {
        const now = new Date()
        const weekStart = startOfWeek(now)
        const weekEnd = endOfWeek(now)

        const [pending, confirmed, completed, cancelled, thisWeek] = await Promise.all([
            prisma.booking.count({ where: { status: 'PENDING' } }),
            prisma.booking.count({ where: { status: 'CONFIRMED' } }),
            prisma.booking.count({ where: { status: 'COMPLETED' } }),
            prisma.booking.count({ where: { status: 'CANCELLED' } }),
            prisma.booking.count({
                where: {
                    createdAt: { gte: weekStart, lte: weekEnd }
                }
            })
        ])

        return {
            success: true,
            data: {
                pending,
                confirmed,
                completed,
                cancelled,
                thisWeek,
                total: pending + confirmed + completed + cancelled
            }
        }
    } catch (error) {
        console.error("Failed to fetch booking stats:", error)
        return { success: false, error: "Failed to fetch booking stats" }
    }
}

// Get daily revenue for chart (last 7 days)
export async function getDailyRevenue() {
    try {
        const now = new Date()
        const last7Days = eachDayOfInterval({
            start: subDays(now, 6),
            end: now
        })

        const dailyData = await Promise.all(
            last7Days.map(async (day) => {
                const revenue = await prisma.invoice.aggregate({
                    _sum: { totalAmount: true },
                    where: {
                        status: 'PAID',
                        createdAt: {
                            gte: startOfDay(day),
                            lte: endOfDay(day)
                        }
                    }
                })
                return {
                    date: format(day, 'MMM dd'),
                    day: format(day, 'EEE'),
                    revenue: Number(revenue._sum.totalAmount || 0)
                }
            })
        )

        return { success: true, data: dailyData }
    } catch (error) {
        console.error("Failed to fetch daily revenue:", error)
        return { success: false, error: "Failed to fetch daily revenue" }
    }
}

// Get monthly revenue for chart (last 6 months)
export async function getMonthlyRevenue() {
    try {
        const now = new Date()
        const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i))

        const monthlyData = await Promise.all(
            months.map(async (month) => {
                const revenue = await prisma.invoice.aggregate({
                    _sum: { totalAmount: true },
                    where: {
                        status: 'PAID',
                        createdAt: {
                            gte: startOfMonth(month),
                            lte: endOfMonth(month)
                        }
                    }
                })
                return {
                    month: format(month, 'MMM'),
                    revenue: Number(revenue._sum.totalAmount || 0)
                }
            })
        )

        return { success: true, data: monthlyData }
    } catch (error) {
        console.error("Failed to fetch monthly revenue:", error)
        return { success: false, error: "Failed to fetch monthly revenue" }
    }
}

// Get payment method breakdown
export async function getPaymentMethodStats() {
    try {
        const paymentsByMethod = await prisma.payment.groupBy({
            by: ['method'],
            _sum: { amount: true },
            _count: true,
            where: { status: 'PAID' }
        })

        const data = paymentsByMethod.map(p => ({
            method: p.method,
            amount: Number(p._sum.amount || 0),
            count: p._count
        }))

        return { success: true, data }
    } catch (error) {
        console.error("Failed to fetch payment stats:", error)
        return { success: false, error: "Failed to fetch payment stats" }
    }
}

// Get top services by revenue
export async function getTopServices() {
    try {
        const services = await prisma.service.findMany({
            include: {
                bookings: {
                    where: { status: 'COMPLETED' },
                    include: {
                        invoice: {
                            where: { status: 'PAID' }
                        }
                    }
                }
            }
        })

        const serviceData = services
            .map(service => ({
                name: service.name,
                bookings: service.bookings.length,
                revenue: service.bookings.reduce((sum, booking) => {
                    return sum + (booking.invoice ? Number(booking.invoice.totalAmount) : 0)
                }, 0)
            }))
            .filter(s => s.bookings > 0)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        return { success: true, data: serviceData }
    } catch (error) {
        console.error("Failed to fetch top services:", error)
        return { success: false, error: "Failed to fetch top services" }
    }
}
