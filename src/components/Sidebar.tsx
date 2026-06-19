'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, MessageSquare, Users, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

const navItems = [
  { href: '/timeline', icon: Home, label: 'タイムライン' },
  { href: '/groups', icon: Users, label: 'グループ' },
  { href: '/dm', icon: MessageSquare, label: 'DM' },
  { href: '/profile', icon: User, label: 'プロフィール' },
]

export default function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-5 border-b border-gray-100">
        <h1 className="text-xl font-bold text-[#00b4aa]">Talknote</h1>
      </div>

      <nav className="flex-1 p-3">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors ${
                active
                  ? 'bg-[#e6f7f6] text-[#00b4aa] font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#00b4aa] flex items-center justify-center text-white text-sm font-semibold">
            {profile.display_name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{profile.display_name}</p>
            <p className="text-xs text-gray-500 truncate">@{profile.username}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors w-full px-2 py-1.5 rounded hover:bg-red-50"
        >
          <LogOut size={16} />
          <span>ログアウト</span>
        </button>
      </div>
    </aside>
  )
}
