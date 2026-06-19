'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MessageSquare, Paperclip, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import type { PostWithDetails } from '@/types/database'

export default function PostCard({
  post,
  currentUserId,
}: {
  post: PostWithDetails
  currentUserId: string
}) {
  const router = useRouter()
  const [liked, setLiked] = useState(post.liked_by_me)
  const [likeCount, setLikeCount] = useState(post.likes_count)
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function toggleLike() {
    const supabase = createClient()
    if (liked) {
      await supabase.from('post_likes').delete()
        .eq('post_id', post.id).eq('user_id', currentUserId)
      setLikeCount((c) => c - 1)
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: currentUserId })
      setLikeCount((c) => c + 1)
    }
    setLiked(!liked)
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true)
    const supabase = createClient()
    await supabase.from('post_comments').insert({
      post_id: post.id,
      user_id: currentUserId,
      content: comment.trim(),
    })
    setComment('')
    setSubmitting(false)
    router.refresh()
  }

  async function deletePost() {
    if (!confirm('この投稿を削除しますか？')) return
    const supabase = createClient()
    await supabase.from('posts').delete().eq('id', post.id)
    router.refresh()
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ja })
  const isImage = post.file_type?.startsWith('image/')
  const isVideo = post.file_type?.startsWith('video/')

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[#00b4aa] flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {post.profiles.display_name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="font-medium text-gray-800 text-sm">{post.profiles.display_name}</span>
              <span className="text-gray-400 text-xs ml-2">@{post.profiles.username}</span>
              <span className="text-gray-400 text-xs ml-2">{timeAgo}</span>
            </div>
            {post.user_id === currentUserId && (
              <button onClick={deletePost} className="text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <p className="text-gray-700 mt-2 text-sm whitespace-pre-wrap">{post.content}</p>

          {post.file_url && (
            <div className="mt-3">
              {isImage ? (
                <img
                  src={post.file_url}
                  alt={post.file_name || 'attachment'}
                  className="max-w-full rounded-lg max-h-72 object-cover"
                />
              ) : isVideo ? (
                <video
                  src={post.file_url}
                  controls
                  className="max-w-full rounded-lg max-h-72"
                />
              ) : (
                <a
                  href={post.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#00b4aa] hover:underline bg-gray-50 px-3 py-2 rounded-lg w-fit"
                >
                  <Paperclip size={14} />
                  <span>{post.file_name}</span>
                </a>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
              <span>{likeCount}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#00b4aa] transition-colors"
            >
              <MessageSquare size={16} />
              <span>{post.post_comments?.length ?? 0}</span>
              {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {showComments && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              {post.post_comments?.map((c) => (
                <div key={c.id} className="flex gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs shrink-0">
                    {c.profiles?.display_name?.[0]}
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-1.5 flex-1">
                    <span className="text-xs font-medium text-gray-700">{c.profiles?.display_name}</span>
                    <p className="text-xs text-gray-600 mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}

              <form onSubmit={submitComment} className="flex gap-2 mt-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="コメントを入力..."
                  className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00b4aa]"
                />
                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  className="px-3 py-1.5 bg-[#00b4aa] text-white text-sm rounded-lg hover:bg-[#009990] disabled:opacity-40 transition-colors"
                >
                  送信
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
