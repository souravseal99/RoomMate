import { useState, useMemo, useEffect } from 'react';
import { ChoreCard } from "@/components/chores/ChoresLayout";
import { ChoreDialog } from "@/components/chores/ChoreDialog";
import { ChoresEmptyState } from "@/components/chores/ChoresEmptyState";
import HouseholdSelector from "@/components/expenses/HouseholdSelector";
import type { ChoreItem, ChoreStatus } from "@/types/choreTypes";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel,
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter,
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit } from "lucide-react";
import { choreApi } from "@/api/choreApi";
import { toast } from "sonner";
import useHousehold from "@/hooks/useHousehold";

function Chores() {
  const { selectedHousehold } = useHousehold();
  const [chores, setChores] = useState<ChoreItem[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("dueDate")
  const [loading, setLoading] = useState(false)
  const [selectedChore, setSelectedChore] = useState<ChoreItem | null>(null)

  const getChoreStatus = (chore: ChoreItem): ChoreStatus => {
    if (chore.completed) return 'COMPLETED';
    if (new Date(chore.nextDue) < new Date()) return 'OVERDUE';
    return 'PENDING';
  }

  const filteredAndSortedChores = useMemo(() => {
    let filtered = chores.filter(chore => 
      !selectedHousehold?.key || chore.householdId === selectedHousehold.key
    );

    if (statusFilter !== "all") {
      filtered = filtered.filter(chore => {
        const status = getChoreStatus(chore);
        return status.toLowerCase() === statusFilter;
      });
    }

    return filtered.sort((a, b) => {
      if (sortBy === "dueDate") {
        return new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime();
      } else if (sortBy === "priority") {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === "assignee") {
        return (a.assignedToName || 'Unassigned').localeCompare(b.assignedToName || 'Unassigned');
      }
      return 0;
    });
  }, [chores, selectedHousehold?.key, statusFilter, sortBy]);

  useEffect(() => {
    if (selectedHousehold?.key) {
      fetchChores();
    } else {
      setChores([]);
    }
  }, [selectedHousehold?.key]);

  const fetchChores = async () => {
    if (!selectedHousehold?.key) return;
    setLoading(true);
    try {
      const data = await choreApi.getChoresByHousehold(selectedHousehold.key);
      setChores((data || []).map(chore => ({
        ...chore,
        assignedToName: chore.assignedTo?.name || '',
        priority: chore.priority || 'MEDIUM',
        notes: chore.notes || '',
      })));
    } catch (error) {
      console.error('Fetch chores error:', error);
      toast.error('Failed to fetch chores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChore = async (newChore: Partial<ChoreItem>) => {
    if (!selectedHousehold?.key) {
      toast.error('Please select a household first');
      return;
    }
    try {
      const choreData: any = {
        householdId: selectedHousehold.key,
        description: newChore.description,
        frequency: newChore.frequency,
        priority: newChore.priority || 'MEDIUM',
        notes: newChore.notes || '',
        nextDue: newChore.nextDue ? new Date(newChore.nextDue).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
      };
      
      if (newChore.assignedToId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newChore.assignedToId)) {
        choreData.assignedToId = newChore.assignedToId;
      }
      
      await choreApi.createChore(choreData);
      toast.success('Chore created successfully');
      await fetchChores();
    } catch (error: any) {
      console.error('Create chore error:', error?.response?.data);
      toast.error(error?.response?.data?.errorMessage || error?.response?.data?.message || 'Failed to create chore');
    }
  }

  const handleUpdateChore = async (updatedChore: Partial<ChoreItem>) => {
    if (!updatedChore.choreId) return;
    try {
      const updateData: any = {
        description: updatedChore.description,
        frequency: updatedChore.frequency,
        priority: updatedChore.priority,
        notes: updatedChore.notes,
        completed: updatedChore.completed,
        nextDue: updatedChore.nextDue ? new Date(updatedChore.nextDue).toLocaleDateString('en-GB') : undefined,
      };
      
      if (updatedChore.assignedToId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(updatedChore.assignedToId)) {
        updateData.assignedToId = updatedChore.assignedToId;
      }
      
      console.log('Updating chore:', updateData);
      await choreApi.updateChore(updatedChore.choreId, updateData);
      toast.success('Chore updated successfully');
      await fetchChores();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error?.response?.data?.errorMessage || error?.response?.data?.message || 'Failed to update chore');
    }
  }

  const handleDeleteChore = async (choreId: string) => {
    try {
      await choreApi.deleteChore(choreId);
      toast.success('Chore deleted successfully');
      fetchChores();
    } catch (error) {
      toast.error('Failed to delete chore');
      console.error(error);
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Chores Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Organize and track your household chores</p>
        </div>
        <ChoreDialog mode="create" onSave={handleCreateChore} />
      </div>

      <div className="flex flex-col gap-4">
        <HouseholdSelector />
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Filter by Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full cursor-pointer bg-card border-2">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">📋 All Chores</SelectItem>
                <SelectItem value="pending" className="cursor-pointer">⏳ Pending</SelectItem>
                <SelectItem value="completed" className="cursor-pointer">✅ Completed</SelectItem>
                <SelectItem value="overdue" className="cursor-pointer">🔴 Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Sort by</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full cursor-pointer bg-card border-2">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate" className="cursor-pointer">📅 Due Date</SelectItem>
                <SelectItem value="priority" className="cursor-pointer">⚡ Priority</SelectItem>
                <SelectItem value="assignee" className="cursor-pointer">👤 Assignee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading chores...</div>
      ) : !selectedHousehold?.key ? (
        <div className="text-center py-12 text-muted-foreground">Please select a household to view chores</div>
      ) : filteredAndSortedChores.length === 0 ? (
        <ChoresEmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedChores.map((chore) => (
            <div key={chore.choreId} className="relative">
              <div onClick={() => setSelectedChore(chore)} className="cursor-pointer">
                <ChoreCard
                  title={chore.description}
                  description={`Frequency: ${chore.frequency}`}
                  dueDate={new Date(chore.nextDue)}
                  priority={chore.priority}
                  status={getChoreStatus(chore)}
                  assignee={{
                    name: chore.assignedToName || 'Unassigned',
                    avatar: undefined
                  }}
                />
              </div>
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                <ChoreDialog 
                  mode="edit" 
                  chore={chore} 
                  onSave={handleUpdateChore} 
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/90 hover:bg-red-50 cursor-pointer shadow-sm">
                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Chore</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this chore? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-slate-600 text-black-100 hover:bg-white/3 cursor-pointer">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteChore(chore.choreId)} className="bg-red-600 hover:bg-red-700 text-primary-foreground cursor-pointer">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedChore && (
        <Dialog open={!!selectedChore} onOpenChange={() => setSelectedChore(null)}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold break-words">{selectedChore.description}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <p className="font-semibold text-sm">{selectedChore.priority || 'MEDIUM'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Frequency</p>
                  <p className="font-semibold text-sm capitalize">{selectedChore.frequency}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="font-semibold text-sm">{new Date(selectedChore.nextDue).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-semibold text-sm">{getChoreStatus(selectedChore)}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Assigned To</p>
                <p className="font-semibold text-sm">{selectedChore.assignedToName || 'Unassigned'}</p>
              </div>

              {selectedChore.notes && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold">Notes</p>
                  <div className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap break-words">
                    {selectedChore.notes}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default Chores
