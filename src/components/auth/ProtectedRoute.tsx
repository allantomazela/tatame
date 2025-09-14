import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { UserType } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'

interface ProtectedRouteProps {
  children: ReactNode
  allowedUserTypes?: UserType[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  allowedUserTypes, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useSupabaseAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (allowedUserTypes && !allowedUserTypes.includes(profile.user_type)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}