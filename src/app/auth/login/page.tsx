import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  const handleSignIn = async () => {
    'use server'
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) {
      console.error('Error signing in:', error.message)
    }

    if (data.url) {
      redirect(data.url)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">
            Welcome to OpenClaw-Hub
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Sign in to join the community
          </p>
          
          <form action={handleSignIn}>
            <Button type="submit" className="w-full">
              Sign In with GitHub
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  )
}