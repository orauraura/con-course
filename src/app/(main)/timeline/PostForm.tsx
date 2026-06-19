'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Paperclip, X, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function PostForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() && !file) return
    setLoading(true)

    const supabase = createClient()
    let file_url = null, file_name = null, file_type = null

    if (file) {
      const ext = file.name.split('.').pop()
      const path = `posts/${userId}/${Date.now()}.${ext}`
      const { data } = await supabase.storage.from('uploads').upload(path, file)
      if (data) {
        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(data.path)
        file_url = urlData.publicUrl
        file_name = file.name
        file_type = file.type
      }
    }

    await supabase.from('posts').insert({
      user_id: userId,
      content: content.trim(),
      file_url,
      file_name,
      file_type,
    })

    setContent('')
    setFile(null)
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="今何をしていますか？"
        rows={3}
        className="w-full resize-none focus:outline-none text-gray-700 placeholder-gray-400"
      />

      {file && (
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
          <Paperclip size={14} />
          <span className="truncate flex-1">{file.name}</span>
          <button type="button" onClick={() => setFile(null)}>
            <X size={14} className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#00b4aa] transition-colors"
        >
          <Paperclip size={16} />
          <span>添付ファイル</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          type="submit"
          disabled={loading || (!content.trim() && !file)}
          className="flex items-center gap-2 px-4 py-1.5 bg-[#00b4aa] hover:bg-[#009990] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
        >
          <Send size={14} />
          {loading ? '投稿中...' : '投稿する'}
        </button>
      </div>
    </form>
  )
}
