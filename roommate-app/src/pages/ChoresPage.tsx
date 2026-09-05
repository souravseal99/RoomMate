import { ChoresGrid } from '@/components/chores/ChoresGrid';
import { ChoresFilters } from '@/components/chores/ChoresFilters';
import { ChoresEmptyState } from '@/components/chores/ChoresEmptyState';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';

export function ChoresPage() {
  const [chores] = useState([]);
  const [isLoading] = useState(true);

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Household Chores</h1>
          <p className="text-muted-foreground">Manage and track household chores</p>
        </div>
        <Button className="whitespace-nowrap">
          <Plus className="mr-2 h-4 w-4" /> Add New Chore
        </Button>
      </div>

      <ChoresFilters />

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : chores.length > 0 ? (
        <ChoresGrid chores={chores} />
      ) : (
        <ChoresEmptyState />
      )}
    </div>
  );
}
