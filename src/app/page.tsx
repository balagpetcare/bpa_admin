import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { options as authOptions } from '@/app/api/auth/[...nextauth]/options'

export const dynamic = 'force-dynamic'

export default async function RootPage() {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect('/dashboard')
  } else {
    redirect('/auth/sign-in?redirectTo=/dashboard')
  }
}
