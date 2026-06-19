import { createClient } from '@/lib/supabase/server'
import PostForm from './PostForm'
import PostCard from './PostCard'
import type { PostWithDetails } from '@/types/database'

export default async function TimelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rawPosts } = await supabase
    .from('posts')
    .select(`
      *,
      profiles(*),
      post_likes(id, user_id),
      post_comments(*, profiles(*))
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const posts = (rawPosts as unknown as (PostWithDetails & { post_likes: { user_id: string }[] })[]) || []

  const postsWithDetails = posts.map((post) => ({
    ...post,
    likes_count: post.post_likes?.length ?? 0,
    liked_by_me: post.post_likes?.some((l) => l.user_id === user?.id) ?? false,
  }))

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">タイムライン</h2>
      <PostForm userId={user!.id} />
      <div className="mt-4 space-y-4">
        {postsWithDetails.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={user!.id} />
        ))}
        {postsWithDetails.length === 0 && (
          <p className="text-center text-gray-400 py-10">まだ投稿がありません</p>
        )}
      </div>
    </div>
  )
}
