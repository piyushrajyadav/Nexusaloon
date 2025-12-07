import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function AdminStaffPage() {
  const staffMembers = await prisma.staff.findMany({
    include: {
      user: true
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Staff Members</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {staffMembers.map((staff) => (
          <Card key={staff.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={''} />
                <AvatarFallback>{staff.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{staff.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{staff.specialization}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Status</span>
                <Badge variant={staff.isActive ? 'default' : 'secondary'}>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="text-sm text-gray-500">
                Phone: {staff.phone || 'N/A'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
