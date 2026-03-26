'use client'
import React, { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/layout/tabs"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useTechnicianTasks } from "@/hooks/use-tasks"
import { TechnicianTaskCard } from "./technician-task-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { TaskListSkeleton } from "@/components/ui/core/loaders"
import { Button } from "@/components/ui/core/button"
import { TasksDisplay } from "@/components/tasks/task_utils/tasks-display"
import { Input } from "@/components/ui/core/input"
import { Search } from "lucide-react"

function PaginationControls({
  taskCount,
  currentPage,
  count,
  totalPages,
  activeTab,
  setPages
}: Readonly<{
  taskCount: number
  currentPage: number
  count: number
  totalPages: number
  activeTab: string
  setPages: React.Dispatch<React.SetStateAction<Record<string, number>>>
}>) {
  return (
    <div className="flex items-center justify-between border-t pt-4 mt-4">
      <div className="text-sm text-gray-500">
        Showing {taskCount > 0 ? (currentPage - 1) * 10 + 1 : 0} to {Math.min(currentPage * 10, count)} of {count} tasks
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPages(prev => ({ ...prev, [activeTab]: Math.max(1, prev[activeTab] - 1) }))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPages(prev => ({ ...prev, [activeTab]: Math.min(totalPages, prev[activeTab] + 1) }))}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

// Shared task list card component
function TaskListCard({
  title,
  description,
  tasks,
  children,
  searchQuery,
  onSearchChange
}: Readonly<{
  title: string
  description: string
  tasks: any[]
  children?: React.ReactNode
  searchQuery: string
  onSearchChange: (query: string) => void
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search Input - Added for visibility */}
        <div className="mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks here ..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Task List */}
        {tasks?.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task) => (
              <TechnicianTaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            {searchQuery
              ? `No tasks found matching "${searchQuery}"`
              : "No tasks found"}
          </div>
        )}

        {children}
      </CardContent>
    </Card>
  )
}

export function TechnicianTasksPage() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTabParam = searchParams.get("tab")
  const userId = user?.id ? user.id.toString() : undefined
  const isWorkshopTech = user?.is_workshop || false
  const activeTab = activeTabParam || "in-progress"

  const [searchQuery, setSearchQuery] = useState("")
  const [pages, setPages] = useState<Record<string, number>>({
    'in-progress': 1,
    'completed': 1,
    'in-workshop': 1,
  })

  // Reset page when tab changes via URL
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    router.replace(`${pathname}?${params.toString()}`)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    // Reset all tab pages to 1 when search query changes
    setPages({
      'in-progress': 1,
      'completed': 1,
      'in-workshop': 1,
    })
  }

  const currentPage = pages[activeTab] || 1

  const {
    data: tasksData,
    isLoading,
    isError,
    error
  } = useTechnicianTasks(userId, isWorkshopTech, activeTab, currentPage, searchQuery)

  const tasks = tasksData?.results || []
  const count = tasksData?.count || 0
  const totalPages = Math.ceil(count / 10)

  if (isLoading && currentPage === 1) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <TaskListSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="text-red-500">Error: {error?.message}</div>
      </div>
    )
  }

  // Helper to render task content with search
  const renderTasksContent = (title: string, description: string) => (
    <TaskListCard
      title={title}
      description={description}
      tasks={tasks}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
    >
      <PaginationControls
        taskCount={tasks.length}
        currentPage={currentPage}
        count={count}
        totalPages={totalPages}
        activeTab={activeTab}
        setPages={setPages}
      />
    </TaskListCard>
  )

  if (isWorkshopTech) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="in-progress">
            {renderTasksContent("In Progress Tasks", "Tasks that are currently being worked on.")}
          </TabsContent>
          <TabsContent value="completed">
            {renderTasksContent("Completed Tasks", "Tasks that have been marked as completed.")}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tasks</h1>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="in-progress" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">In Progress</TabsTrigger>
          <TabsTrigger value="in-workshop" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">In Workshop</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="in-progress">
          {renderTasksContent("In Progress Tasks", "Tasks that are currently being worked on.")}
        </TabsContent>
        <TabsContent value="in-workshop">
          {renderTasksContent("In Workshop Tasks", "Tasks that are currently in the workshop.")}
        </TabsContent>
        <TabsContent value="completed">
          {renderTasksContent("Completed Tasks", "Tasks that have been marked as completed.")}
        </TabsContent>
      </Tabs>
    </div>
  )
}