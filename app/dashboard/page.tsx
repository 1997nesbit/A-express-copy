"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout"
import { AdminDashboard } from "@/components/dashboard/overviews/admin-dashboard"
import { ManagerDashboard } from "@/components/dashboard/overviews/manager-dashboard"
import { TechnicianDashboard } from "@/components/dashboard/overviews/technician-dashboard"
import { FrontDeskDashboard } from "@/components/dashboard/overviews/front-desk-dashboard"
import AccountantDashboard from "@/components/dashboard/overviews/accountant-dashboard"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "Administrator":
        return <AdminDashboard />
      case "Manager":
        return <ManagerDashboard />
      case "Technician":
        return <TechnicianDashboard />
      case "Front Desk":
        return <FrontDeskDashboard />
      case "Accountant":
        return <AccountantDashboard />
      default:
        return <div>Unknown role</div>
    }
  }

  return <DashboardLayout>{renderDashboard()}</DashboardLayout>
}
