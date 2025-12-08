'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { checkUserRole, createCustomerProfile } from './actions'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCustomerAuth = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (isSignUp) {
      // Validate name during signup
      if (!name.trim()) {
        alert('Please enter your name')
        setLoading(false)
        return
      }

      // Sign Up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            phone: phone
          }
        }
      })

      if (error) {
        alert(error.message)
        setLoading(false)
      } else {
        if (data.session) {
          // Create customer profile with name and phone
          await createCustomerProfile(name, phone)
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

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      alert(error.message)
    } else {
      setResetEmailSent(true)
    }
    setLoading(false)
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

  // Forgot Password View
  if (isForgotPassword) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-100'>
        <Card className='w-[400px]'>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Reset Password
            </CardTitle>
            <CardDescription>
              {resetEmailSent
                ? 'Check your email for the reset link!'
                : 'Enter your email and we\'ll send you a reset link.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetEmailSent ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <Mail className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <p className="text-green-800 font-medium">Email Sent!</p>
                  <p className="text-green-600 text-sm mt-1">
                    We&apos;ve sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsForgotPassword(false)
                    setResetEmailSent(false)
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className='space-y-2'>
                  <Label htmlFor='reset-email'>Email Address</Label>
                  <Input
                    id='reset-email'
                    type='email'
                    placeholder='m@example.com'
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type='submit' className='w-full' disabled={loading}>
                  {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                  Send Reset Link
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsForgotPassword(false)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <Card className='w-[400px]'>
        <CardHeader>
          <CardTitle>Salon Login</CardTitle>
          <CardDescription>
            {isSignUp ? 'Create your account to get started.' : 'Welcome back! Please login to continue.'}
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
                {/* Name field - only show during signup */}
                {isSignUp && (
                  <div className='space-y-2'>
                    <Label htmlFor='name'>Full Name *</Label>
                    <Input
                      id='name'
                      type='text'
                      placeholder='John Doe'
                      value={name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                      required={isSignUp}
                    />
                  </div>
                )}

                <div className='space-y-2'>
                  <Label htmlFor='email'>Email *</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='m@example.com'
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Phone field - only show during signup */}
                {isSignUp && (
                  <div className='space-y-2'>
                    <Label htmlFor='phone'>Phone Number</Label>
                    <Input
                      id='phone'
                      type='tel'
                      placeholder='+91 98765 43210'
                      value={phone}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                    />
                  </div>
                )}

                <div className='space-y-2'>
                  <div className="flex justify-between items-center">
                    <Label htmlFor='password'>Password *</Label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <Input
                    id='password'
                    type='password'
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  {isSignUp && (
                    <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                  )}
                </div>
                <Button type='submit' className='w-full' disabled={loading}>
                  {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                  {isSignUp ? 'Create Account' : 'Login'}
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
