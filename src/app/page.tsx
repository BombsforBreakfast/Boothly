'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

export default function Home() {
  const [status, setStatus] = useState('Checking Supabase...')
  const [isClient, setIsClient] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  useEffect(() => {
    setIsClient(true)

    const checkConnection = async () => {
      const { error } = await supabase.from('test_table').select('*')
      if (error) {
        console.error('Supabase error:', error)
        setStatus('❌ Connection failed. Check the console.')
      } else {
        setStatus('✅ Supabase connected successfully! 🚀')
      }
    }

    checkConnection()

    // Auth session listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (!isClient) return null

  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">Boothly</h1>
      <p className="mb-4">{status}</p>
      <p className="mb-6 text-green-700 font-bold">THIS IS LIVE CODE</p>

      {user ? (
        <>
          <p className="mb-4">👋 Logged in as <strong>{user.email}</strong></p>
          <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleLogout}>
            Log out
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border p-2 rounded"
          />
          {error && <p className="text-red-600">{error}</p>}
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            {isLogin ? 'Log in' : 'Sign up'}
          </button>
          <p className="text-sm text-center">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              className="text-blue-600 underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </form>
      )}
    </main>
  )
}
