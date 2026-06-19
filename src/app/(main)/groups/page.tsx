import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'
import CreateGroupButton from './CreateGroupButton'
import type { Group } from '@/types/database'

type MyGroupRow = { group_id: string; groups: Group | null }

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rawMyGroups } = await supabase
    .from('group_members')
    .select('group_id, groups(*)')
    .eq('user_id', user!.id)

  const myGroups = rawMyGroups as unknown as MyGroupRow[]

  const { data: allGroups } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false })

  const myGroupIds = new Set(myGroups?.map((m) => m.group_id) || [])

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">グループ</h2>
        <CreateGroupButton userId={user!.id} />
      </div>

      {myGroups && myGroups.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">参加中のグループ</h3>
          <div className="space-y-2">
            {myGroups.map((m) => {
              const group = m.groups
              if (!group) return null
              return (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-full bg-[#00b4aa] flex items-center justify-center text-white">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{group.name}</p>
                    {group.description && (
                      <p className="text-sm text-gray-500 truncate">{group.description}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3">すべてのグループ</h3>
        <div className="space-y-2">
          {allGroups?.filter((g) => !myGroupIds.has(g.id)).map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <Users size={18} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{group.name}</p>
                {group.description && (
                  <p className="text-sm text-gray-500 truncate">{group.description}</p>
                )}
              </div>
              <span className="text-xs text-[#00b4aa] border border-[#00b4aa] px-2 py-0.5 rounded-full">
                参加する
              </span>
            </Link>
          ))}
          {(!allGroups || allGroups.length === 0) && (
            <p className="text-center text-gray-400 py-10">グループがありません</p>
          )}
        </div>
      </div>
    </div>
  )
}
