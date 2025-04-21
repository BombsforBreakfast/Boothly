'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [status, setStatus] = useState('Checking Supabase...')
  const [isClient, setIsClient] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('maker')
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
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

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const { data } = await supabase
          .from('maker_profiles')
          .select('role')
          .eq('user_id', currentUser.id)
          .single()
        const fetchedRole = data?.role ?? null
        setUserRole(fetchedRole)
        if (fetchedRole) router.push(`/dashboard/${fetchedRole}`)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const { data } = await supabase
          .from('maker_profiles')
          .select('role')
          .eq('user_id', currentUser.id)
          .single()
        const fetchedRole = data?.role ?? null
        setUserRole(fetchedRole)
        if (fetchedRole) router.push(`/dashboard/${fetchedRole}`)
      } else {
        setUserRole(null)
      }
    })

    return () => listener?.subscription.unsubscribe()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStatus('⏳ Processing... please wait.')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setStatus('')
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setStatus('')
        return
      }

      const userId = data.user?.id
      if (userId) {
        const { error: profileError } = await supabase.from('maker_profiles').insert([
          { user_id: userId, role },
        ])
        if (profileError) {
          console.error('Failed to save role:', profileError)
        }
      }

      setStatus(`✅ Sign-up successful! Please check ${email} to verify your account.`)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
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
          <p className="mb-4">Role: <strong>{userRole}</strong></p>
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
          {!isLogin && (
            <fieldset className="border border-gray-300 p-4 rounded">
              <legend className="font-semibold mb-2">I am a...</legend>
              <label className="block mb-2">
                <input
                  type="radio"
                  name="role"
                  value="maker"
                  checked={role === 'maker'}
                  onChange={(e) => setRole(e.target.value)}
                  className="mr-2"
                />
                Maker
              </label>
              <label className="block mb-2">
                <input
                  type="radio"
                  name="role"
                  value="organizer"
                  checked={role === 'organizer'}
                  onChange={(e) => setRole(e.target.value)}
                  className="mr-2"
                />
                Event Organizer
              </label>
              <label className="block">
                <input
                  type="radio"
                  name="role"
                  value="shop_owner"
                  checked={role === 'shop_owner'}
                  onChange={(e) => setRole(e.target.value)}
                  className="mr-2"
                />
                Shop Owner
              </label>
            </fieldset>
          )}
          {error && <p className="text-red-600">{error}</p>}
          <button
            className={`bg-blue-600 text-white px-4 py-2 rounded ${status.includes('⏳') ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={status.includes('⏳')}
          >
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