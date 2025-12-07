'use client'

import { useState } from "react"
import { Customer } from "@prisma/client"
import { Search, Mail, Phone, Star, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"

type CustomerWithDetails = Customer & {
  user: {
    email: string
  }
  _count: {
    bookings: number
  }
}

interface CustomersClientProps {
  initialCustomers: CustomerWithDetails[]
}

export default function CustomersClient({ initialCustomers }: CustomersClientProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [customers, setCustomers] = useState<CustomerWithDetails[]>(initialCustomers)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchQuery))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Info</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Loyalty Points</TableHead>
              <TableHead>Total Bookings</TableHead>
              <TableHead>Joined Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {customer.id.substring(0, 8)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                      {customer.user.email}
                    </div>
                    {customer.phone && (
                      <div className="flex items-center text-sm mt-1">
                        <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                        {customer.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="mr-2 h-3 w-3 text-yellow-500" />
                      {customer.loyaltyPoints}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-3 w-3 text-muted-foreground" />
                      {customer._count.bookings}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(customer.createdAt), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
