'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import EventCalendar from '@/components/EventCalendar'

export default function MakerDashboard() {
  const [bio, setBio] = useState('')
  const [profileUrl, setProfileUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [portfolio, setPortfolio] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data?.user?.id ?? null)
    }
    fetchUser()
  }, [])

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'profile' | 'logo' | 'portfolio'
  ) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    const filePath = `${userId}/${type}/${file.name}`
    setUploading(true)

    const { error } = await supabase.storage.from('user-uploads').upload(filePath, file, {
      upsert: true,
    })

    if (error) {
      alert('Upload failed: ' + error.message)
    } else {
      const publicUrl = supabase.storage.from('user_uploads').getPublicUrl(filePath).data.publicUrl
      if (type === 'profile') setProfileUrl(publicUrl)
      if (type === 'logo') setLogoUrl(publicUrl)
      if (type === 'portfolio') setPortfolio(prev => [...prev, publicUrl])
    }

    setUploading(false)
  }

  const handleSave = async () => {
    if (!userId) {
      alert('User not authenticated.')
      return
    }

    const { error } = await supabase.from('maker_profiles').upsert({
      user_id: userId,
      bio,
      profile_url: profileUrl,
      logo_url: logoUrl,
      portfolio_urls: portfolio,
    })

    if (error) {
      alert('Failed to save: ' + error.message)
    } else {
      alert('Profile saved!')
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Maker Dashboard</h1>

      <div className="mb-4">
        <label className="block font-medium mb-1">Profile Photo</label>
        <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'profile')} />
        {profileUrl && <Image src={profileUrl} alt="Profile" width={120} height={120} className="rounded-full mt-2" />}
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Logo (optional)</label>
        <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
        {logoUrl && <Image src={logoUrl} alt="Logo" width={100} height={100} className="mt-2" />}
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Bio</label>
        <textarea
          className="w-full p-2 border rounded"
          rows={4}
          value={bio}
          onChange={e => setBio(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Portfolio Images (up to 10)</label>
        <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'portfolio')} />
        <div className="flex flex-wrap gap-2 mt-2">
          {portfolio.map((url, idx) => (
            <Image key={idx} src={url} alt={`Portfolio ${idx}`} width={100} height={100} className="rounded" />
          ))}
        </div>
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleSave}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Save Profile'}
      </button>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
        <EventCalendar />
      </div>
    </main>
  )
}