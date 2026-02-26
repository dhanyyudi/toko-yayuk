'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'
  const [checking, setChecking] = useState(!isLoginPage)
  const supabase = createClient()

  useEffect(() => {
    // Skip if supabase client not available (SSR/build)
    if (!supabase) return
    
    // Don't check session on the login page itself
    if (isLoginPage) {
      setChecking(false)
      return
    }

    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/admin/login')
      } else {
        setChecking(false)
      }
    }
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: { user: any } | null) => {
      if (!session && !isLoginPage) {
        router.replace('/admin/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, isLoginPage, supabase])

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FF4AA6 0%, #1BB6E8 100%)',
        color: 'white',
        fontSize: '18px',
        fontWeight: 600
      }}>
        ⏳ Memeriksa sesi...
      </div>
    )
  }

  return <>{children}</>
}
