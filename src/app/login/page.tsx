'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { checkUserRole } from './actions'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCustomerAuth = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (isSignUp) {
      // Sign Up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        alert(error.message)
        setLoading(false)
      } else {
        if (data.session) {
          // Auto logged in (email confirmation disabled)
          const result = await checkUserRole()
          if (result.redirect) {
            router.push(result.redirect)
            router.refresh()
          }
        } else {
          // Email confirmation required
          alert('Please check your email to confirm your account.')
          setLoading(false)
        }
      }
    } else {
      // Login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert(error.message)
        setLoading(false)
      } else {
        const result = await checkUserRole()
        if (result.error) {
          alert(result.error)
          setLoading(false)
        } else if (result.redirect) {
          router.push(result.redirect)
          router.refresh()
        }
      }
    }
  }

  const handleStaffLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
    } else {
      const result = await checkUserRole()
      if (result.error) {
        alert(result.error)
        setLoading(false)
      } else if (result.redirect) {
        router.push(result.redirect)
        router.refresh()
      }
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <Card className='w-[400px]'>
        <CardHeader>
          <CardTitle>Salon Login</CardTitle>
          <CardDescription>
            Welcome back! Please login to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="staff">Staff / Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customer">
              <form onSubmit={handleCustomerAuth} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input 
                    id='email' 
                    type='email' 
                    placeholder='m@example.com' 
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='password'>Password</Label>
                  <Input 
                    id='password' 
                    type='password' 
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type='submit' className='w-full' disabled={loading}>
                  {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                  {isSignUp ? 'Sign Up' : 'Login'}
                </Button>
                
                <div className="text-center text-sm">
                  <button 
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-blue-600 hover:underline"
                  >
                    {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="staff">
              <form onSubmit={handleStaffLogin} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='staff-email'>Email</Label>
                  <Input 
                    id='staff-email' 
                    type='email' 
                    placeholder='staff@example.com' 
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='staff-password'>Password</Label>
                  <Input 
                    id='staff-password' 
                    type='password' 
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type='submit' className='w-full' disabled={loading}>
                  {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                  Login
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
