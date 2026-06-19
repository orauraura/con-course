'use client'

import { useState, useEffect, useRef } from 'react'
import { Paperclip, Send, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import type { DirectMessageWithProfile } from '@/types/database'

export default function DMChat({
  senderId,
  receiverId,
  initialMessages,
}: {
  senderId: string
  receiverId: string
  initialMessages: DirectMessageWithProfile[]
}) {
  const [messages, setMessages] = useState<DirectMessageWithProfile[]>(initialMessages)
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`dm:${[senderId, receiverId].sort().join('-')}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        async (payload) => {
          const msg = payload.new as { sender_id: string; receiver_id: string; id: string }
          const isRelevant =
            (msg.sender_id === senderId && msg.receiver_id === receiverId) ||
            (msg.sender_id === receiverId && msg.receiver_id === senderId)
          if (!isRelevant) return

          const { data } = await supabase
            .from('direct_messages')
            .select('*, sender:profiles!direct_messages_sender_id_fkey(*), receiver:profiles!direct_messages_receiver_id_fkey(*)')
            .eq('id', msg.id)
            .single()
          if (data) setMessages((prev) => [...prev, data as DirectMessageWithProfile])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [senderId, receiverId])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() && !file) return
    setSending(true)

    let file_url = null, file_name = null, file_type = null

    if (file) {
      const ext = file.name.split('.').pop()
      const path = `dm/${[senderId, receiverId].sort().join('-')}/${Date.now()}.${ext}`
      const { data } = await supabase.storage.from('uploads').upload(path, file)
      if (data) {
        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(data.path)
        file_url = urlData.publicUrl
        file_name = file.name
        file_type = file.type
      }
    }

    await supabase.from('direct_messages').insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content: content.trim() || null,
      file_url,
      file_name,
      file_type,
    })

    setContent('')
    setFile(null)
    setSending(false)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => {
          const isMine = msg.sender_id === senderId
          const isImage = msg.file_type?.startsWith('image/')
          const isVideo = msg.file_type?.startsWith('video/')
          return (
            <div key={msg.id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-[#00b4aa] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {isMine ? msg.sender?.display_name?.[0] : msg.receiver?.display_name?.[0]}
              </div>
              <div className={`max-w-xs lg:max-w-md flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                {msg.content && (
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-[#00b4aa] text-white rounded-tr-sm'
                      : 'bg-white text-gray-700 rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                )}
                {msg.file_url && (
                  <div className="mt-1">
                    {isImage ? (
                      <img src={msg.file_url} alt={msg.file_name || ''} className="max-w-xs rounded-xl" />
                    ) : isVideo ? (
                      <video src={msg.file_url} controls className="max-w-xs rounded-xl" />
                    ) : (
                      <a
                        href={msg.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#00b4aa] bg-white px-3 py-2 rounded-lg shadow-sm hover:underline"
                      >
                        <Paperclip size={14} />
                        {msg.file_name}
                      </a>
                    )}
                  </div>
                )}
                <span className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ja })}
                  {isMine && msg.read_at && <span className="ml-1 text-[#00b4aa]">既読</span>}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t border-gray-200 bg-white p-4">
        {file && (
          <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <Paperclip size={14} />
            <span className="flex-1 truncate">{file.name}</span>
            <button type="button" onClick={() => setFile(null)}>
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="p-2 text-gray-400 hover:text-[#00b4aa] transition-colors"
          >
            <Paperclip size={20} />
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00b4aa] text-sm"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e) } }}
          />
          <button
            type="submit"
            disabled={sending || (!content.trim() && !file)}
            className="p-2 bg-[#00b4aa] hover:bg-[#009990] text-white rounded-full disabled:opacity-40 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}
