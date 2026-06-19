'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function JoinButton({ groupId, userId }: { groupId: string; userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function join() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('group_members').insert({ group_id: groupId, user_id: userId, role: 'member' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={join}
      disabled={loading}
      className="px-4 py-2 bg-[#00b4aa] hover:bg-[#009990] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? '参加中...' : '参加する'}
    </button>
  )
}
