import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ChoresFilters() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4">
      <Select defaultValue="all">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Chores</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="dueDate">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dueDate">Due Date</SelectItem>
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="assignee">Assignee</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}