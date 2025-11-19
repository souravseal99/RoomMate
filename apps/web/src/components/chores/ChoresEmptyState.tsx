import { ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ChoresEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No chores found</h3>
      <p className="text-sm text-muted-foreground mb-4 text-center">
        There are no chores assigned to this household yet.
      </p>
      <Button
        className="bg-blue-600 hover:bg-blue-700 text-primary-foreground">
            Create a new chore
      </Button>
    </div>
  )
}