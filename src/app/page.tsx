
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [status, setStatus] = useState('Checking Supabase...')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const checkConnection = async () => {
      const { data, error } = await supabase.from('test_table').select('*')
      if (error) {
        console.error('Supabase error:', error)
        setStatus('❌ Connection failed. Check the console.')
      } else {
        console.log('Supabase data:', data)
        setStatus('✅ Supabase connected successfully!')
      }
    }

    checkConnection()
  }, [])

  // Prevent server/client mismatch by only rendering on client
  if (!isClient) return null

  return (
    <main className="p-6 text-lg">
      <h1>Boothly</h1>
      <p>{status} 🚀</p>

    </main>
  )
}
<p>THIS IS LIVE CODE</p>
