import { getStaffAppointments } from "@/app/actions/staff"
import StaffDashboardClient from "./staff-dashboard-client"
import { format } from "date-fns"

export default async function StaffDashboardPage() {
  const result = await getStaffAppointments()
  const appointments = result.success && result.data ? result.data : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
        <p className="text-muted-foreground">
          Appointments for {format(new Date(), "EEEE, MMMM do, yyyy")}
        </p>
      </div>
      <StaffDashboardClient initialAppointments={appointments} />
    </div>
  )
}
