import { getStaffCustomers } from "@/app/actions/staff"
import StaffCustomersClient from "./staff-customers-client"

export default async function StaffCustomersPage() {
  const result = await getStaffCustomers()
  const customers = result.success && result.data ? result.data : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Customers</h1>
        <p className="text-muted-foreground">
          Customers you have served or are scheduled to serve.
        </p>
      </div>
      <StaffCustomersClient initialCustomers={customers} />
    </div>
  )
}
