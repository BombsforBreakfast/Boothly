'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function OrganizerDashboard() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [cost, setCost] = useState('')
  const [applicationLink, setApplicationLink] = useState('')
  const [flyerFile, setFlyerFile] = useState<File | null>(null)
  const [flyerUrl, setFlyerUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

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
        router.push('/') // redirect to login if not logged in
      }
    }

    getUser()
  }, [router])

  const handleUpload = async () => {
    if (!flyerFile) return null
    const filePath = `flyers/${Date.now()}_${flyerFile.name}`
    setUploading(true)

    const { error } = await supabase.storage.from('event-flyers').upload(filePath, flyerFile)
    if (error) {
      alert('Flyer upload failed: ' + error.message)
      console.error('Upload error:', error)
      setUploading(false)
      return null
    }

    const { data } = supabase.storage.from('event-flyers').getPublicUrl(filePath)
    setFlyerUrl(data.publicUrl)
    setUploading(false)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const uploadedUrl = flyerFile ? await handleUpload() : null

    const { error } = await supabase.from('events').insert([
      {
        name: eventName,
        date: eventDate,
        address,
        phone,
        contact_email: email,
        cost_structure: cost,
        application_link: applicationLink,
        flyer_url: uploadedUrl,
      }
    ])

    if (error) {
      console.error('Insert error:', error)
      alert('Event creation failed: ' + error.message)
    } else {
      alert('🎉 Event created successfully!')
      setEventName('')
      setEventDate('')
      setAddress('')
      setPhone('')
      setEmail('')
      setCost('')
      setApplicationLink('')
      setFlyerFile(null)
      setFlyerUrl(null)
    }
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🎪 Organizer Dashboard</h1>
      <p>Welcome, <strong>{userEmail}</strong></p>

      <h2 className="text-xl font-semibold mt-10 mb-4">Add New Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" required placeholder="Event Name" value={eventName} onChange={e => setEventName(e.target.value)} className="w-full p-2 border rounded" />
        <input type="date" required value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full p-2 border rounded" />
        <input type="text" required placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 border rounded" />
        <input type="tel" required placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded" />
        <input type="email" required placeholder="Email Contact" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" />
        <textarea placeholder="Basic Cost Structure" value={cost} onChange={e => setCost(e.target.value)} className="w-full p-2 border rounded" rows={3} />
        <input type="url" placeholder="Application Link" value={applicationLink} onChange={e => setApplicationLink(e.target.value)} className="w-full p-2 border rounded" />

        <div>
          <label className="block font-medium mb-1">Upload Event Flyer</label>
          <input type="file" accept="image/*" onChange={e => setFlyerFile(e.target.files?.[0] ?? null)} />
          {flyerUrl && (
            <img src={flyerUrl} alt="Flyer" className="mt-2 rounded border w-48" />
          )}
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={uploading}>
          {uploading ? 'Uploading flyer...' : 'Create Event'}
        </button>
      </form>
    </main>
  )
}