'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

export default function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [bio, setBio] = useState(profile.bio || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    await supabase
      .from('profiles')
      .update({ display_name: displayName, bio: bio || null })
      .eq('id', profile.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-[#00b4aa] flex items-center justify-center text-white text-2xl font-bold">
          {profile.display_name[0]}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">{profile.display_name}</p>
          <p className="text-sm text-gray-500">@{profile.username}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">表示名</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4aa] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ユーザーID</label>
          <input
            value={profile.username}
            disabled
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4aa] focus:border-transparent resize-none"
            placeholder="自己紹介を書いてください..."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-[#00b4aa] hover:bg-[#009990] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? '保存中...' : saved ? '保存しました！' : '保存する'}
        </button>
      </form>
    </div>
  )
}
