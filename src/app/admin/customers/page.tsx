import { getCustomers } from "@/app/actions/admin-customers"
import CustomersClient from "./customers-client"

export default async function CustomersPage() {
  const result = await getCustomers()
  const customers = result.success && result.data ? result.data : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          View customer details, booking history, and loyalty points.
        </p>
      </div>
      <CustomersClient initialCustomers={customers} />
    </div>
  )
}
