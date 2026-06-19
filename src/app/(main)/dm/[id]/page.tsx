import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DMChat from './DMChat'

export default async function DMConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: receiverId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: receiver } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', receiverId)
    .single()

  if (!receiver) notFound()

  const { data: messages } = await supabase
    .from('direct_messages')
    .select('*, sender:profiles!direct_messages_sender_id_fkey(*), receiver:profiles!direct_messages_receiver_id_fkey(*)')
    .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user!.id})`)
    .order('created_at', { ascending: true })
    .limit(100)

  await supabase
    .from('direct_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('sender_id', receiverId)
    .eq('receiver_id', user!.id)
    .is('read_at', null)

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#00b4aa] flex items-center justify-center text-white font-semibold">
          {receiver.display_name[0]}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{receiver.display_name}</p>
          <p className="text-xs text-gray-500">@{receiver.username}</p>
        </div>
      </div>

      <DMChat
        senderId={user!.id}
        receiverId={receiverId}
        initialMessages={messages || []}
      />
    </div>
  )
}
