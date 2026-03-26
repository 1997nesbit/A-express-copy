'use client'
import { Button } from "@/components/ui/core/button"
import { StatusBadge, UrgencyBadge, WorkshopStatusBadge } from "@/components/tasks/task_utils/task-badges"
import { Laptop } from "lucide-react"
import { Task } from "@/components/tasks/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card"

interface TechnicianTaskCardProps {
    task: Task
}

export function TechnicianTaskCard({ task }: Readonly<TechnicianTaskCardProps>) {
    return (
        <Card className="mb-4">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{task.customer_details?.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">Task ID: {task.title}</p>
                    </div>
                    <div className="flex gap-2">
                        <UrgencyBadge urgency={task.urgency} />
                        <StatusBadge status={task.status} />
                        {task.workshop_status && (
                            <WorkshopStatusBadge status={task.workshop_status} />
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="mb-2">{task.description}</p>
                <p className="text-sm font-medium">
                    {task.brand_details?.name} {task.laptop_model_details?.name || task.laptop_model}
                </p>
                <div className="mt-4">
                    <Button variant="outline" size="sm" asChild>
                        <a href={`/dashboard/tasks/${encodeURIComponent(task.title)}`}>View Details</a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}