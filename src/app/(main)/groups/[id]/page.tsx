import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GroupChat from './GroupChat'
import JoinButton from './JoinButton'
import type { GroupMember, GroupMessageWithProfile } from '@/types/database'

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: group } = await supabase.from('groups').select('*').eq('id', id).single()
  if (!group) notFound()

  const { data: rawMembers } = await supabase
    .from('group_members')
    .select('*, profiles(*)')
    .eq('group_id', id)

  const members = rawMembers as unknown as GroupMember[]
  const isMember = members?.some((m) => m.user_id === user!.id) ?? false

  const { data: rawMessages } = isMember
    ? await supabase
        .from('group_messages')
        .select('*, profiles(*)')
        .eq('group_id', id)
        .order('created_at', { ascending: true })
        .limit(100)
    : { data: [] }

  const messages = rawMessages as unknown as GroupMessageWithProfile[]

  return (
    <div className="flex flex-col h-[calc(100svh-4rem)] md:h-screen">
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{group.name}</h2>
          {group.description && (
            <p className="text-sm text-gray-500">{group.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{members?.length ?? 0}名</span>
          {!isMember && <JoinButton groupId={id} userId={user!.id} />}
        </div>
      </div>

      {isMember ? (
        <GroupChat
          groupId={id}
          userId={user!.id}
          initialMessages={messages}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p>このグループに参加するとメッセージを送受信できます</p>
        </div>
      )}
    </div>
  )
}
