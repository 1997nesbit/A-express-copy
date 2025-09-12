"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout"
import { NewTaskForm } from "@/components/tasks/new-task-form"

export default function NewTaskPage() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  // Check if user can create new tasks (Admin, Manager, or Front Desk roles)
  const canCreateTasks = user?.role === "Administrator" || user?.role === "Manager" || user?.role === "Front Desk"

  if (!canCreateTasks) {
    return (
      <DashboardLayout>
        <div className="flex-1 p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to create new tasks.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <NewTaskForm />
    </DashboardLayout>
  )
}
