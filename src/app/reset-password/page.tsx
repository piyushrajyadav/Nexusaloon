'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, Lock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    // Check if user has a valid session from the email link
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                // No session means the link is invalid or expired
                setError('Invalid or expired reset link. Please request a new one.')
            }
        }
        checkSession()
    }, [supabase.auth])

    const handleResetPassword = async (e: FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.updateUser({
            password: password
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        }
    }

    // Success View
    if (success) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-gray-100'>
                <Card className='w-[400px]'>
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-green-600">Password Updated!</CardTitle>
                        <CardDescription>
                            Your password has been successfully reset.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                            Redirecting to login page...
                        </p>
                        <Link href="/login">
                            <Button className="w-full">Go to Login</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-100'>
            <Card className='w-[400px]'>
                <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-center">Set New Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your new password below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className='space-y-2'>
                            <Label htmlFor='password'>New Password</Label>
                            <Input
                                id='password'
                                type='password'
                                placeholder='••••••••'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='confirmPassword'>Confirm Password</Label>
                            <Input
                                id='confirmPassword'
                                type='password'
                                placeholder='••••••••'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Password must be at least 6 characters
                        </p>
                        <Button type='submit' className='w-full' disabled={loading}>
                            {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                            Update Password
                        </Button>
                    </form>

                    <div className="mt-4 text-center">
                        <Link href="/login" className="text-sm text-blue-600 hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
