import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MessageSquare } from 'lucide-react'

export default async function DMPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', user!.id)
    .order('display_name')

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">ダイレクトメッセージ</h2>

      <div className="space-y-2">
        {profiles?.map((profile) => (
          <Link
            key={profile.id}
            href={`/dm/${profile.id}`}
            className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-[#00b4aa] flex items-center justify-center text-white font-semibold">
              {profile.display_name[0]}
            </div>
            <div>
              <p className="font-medium text-gray-800">{profile.display_name}</p>
              <p className="text-sm text-gray-500">@{profile.username}</p>
            </div>
          </Link>
        ))}
        {(!profiles || profiles.length === 0) && (
          <div className="text-center py-10 text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
            <p>他のユーザーがいません</p>
          </div>
        )}
      </div>
    </div>
  )
}
