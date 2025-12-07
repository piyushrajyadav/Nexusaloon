import { getProducts } from "@/app/actions/admin-inventory"
import InventoryClient from "./inventory-client"

export default async function InventoryPage() {
  const result = await getProducts()
  const products = result.success && result.data ? result.data : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">
          Manage products, track stock levels, and handle adjustments.
        </p>
      </div>
      <InventoryClient initialProducts={products} />
    </div>
  )
}
