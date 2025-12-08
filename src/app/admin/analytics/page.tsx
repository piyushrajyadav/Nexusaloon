'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    DollarSign,
    TrendingUp,
    Calendar,
    CreditCard,
    Loader2
} from 'lucide-react'
import {
    getRevenueStats,
    getBookingStats,
    getDailyRevenue,
    getMonthlyRevenue,
    getTopServices
} from '@/app/actions/admin-analytics'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true)
    const [revenueStats, setRevenueStats] = useState({ currentMonth: 0, lastMonth: 0, today: 0 })
    const [bookingStats, setBookingStats] = useState({ pending: 0, confirmed: 0, completed: 0, cancelled: 0, thisWeek: 0, total: 0 })
    const [dailyRevenue, setDailyRevenue] = useState<{ date: string; day: string; revenue: number }[]>([])
    const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number }[]>([])
    const [topServices, setTopServices] = useState<{ name: string; bookings: number; revenue: number }[]>([])

    useEffect(() => {
        async function fetchData() {
            const [revenue, bookings, daily, monthly, services] = await Promise.all([
                getRevenueStats(),
                getBookingStats(),
                getDailyRevenue(),
                getMonthlyRevenue(),
                getTopServices()
            ])

            if (revenue.success) setRevenueStats(revenue.data)
            if (bookings.success) setBookingStats(bookings.data)
            if (daily.success) setDailyRevenue(daily.data)
            if (monthly.success) setMonthlyRevenue(monthly.data)
            if (services.success) setTopServices(services.data)

            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const growthPercentage = revenueStats.lastMonth > 0
        ? ((revenueStats.currentMonth - revenueStats.lastMonth) / revenueStats.lastMonth * 100).toFixed(1)
        : '0'

    const bookingData = [
        { name: 'Pending', value: bookingStats.pending, color: '#FFBB28' },
        { name: 'Confirmed', value: bookingStats.confirmed, color: '#0088FE' },
        { name: 'Completed', value: bookingStats.completed, color: '#00C49F' },
        { name: 'Cancelled', value: bookingStats.cancelled, color: '#FF8042' }
    ].filter(item => item.value > 0)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground">Business insights and performance metrics</p>
            </div>

            {/* Revenue Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{revenueStats.today.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{revenueStats.currentMonth.toFixed(2)}</div>
                        <p className={`text-xs ${Number(growthPercentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Number(growthPercentage) >= 0 ? '+' : ''}{growthPercentage}% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bookings This Week</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{bookingStats.thisWeek}</div>
                        <p className="text-xs text-muted-foreground">
                            {bookingStats.total} total bookings
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Month</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{revenueStats.lastMonth.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Daily Revenue Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Revenue (Last 7 Days)</CardTitle>
                        <CardDescription>Revenue trends over the past week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) => [`₹${value}`, 'Revenue']}
                                        labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                                    />
                                    <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Revenue Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Revenue (Last 6 Months)</CardTitle>
                        <CardDescription>Revenue growth over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#0088FE"
                                        strokeWidth={2}
                                        dot={{ fill: '#0088FE' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Booking Status Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Status Distribution</CardTitle>
                        <CardDescription>Current status of all bookings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {bookingData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={bookingData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {bookingData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Legend />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    No booking data available
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Services */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Services by Revenue</CardTitle>
                        <CardDescription>Best performing services</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {topServices.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topServices} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" width={100} />
                                        <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                                        <Bar dataKey="revenue" fill="#00C49F" radius={[0, 4, 4, 0]}>
                                            {topServices.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    No service data available yet
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
