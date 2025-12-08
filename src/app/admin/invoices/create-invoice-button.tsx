'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Loader2, User, Users } from 'lucide-react'
import { createManualInvoice, getCustomersAndServices } from './actions'
import { toast } from 'sonner'

type Customer = { id: string; name: string; phone?: string | null; user: { email: string } }
type Service = { id: string; name: string; price: number | string }

export function CreateInvoiceButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])

  // Form state
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [gstRate, setGstRate] = useState('18') // Default 18% GST

  useEffect(() => {
    if (open) {
      setDataLoading(true)
      getCustomersAndServices().then((data) => {
        setCustomers(data.customers)
        setServices(data.services)
        setDataLoading(false)
      })
    }
  }, [open])

  // When service is selected, auto-fill amount
  useEffect(() => {
    if (selectedServiceId) {
      const service = services.find(s => s.id === selectedServiceId)
      if (service) {
        setAmount(String(Number(service.price)))
        setDescription(service.name)
      }
    }
  }, [selectedServiceId, services])

  function resetForm() {
    setSelectedCustomerId('')
    setCustomerName('')
    setCustomerPhone('')
    setCustomerEmail('')
    setAmount('')
    setDescription('')
    setSelectedServiceId('')
    setCustomerMode('existing')
    setGstRate('18')
  }

  // Calculate GST and total
  const gstAmount = amount ? Number(amount) * (Number(gstRate) / 100) : 0
  const totalAmount = amount ? Number(amount) + gstAmount : 0

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const invoiceData = {
      customerId: customerMode === 'existing' ? selectedCustomerId : undefined,
      customerName: customerMode === 'new' ? customerName : undefined,
      customerPhone: customerMode === 'new' ? customerPhone : undefined,
      customerEmail: customerMode === 'new' ? customerEmail : undefined,
      amount: Number(amount),
      description,
      serviceId: selectedServiceId || undefined,
      gstRate: Number(gstRate) // Pass custom GST rate
    }

    const result = await createManualInvoice(invoiceData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Invoice created successfully!')
      setOpen(false)
      resetForm()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm() }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Create Manual Invoice</DialogTitle>
            <DialogDescription>
              Create an invoice for walk-in or existing customers
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Customer Selection Mode */}
            <Tabs value={customerMode} onValueChange={(v) => setCustomerMode(v as 'existing' | 'new')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existing" className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Existing Customer
                </TabsTrigger>
                <TabsTrigger value="new" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> New / Walk-in
                </TabsTrigger>
              </TabsList>

              <TabsContent value="existing" className="space-y-3 mt-4">
                {dataLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : customers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No customers found. Use "New / Walk-in" tab to create one.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <Label>Select Customer</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      required={customerMode === 'existing'}
                    >
                      <option value="">-- Select Customer --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="new" className="space-y-3 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    required={customerMode === 'new'}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <hr className="my-2" />

            {/* Service Selection (Optional) */}
            <div className="space-y-2">
              <Label>Service (Optional - auto-fills amount)</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
              >
                <option value="">-- Select Service (or enter manually) --</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - ₹{Number(s.price)}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount and GST Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="amount">Subtotal Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstRate">GST Rate (%) *</Label>
                <Input
                  id="gstRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  placeholder="18"
                  required
                />
              </div>
            </div>

            {/* Live Calculation Preview */}
            {amount && (
              <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{Number(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>GST ({gstRate}%):</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t pt-1 mt-1">
                  <span>Total:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Service or product details"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
