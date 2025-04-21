'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function OrganizerDashboard() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error fetching session:', error)
        return
      }

      const user = session?.user
      if (user) {
        setUserEmail(user.email ?? null)
      } else {
        router.push('/') // Redirect to home/login if no user
      }
    }

    getUser()
  }, [router])

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🎪 Organizer Dashboard</h1>
      <p>Welcome, <strong>{userEmail}</strong></p>
      <p className="mt-4 text-gray-600">This is where you'll manage events, view applicants, and more!</p>
    </main>
  )
}