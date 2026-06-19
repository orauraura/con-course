export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
        }
        Update: {
          username?: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          file_url: string | null
          file_name: string | null
          file_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          file_url?: string | null
          file_name?: string | null
          file_type?: string | null
          created_at?: string
        }
        Update: {
          content?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
        }
        Relationships: []
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          role?: string
        }
        Relationships: []
      }
      group_messages: {
        Row: {
          id: string
          group_id: string
          user_id: string
          content: string | null
          file_url: string | null
          file_name: string | null
          file_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          content?: string | null
          file_url?: string | null
          file_name?: string | null
          file_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string | null
          file_url: string | null
          file_name: string | null
          file_type: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content?: string | null
          file_url?: string | null
          file_name?: string | null
          file_type?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          read_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type PostLike = Database['public']['Tables']['post_likes']['Row']
export type PostComment = Database['public']['Tables']['post_comments']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type GroupMessage = Database['public']['Tables']['group_messages']['Row']
export type DirectMessage = Database['public']['Tables']['direct_messages']['Row']

export type PostWithDetails = Post & {
  profiles: Profile
  post_likes: PostLike[]
  post_comments: (PostComment & { profiles: Profile })[]
  likes_count: number
  liked_by_me: boolean
}

export type GroupMessageWithProfile = GroupMessage & {
  profiles: Profile
}

export type DirectMessageWithProfile = DirectMessage & {
  sender: Profile
  receiver: Profile
}
