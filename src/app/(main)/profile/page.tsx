import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">プロフィール</h2>
      {profile && <ProfileForm profile={profile} />}
    </div>
  )
}
