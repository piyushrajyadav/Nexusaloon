'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { createAdminInDb, createStaffInDb } from './actions'
import { Loader2 } from 'lucide-react'

export default function SetupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleCreateUser = async (role: 'ADMIN' | 'STAFF') => {
    setLoading(true)
    setMessage('')

    try {
      // 1. Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
        setLoading(false)
        return
      }

      if (!data.user) {
        setMessage('Error: No user data returned')
        setLoading(false)
        return
      }

      // 2. Create/Update user in Prisma with correct role
      const result = role === 'ADMIN' 
        ? await createAdminInDb(data.user.id, email)
        : await createStaffInDb(data.user.id, email)

      if (result.error) {
        setMessage(`Error: ${result.error}`)
      } else {
        setMessage(`Success! ${role} user created. You can now login.`)
      }
    } catch (err) {
      setMessage('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>System Setup</CardTitle>
          <CardDescription>Create initial Admin and Staff accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
            />
          </div>
          
          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={() => handleCreateUser('ADMIN')} 
              disabled={loading}
              className="w-full"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Admin User
            </Button>
            <Button 
              onClick={() => handleCreateUser('STAFF')} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Staff User
            </Button>
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
