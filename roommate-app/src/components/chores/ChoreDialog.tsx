import { useState, useEffect } from "react"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea.tsx"
import { CalendarDatePicker } from "@/components/ui/calendar"
import type { ChoreItem, ChoreFrequency, ChorePriority } from "@/types/choreTypes"

interface ChoreDialogProps {
  chore?: ChoreItem
  onSave: (chore: Partial<ChoreItem>) => void
  mode: 'create' | 'edit'
}

export function ChoreDialog({ chore, onSave, mode }: ChoreDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<ChoreItem>>({
    description: "",
    priority: "MEDIUM" as ChorePriority,
    frequency: "weekly" as ChoreFrequency,
    nextDue: undefined,
    assignedToId: undefined,
    completed: false,
    notes: "",
    ...(chore || {}),
  })

  useEffect(() => {
    if (mode === "edit" && chore) {
      setFormData({ ...chore })
    } else if (mode === "create") {
      setFormData({
        description: "",
        priority: "MEDIUM",
        frequency: "weekly",
        nextDue: undefined,
        assignedToId: undefined,
        completed: false,
        notes: "",
      })
    }
  }, [chore, mode, open])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.description?.trim()) {
      alert('Please enter a chore title');
      return;
    }
    if (!formData.nextDue) {
      alert('Please select a due date');
      return;
    }
    
    const payload: Partial<ChoreItem> = {
      description: formData.description,
      frequency: formData.frequency,
      priority: formData.priority,
      nextDue: formData.nextDue,
      assignedToId: formData.assignedToId,
      notes: formData.notes,
      completed: Boolean(formData.completed),
    }
    
    if (mode === 'edit' && chore?.choreId) {
      payload.choreId = chore.choreId;
    }
    
    onSave(payload)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-primary-foreground shadow-md cursor-pointer"
            aria-label="Create chore"
          >
            + Create Chore
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/90 hover:bg-blue-50 cursor-pointer shadow-sm" aria-label="Edit chore">
            <Edit className="h-3.5 w-3.5 text-blue-600" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {mode === "create" ? "Create New Chore" : "Edit Chore"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-3 py-2" noValidate>
          <div className="grid gap-1">
            <Label htmlFor="chore-description" className="text-sm">
              Title
            </Label>
            <Input
              id="chore-description"
              placeholder="e.g. Clean kitchen"
              value={String(formData.description ?? "")}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="bg-white/5 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label className="text-sm">Priority</Label>
              <Select
                value={formData.priority || "MEDIUM"}
                onValueChange={(value: ChorePriority) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1">
              <Label className="text-sm">Frequency</Label>
              <Select
                value={formData.frequency || "weekly"}
                onValueChange={(value: ChoreFrequency) =>
                  setFormData({ ...formData, frequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="twice-weekly">Twice Weekly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <div className="grid gap-1">
              <Label className="text-sm">Due date *</Label>
              <CalendarDatePicker
                date={formData.nextDue ? new Date(formData.nextDue) : undefined}
                onSelect={(d) => setFormData({ ...formData, nextDue: d?.toISOString() })}
              />

            </div>

            <div className="grid gap-1">
              <Label className="text-sm">Assign to</Label>
              <Select
                value={formData.assignedToId || "unassigned"}
                onValueChange={(value) => setFormData({ ...formData, assignedToId: value === "unassigned" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>

            </div>
          </div>

          <div className="grid gap-1">
            <Label className="text-sm">Notes</Label>
            <Textarea
              placeholder="Additional notes (optional)"
              value={String(formData.notes ?? "")}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-[60px] bg-white/5 text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2">
                <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center gap-2 text-sm cursor-pointer">
                    <input
                        type="checkbox"
                        checked={Boolean(formData.completed)}
                        onChange={(e) =>
                            setFormData({ ...formData, completed: e.target.checked })
                        }
                        className="peer h-5 w-5 appearance-none border-2 border-black rounded bg-white checked:bg-black transition-colors duration-200 cursor-pointer"
                    />
                    {/* White tick icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="white"
                        className="absolute w-3 h-3 left-1 top-1 opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none"
                    >
                        <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293A1 1 0 003.293 10.707l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                        clipRule="evenodd"
                        />
                    </svg>
                    <span className="text-sm text-black">Mark as completed</span>
                </label>
                </div>


            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-slate-600 text-black-100 hover:bg-white/3 cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-primary-foreground shadow-md cursor-pointer"
                aria-label={mode === "create" ? "Create chore" : "Save changes"}
              >
                {mode === "create" ? "Create chore" : "Save changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}