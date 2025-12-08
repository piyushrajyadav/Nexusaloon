'use client'

import { useEffect, useState } from 'react'
import { getOffers, createOffer, toggleOfferStatus, deleteOffer } from '@/app/actions/admin-offers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, Loader2, Gift, Percent, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

type Offer = {
    id: string
    code: string
    description: string | null
    discountPct: number | null
    flatAmount: number | null
    validFrom: Date
    validUntil: Date
    isActive: boolean
    createdAt: Date
}

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)

    // Form state
    const [code, setCode] = useState('')
    const [description, setDescription] = useState('')
    const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent')
    const [discountValue, setDiscountValue] = useState('')
    const [validFrom, setValidFrom] = useState('')
    const [validUntil, setValidUntil] = useState('')

    useEffect(() => {
        loadOffers()
    }, [])

    async function loadOffers() {
        const result = await getOffers()
        if (result.success && result.data) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const formattedOffers = result.data.map((offer: any) => ({
                ...offer,
                discountPct: offer.discountPct ? Number(offer.discountPct) : null,
                flatAmount: offer.flatAmount ? Number(offer.flatAmount) : null
            }))
            setOffers(formattedOffers)
        }
        setLoading(false)
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        setIsCreating(true)

        const result = await createOffer({
            code,
            description: description || undefined,
            discountPct: discountType === 'percent' ? Number(discountValue) : undefined,
            flatAmount: discountType === 'flat' ? Number(discountValue) : undefined,
            validFrom: new Date(validFrom),
            validUntil: new Date(validUntil)
        })

        if (result.success) {
            toast.success('Offer created successfully')
            setDialogOpen(false)
            resetForm()
            loadOffers()
        } else {
            toast.error(result.error || 'Failed to create offer')
        }
        setIsCreating(false)
    }

    function resetForm() {
        setCode('')
        setDescription('')
        setDiscountType('percent')
        setDiscountValue('')
        setValidFrom('')
        setValidUntil('')
    }

    async function handleToggle(id: string, isActive: boolean) {
        const result = await toggleOfferStatus(id, isActive)
        if (result.success) {
            toast.success(`Offer ${isActive ? 'activated' : 'deactivated'}`)
            loadOffers()
        } else {
            toast.error('Failed to update offer')
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this offer?')) return

        const result = await deleteOffer(id)
        if (result.success) {
            toast.success('Offer deleted')
            loadOffers()
        } else {
            toast.error('Failed to delete offer')
        }
    }

    const isExpired = (date: Date) => new Date(date) < new Date()
    const isUpcoming = (date: Date) => new Date(date) > new Date()

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Offers & Coupons</h1>
                    <p className="text-muted-foreground">Manage discounts and promotional offers</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Offer
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleCreate}>
                            <DialogHeader>
                                <DialogTitle>Create New Offer</DialogTitle>
                                <DialogDescription>
                                    Add a new discount coupon or promotional offer
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Offer Code</Label>
                                    <Input
                                        id="code"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        placeholder="SUMMER20"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Summer discount - 20% off all services"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Discount Type</Label>
                                    <div className="flex gap-4">
                                        <Button
                                            type="button"
                                            variant={discountType === 'percent' ? 'default' : 'outline'}
                                            onClick={() => setDiscountType('percent')}
                                            className="flex-1"
                                        >
                                            <Percent className="mr-2 h-4 w-4" /> Percentage
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={discountType === 'flat' ? 'default' : 'outline'}
                                            onClick={() => setDiscountType('flat')}
                                            className="flex-1"
                                        >
                                            <DollarSign className="mr-2 h-4 w-4" /> Flat Amount
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="discount">
                                        {discountType === 'percent' ? 'Discount Percentage' : 'Discount Amount (₹)'}
                                    </Label>
                                    <Input
                                        id="discount"
                                        type="number"
                                        min="0"
                                        max={discountType === 'percent' ? 100 : undefined}
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(e.target.value)}
                                        placeholder={discountType === 'percent' ? '20' : '100'}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="validFrom">Valid From</Label>
                                        <Input
                                            id="validFrom"
                                            type="date"
                                            value={validFrom}
                                            onChange={(e) => setValidFrom(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="validUntil">Valid Until</Label>
                                        <Input
                                            id="validUntil"
                                            type="date"
                                            value={validUntil}
                                            onChange={(e) => setValidUntil(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Offer
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {offers.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Gift className="h-12 w-12 mb-4 opacity-20" />
                        <p>No offers created yet</p>
                        <p className="text-sm">Create your first promotional offer</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>All Offers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Validity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Active</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {offers.map((offer) => (
                                    <TableRow key={offer.id}>
                                        <TableCell className="font-mono font-bold">{offer.code}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {offer.description || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {offer.discountPct ? (
                                                <span className="text-green-600 font-medium">{Number(offer.discountPct)}% OFF</span>
                                            ) : offer.flatAmount ? (
                                                <span className="text-green-600 font-medium">₹{Number(offer.flatAmount)} OFF</span>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <div>{format(new Date(offer.validFrom), 'MMM d, yyyy')}</div>
                                            <div className="text-muted-foreground">to {format(new Date(offer.validUntil), 'MMM d, yyyy')}</div>
                                        </TableCell>
                                        <TableCell>
                                            {isExpired(offer.validUntil) ? (
                                                <Badge variant="destructive">Expired</Badge>
                                            ) : isUpcoming(offer.validFrom) ? (
                                                <Badge variant="secondary">Upcoming</Badge>
                                            ) : (
                                                <Badge variant="default">Active</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={offer.isActive}
                                                onCheckedChange={(checked) => handleToggle(offer.id, checked)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => handleDelete(offer.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
