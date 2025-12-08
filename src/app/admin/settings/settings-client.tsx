'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { updatePassword, saveSalonSettings, getSalonSettings, SalonSettings } from "@/app/actions/admin-settings"
import { toast } from "sonner"
import { Loader2, Building2, Receipt, Shield, Clock } from "lucide-react"

interface SettingsClientProps {
  userId: string
}

export default function SettingsClient({ userId }: SettingsClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  })

  // Settings state
  const [settings, setSettings] = useState<SalonSettings>({
    salonName: '',
    salonAddress: '',
    salonCity: '',
    salonPhone: '',
    salonEmail: '',
    salonWebsite: '',
    gstNumber: '',
    gstRate: 18,
    invoicePrefix: 'INV',
    invoiceFooter: '',
    openTime: '09:00',
    closeTime: '20:00',
    currency: '₹',
    currencyCode: 'INR'
  })

  // Load settings on mount
  useEffect(() => {
    getSalonSettings().then((data) => {
      setSettings(data)
      setSettingsLoaded(true)
    })
  }, [])

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      const result = await updatePassword(userId, passwords.current, passwords.new)
      if (result.success) {
        toast.success("Password updated successfully")
        setPasswords({ current: "", new: "", confirm: "" })
      } else {
        toast.error(result.error || "Failed to update password")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async (section: string) => {
    setIsSaving(true)
    try {
      const result = await saveSalonSettings(settings)
      if (result.success) {
        toast.success(`${section} settings saved successfully`)
      } else {
        toast.error(result.error || "Failed to save settings")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: keyof SalonSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (!settingsLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" /> Salon Info
        </TabsTrigger>
        <TabsTrigger value="invoice" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" /> Invoice & GST
        </TabsTrigger>
        <TabsTrigger value="hours" className="flex items-center gap-2">
          <Clock className="h-4 w-4" /> Business Hours
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" /> Security
        </TabsTrigger>
      </TabsList>

      {/* Salon Information Tab */}
      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Salon Information</CardTitle>
            <CardDescription>
              These details will appear on invoices and your public website.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salonName">Salon Name *</Label>
                <Input
                  id="salonName"
                  value={settings.salonName}
                  onChange={(e) => updateSetting('salonName', e.target.value)}
                  placeholder="Your Salon Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salonPhone">Phone Number</Label>
                <Input
                  id="salonPhone"
                  value={settings.salonPhone}
                  onChange={(e) => updateSetting('salonPhone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salonAddress">Address</Label>
              <Input
                id="salonAddress"
                value={settings.salonAddress}
                onChange={(e) => updateSetting('salonAddress', e.target.value)}
                placeholder="Street Address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salonCity">City, State, PIN</Label>
              <Input
                id="salonCity"
                value={settings.salonCity}
                onChange={(e) => updateSetting('salonCity', e.target.value)}
                placeholder="Mumbai, Maharashtra 400001"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salonEmail">Email</Label>
                <Input
                  id="salonEmail"
                  type="email"
                  value={settings.salonEmail}
                  onChange={(e) => updateSetting('salonEmail', e.target.value)}
                  placeholder="info@salon.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salonWebsite">Website</Label>
                <Input
                  id="salonWebsite"
                  value={settings.salonWebsite}
                  onChange={(e) => updateSetting('salonWebsite', e.target.value)}
                  placeholder="www.yoursalon.com"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleSaveSettings('Salon')} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Salon Info
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Invoice & GST Tab */}
      <TabsContent value="invoice" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Invoice & GST Settings</CardTitle>
            <CardDescription>
              Configure GST rate, invoice numbering, and invoice appearance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number (GSTIN)</Label>
                <Input
                  id="gstNumber"
                  value={settings.gstNumber}
                  onChange={(e) => updateSetting('gstNumber', e.target.value)}
                  placeholder="GST27AABCT1234D1ZD"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstRate">GST Rate (%)</Label>
                <Input
                  id="gstRate"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.gstRate}
                  onChange={(e) => updateSetting('gstRate', Number(e.target.value))}
                  placeholder="18"
                />
                <p className="text-xs text-muted-foreground">Current: {settings.gstRate}% GST on all services</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                <Input
                  id="invoicePrefix"
                  value={settings.invoicePrefix}
                  onChange={(e) => updateSetting('invoicePrefix', e.target.value)}
                  placeholder="INV"
                />
                <p className="text-xs text-muted-foreground">Example: {settings.invoicePrefix}-202412-0001</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency Symbol</Label>
                <Input
                  id="currency"
                  value={settings.currency}
                  onChange={(e) => updateSetting('currency', e.target.value)}
                  placeholder="₹"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceFooter">Invoice Footer Message</Label>
              <Input
                id="invoiceFooter"
                value={settings.invoiceFooter}
                onChange={(e) => updateSetting('invoiceFooter', e.target.value)}
                placeholder="Thank you for choosing our salon!"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleSaveSettings('Invoice')} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Invoice Settings
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle className="text-lg">Invoice Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded border">
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{settings.salonName || 'Your Salon'}</h3>
                  <p className="text-sm text-muted-foreground">{settings.salonAddress}</p>
                  <p className="text-sm text-muted-foreground">{settings.salonCity}</p>
                  <p className="text-sm font-medium mt-1">GSTIN: {settings.gstNumber || 'Not set'}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-blue-600 font-bold">TAX INVOICE</h4>
                  <p className="text-sm">{settings.invoicePrefix}-202412-XXXX</p>
                </div>
              </div>
              <div className="border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{settings.currency}1,000.00</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST ({settings.gstRate}%):</span>
                  <span>{settings.currency}{(1000 * settings.gstRate / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t mt-2 pt-2">
                  <span>Total:</span>
                  <span>{settings.currency}{(1000 * (1 + settings.gstRate / 100)).toFixed(2)}</span>
                </div>
              </div>
              {settings.invoiceFooter && (
                <p className="text-center text-sm text-muted-foreground mt-4 pt-4 border-t">
                  {settings.invoiceFooter}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Business Hours Tab */}
      <TabsContent value="hours" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
            <CardDescription>
              Set your salon's operating hours for online bookings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openTime">Opening Time</Label>
                <Input
                  id="openTime"
                  type="time"
                  value={settings.openTime}
                  onChange={(e) => updateSetting('openTime', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closeTime">Closing Time</Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={settings.closeTime}
                  onChange={(e) => updateSetting('closeTime', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleSaveSettings('Business hours')} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Hours
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Security Tab */}
      <TabsContent value="security" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your account password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">Current Password</Label>
              <Input
                id="current"
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New Password</Label>
              <Input
                id="new"
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input
                id="confirm"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handlePasswordChange} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
