'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { User } from '@supabase/supabase-js'

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Error signing in:', error.message)
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error signing out:', error.message)
    } else {
      setUser(null)
      window.location.href = '/'
    }
  }

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-300">
        {user.email}
      </span>
      <Button onClick={handleSignOut} variant="outline">
        Sign Out
      </Button>
    </div>
  ) : (
    <Button onClick={handleSignIn}>
      Sign In with GitHub
    </Button>
  )
}