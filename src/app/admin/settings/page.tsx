import SettingsClient from "./settings-client"

export default function SettingsPage() {
  // In a real application, you would get the current user's ID from the session
  // const session = await auth()
  // const userId = session?.user?.id
  const userId = "current-user-id" 

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and salon preferences.
        </p>
      </div>
      <SettingsClient userId={userId} />
    </div>
  )
}
