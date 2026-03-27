"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/layout/card"

export function PrintTasksPreview({ report }: { report: any }) {
    if (!report || !report.tasks) return null

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{report.summary?.total_tasks || 0}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tasks List</CardTitle>
                    <CardDescription>
                        {report.summary?.duration_description} ({report.summary?.start_date} - {report.summary?.end_date})
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Task</th>
                                    <th className="px-4 py-3 font-medium">Customer</th>
                                    <th className="px-4 py-3 font-medium">Model</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Technician</th>
                                    <th className="px-4 py-3 font-medium text-right">Debt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.tasks.map((task: any, index: number) => (
                                    <tr key={index} className="border-b last:border-0 hover:bg-gray-50/50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{task.task_title}</td>
                                        <td className="px-4 py-3">{task.customer_name}</td>
                                        <td className="px-4 py-3">{task.brand} {task.laptop_model !== "N/A" ? task.laptop_model : ""}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {task.status || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{task.technician}</td>
                                        <td className="px-4 py-3 text-right">
                                            {task.is_debt ? (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Yes</span>
                                            ) : (
                                                <span className="text-gray-500">No</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {report.tasks.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            No tasks found for this period
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
