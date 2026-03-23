import { cn } from "@/utils/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, AlertCircle, CheckCircle2, Trash2, Utensils, Droplets, Sparkles, Home, ShoppingCart, Leaf, Wrench } from "lucide-react"

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function PriorityBadge({ priority }: { priority: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const colors = {
    HIGH: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    LOW: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  }

  return (
    <Badge className={cn("font-medium", colors[priority])}>
      {priority}
    </Badge>
  )
}

function StatusBadge({ status }: { status: 'PENDING' | 'COMPLETED' | 'OVERDUE' }) {
  const statusConfig = {
    PENDING: { class: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Clock },
    COMPLETED: { class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle2 },
    OVERDUE: { class: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: AlertCircle },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge className={cn("font-medium flex items-center gap-1", config.class)}>
      {Icon && <Icon className="h-3 w-3" />}
      {status}
    </Badge>
  )
}

interface ChoreCardProps {
  title: string
  description: string
  dueDate: Date
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE'
  assignee: {
    name: string
    avatar?: string
  }
}

const getChoreIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('trash') || lowerTitle.includes('garbage')) return Trash2;
  if (lowerTitle.includes('dish') || lowerTitle.includes('kitchen') || lowerTitle.includes('cook')) return Utensils;
  if (lowerTitle.includes('water') || lowerTitle.includes('plant')) return Droplets;
  if (lowerTitle.includes('clean') || lowerTitle.includes('vacuum') || lowerTitle.includes('mop')) return Sparkles;
  if (lowerTitle.includes('laundry') || lowerTitle.includes('wash') || lowerTitle.includes('bed')) return Home;
  if (lowerTitle.includes('shop') || lowerTitle.includes('grocery') || lowerTitle.includes('buy')) return ShoppingCart;
  if (lowerTitle.includes('lawn') || lowerTitle.includes('mow') || lowerTitle.includes('garden')) return Leaf;
  if (lowerTitle.includes('fix') || lowerTitle.includes('repair')) return Wrench;
  return Home;
};

export function ChoreCard({ 
  title, 
  description, 
  dueDate, 
  priority, 
  status,
  assignee 
}: ChoreCardProps) {
  const ChoreIcon = getChoreIcon(title);
  
  return (
    <Card className={cn(
      "w-full h-full transition-all hover:shadow-lg border-2 cursor-pointer flex flex-col",
      status === 'COMPLETED' && "bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-800",
      status === 'OVERDUE' && "border-red-300 dark:border-red-800",
      status === 'PENDING' && "border-blue-300 dark:border-blue-800"
    )}>
      <CardHeader className="pb-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2.5 rounded-lg shrink-0",
            status === 'COMPLETED' && "bg-green-100 dark:bg-green-900",
            status === 'OVERDUE' && "bg-red-100 dark:bg-red-900",
            status === 'PENDING' && "bg-blue-100 dark:bg-blue-900"
          )}>
            <ChoreIcon className={cn(
              "h-5 w-5",
              status === 'COMPLETED' && "text-green-600 dark:text-green-400",
              status === 'OVERDUE' && "text-red-600 dark:text-red-400",
              status === 'PENDING' && "text-blue-600 dark:text-blue-400"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold leading-tight mb-1">{title}</CardTitle>
            <PriorityBadge priority={priority} />
          </div>
        </div>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-14 mt-auto">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={assignee.avatar} />
              <AvatarFallback className="text-xs">{assignee.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium truncate">{assignee.name}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarDays className="mr-1.5 h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{formatDate(dueDate)}</span>
            </div>
            <StatusBadge status={status} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}