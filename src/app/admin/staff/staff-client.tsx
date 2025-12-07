'use client'

import { useState } from "react"
import { Staff } from "@prisma/client"
import { Plus, Search, Mail, Phone, Briefcase, Percent } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { createStaff, toggleStaffStatus } from "@/app/actions/admin-staff"
import { toast } from "sonner"

type StaffWithUser = Staff & {
  user: {
    email: string
  }
}

interface StaffClientProps {
  initialStaff: StaffWithUser[]
}

export default function StaffClient({ initialStaff }: StaffClientProps) {
  const [staffList, setStaffList] = useState<StaffWithUser[]>(initialStaff)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    commissionRate: "",
    password: ""
  })

  const filteredStaff = staffList.filter(staff =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (staff.specialization && staff.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleCreateStaff = async () => {
    setIsLoading(true)
    try {
      const result = await createStaff({
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        specialization: newStaff.specialization,
        commissionRate: parseFloat(newStaff.commissionRate) || 0,
        password: newStaff.password
      })

      if (result.success && result.data) {
        // We need to manually construct the object because the return type might not include user email immediately unless we refetch or return it from action
        // For simplicity, let's assume success and add it with the email we know
        const createdStaff = {
            ...result.data,
            user: { email: newStaff.email }
        } as StaffWithUser

        setStaffList([...staffList, createdStaff])
        setIsAddDialogOpen(false)
        setNewStaff({
          name: "",
          email: "",
          phone: "",
          specialization: "",
          commissionRate: "",
          password: ""
        })
        toast.success("Staff member added successfully")
      } else {
        toast.error(result.error || "Failed to create staff")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const result = await toggleStaffStatus(id, !currentStatus)
      if (result.success) {
        setStaffList(staffList.map(s => 
          s.id === id ? { ...s, isActive: !currentStatus } : s
        ))
        toast.success(`Staff member ${!currentStatus ? 'activated' : 'deactivated'}`)
      } else {
        toast.error("Failed to update status")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Create a new staff account. They will be able to log in with these credentials.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={newStaff.specialization}
                    onChange={(e) => setNewStaff({ ...newStaff, specialization: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission">Commission Rate (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    value={newStaff.commissionRate}
                    onChange={(e) => setNewStaff({ ...newStaff, commissionRate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Default: password123"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateStaff} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Staff"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Info</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No staff members found.
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="font-medium">{staff.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {staff.id.substring(0, 8)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                      {staff.user.email}
                    </div>
                    {staff.phone && (
                      <div className="flex items-center text-sm mt-1">
                        <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                        {staff.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {staff.specialization ? (
                      <div className="flex items-center">
                        <Briefcase className="mr-2 h-3 w-3 text-muted-foreground" />
                        {staff.specialization}
                      </div>
                    ) : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Percent className="mr-2 h-3 w-3 text-muted-foreground" />
                      {Number(staff.commissionRate)}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={staff.isActive}
                        onCheckedChange={() => handleToggleStatus(staff.id, staff.isActive)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {staff.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
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
