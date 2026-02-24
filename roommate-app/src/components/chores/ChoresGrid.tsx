import { ChoreCard } from './ChoresLayout'
import type { ChoreItem } from '@/types/choreTypes'

export function ChoresGrid({ chores }: { chores: ChoreItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {chores.map((chore) => (
        <ChoreCard
          key={chore.choreId}
          title={chore.description}
          description={`Frequency: ${chore.frequency}`}
          dueDate={new Date(chore.nextDue)}
          priority={chore.priority}
          status={chore.completed ? 'COMPLETED' : new Date(chore.nextDue) < new Date() ? 'OVERDUE' : 'PENDING'}
          assignee={{ name: chore.assignedToName || 'Unassigned', avatar: undefined }}
        />
      ))}
    </div>
  )
}