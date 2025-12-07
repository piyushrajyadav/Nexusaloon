'use client'

import { useState } from "react"
import { Product, StockType } from "@prisma/client"
import { Plus, Search, ArrowUpCircle, ArrowDownCircle, History, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { createProduct, adjustStock, getStockHistory } from "@/app/actions/admin-inventory"
import { toast } from "sonner"
import { format } from "date-fns"

interface InventoryClientProps {
  initialProducts: Product[]
}

export default function InventoryClient({ initialProducts }: InventoryClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [stockHistory, setStockHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    sku: "",
    price: "",
    stockQuantity: "",
    lowStockThreshold: "5",
    description: ""
  })

  // Stock Adjustment State
  const [stockAdjustment, setStockAdjustment] = useState({
    type: "ADD" as StockType,
    quantity: "",
    notes: ""
  })

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (showLowStockOnly) {
      return matchesSearch && product.stockQuantity <= product.lowStockThreshold
    }
    return matchesSearch
  })

  const handleCreateProduct = async () => {
    setIsLoading(true)
    try {
      const result = await createProduct({
        name: newProduct.name,
        brand: newProduct.brand,
        sku: newProduct.sku,
        price: parseFloat(newProduct.price),
        stockQuantity: parseInt(newProduct.stockQuantity),
        lowStockThreshold: parseInt(newProduct.lowStockThreshold),
        description: newProduct.description
      })

      if (result.success && result.data) {
        setProducts([...products, result.data])
        setIsAddDialogOpen(false)
        setNewProduct({
          name: "",
          brand: "",
          sku: "",
          price: "",
          stockQuantity: "",
          lowStockThreshold: "5",
          description: ""
        })
        toast.success("Product created successfully")
      } else {
        toast.error("Failed to create product")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdjustStock = async () => {
    if (!selectedProduct) return
    setIsLoading(true)
    try {
      const qty = parseInt(stockAdjustment.quantity)
      const result = await adjustStock(
        selectedProduct.id,
        qty,
        stockAdjustment.type,
        stockAdjustment.notes
      )

      if (result.success && result.data) {
        setProducts(products.map(p => 
          p.id === selectedProduct.id ? result.data : p
        ))
        setIsStockDialogOpen(false)
        setStockAdjustment({
          type: "ADD",
          quantity: "",
          notes: ""
        })
        toast.success("Stock updated successfully")
      } else {
        toast.error("Failed to update stock")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const openStockDialog = (product: Product) => {
    setSelectedProduct(product)
    setStockAdjustment({ type: "ADD", quantity: "", notes: "" })
    setIsStockDialogOpen(true)
  }

  const openHistoryDialog = async (product: Product) => {
    setSelectedProduct(product)
    setIsHistoryDialogOpen(true)
    setStockHistory([])
    const result = await getStockHistory(product.id)
    if (result.success && result.data) {
      setStockHistory(result.data)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={showLowStockOnly ? "destructive" : "outline"}
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {showLowStockOnly ? "Show All" : "Low Stock Only"}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to your inventory.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Initial Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stockQuantity}
                      onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Low Stock Alert</Label>
                    <Input
                      id="threshold"
                      type="number"
                      value={newProduct.lowStockThreshold}
                      onChange={(e) => setNewProduct({ ...newProduct, lowStockThreshold: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateProduct} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Product"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Info</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">{product.brand}</div>
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product.stockQuantity}</span>
                      {product.stockQuantity <= product.lowStockThreshold && (
                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openHistoryDialog(product)}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openStockDialog(product)}
                      >
                        Adjust
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stock Adjustment Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Update stock quantity for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Action</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={stockAdjustment.type === "ADD" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setStockAdjustment({ ...stockAdjustment, type: "ADD" })}
                >
                  <ArrowUpCircle className="mr-2 h-4 w-4" /> Add
                </Button>
                <Button
                  type="button"
                  variant={stockAdjustment.type === "REMOVE" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setStockAdjustment({ ...stockAdjustment, type: "REMOVE" })}
                >
                  <ArrowDownCircle className="mr-2 h-4 w-4" /> Remove
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                value={stockAdjustment.quantity}
                onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Reason for adjustment..."
                value={stockAdjustment.notes}
                onChange={(e) => setStockAdjustment({ ...stockAdjustment, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjustStock} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Stock History</DialogTitle>
            <DialogDescription>
              History for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No history found.</TableCell>
                  </TableRow>
                ) : (
                  stockHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-xs">
                        {format(new Date(record.createdAt), "MMM d, yyyy h:mm a")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={record.type === 'ADD' ? 'default' : 'destructive'}>
                          {record.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.quantity}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{record.notes || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
