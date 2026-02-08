import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, User, Mail, Calendar, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/auth/actions'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/auth/login')
    }

    const userMetadata = user.user_metadata || {}
    const fullName = userMetadata.full_name || 'User'
    const email = user.email || ''
    const createdAt = new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back, {fullName}!</p>
                    </div>

                    <form action={async () => {
                        'use server'
                        await signOut()
                    }}>
                        <Button variant="outline" size="sm" className="gap-2">
                            <LogOut size={16} />
                            Logout
                        </Button>
                    </form>
                </div>

                {/* User Info Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 ring-4 ring-primary/5">
                                <User size={32} />
                            </div>
                            <div>
                                <CardTitle>Your Account</CardTitle>
                                <CardDescription>Account information and details</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Email */}
                            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                                <Mail size={20} className="text-muted-foreground mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p className="text-sm font-semibold break-all">{email}</p>
                                </div>
                            </div>

                            {/* Member Since */}
                            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                                <Calendar size={20} className="text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                                    <p className="text-sm font-semibold">{createdAt}</p>
                                </div>
                            </div>

                            {/* Email Verified */}
                            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card md:col-span-2">
                                <ShieldCheck size={20} className="text-green-600 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">Email Status</p>
                                    <p className="text-sm font-semibold text-green-600">Verified</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks and features</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-3">
                            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                                <span className="text-2xl">🗳️</span>
                                <span className="font-semibold">View Elections</span>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                                <span className="text-2xl">📊</span>
                                <span className="font-semibold">View Results</span>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                                <span className="text-2xl">⚙️</span>
                                <span className="font-semibold">Settings</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Welcome Message */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="text-3xl">👋</div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-1">Welcome to E-Voting!</h3>
                                <p className="text-sm text-muted-foreground">
                                    Your account is set up and ready. You can now participate in elections and view results.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
