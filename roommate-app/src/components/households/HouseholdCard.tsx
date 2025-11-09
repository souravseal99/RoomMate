import { useMemo, useState } from "react";
import { Clipboard, ClipboardCheck, Trash2Icon, Home, Pencil, AlertTriangle } from "lucide-react";
import type { HouseholdResponse } from "@/types/householdTypes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import householdApi from "@/api/householdApi";
import useHousehold from "@/hooks/useHousehold";

type Props = {
  household: HouseholdResponse;
};

function HouseholdCard({ household }: Props) {
  const [copied, setCopied] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newName, setNewName] = useState(household.name);
  const { fetchAllHouseholds } = useHousehold();
  const HouseholdApi = useMemo(householdApi, []);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(household.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleDelete = async () => {
    setIsDeleteOpen(false);
    try {
      await HouseholdApi.deleteCascated(household.householdId);
      toast({
        title: "Household deleted",
        description: "The household and all related data have been successfully deleted.",
      });
      setTimeout(() => {
        fetchAllHouseholds();
      }, 100);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete household. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    console.log('Edit clicked', newName);
    console.log('Household ID:', household.householdId);
    if (!newName.trim()) {
      alert('Please enter a household name');
      return;
    }
    try {
      const result = await HouseholdApi.update(household.householdId, { name: newName });
      console.log('Update result:', result);
      await fetchAllHouseholds();
      setIsEditOpen(false);
    } catch (error: any) {
      console.error('Full error:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      alert(error?.response?.data?.message || error?.message || 'Failed to update household name');
    }
  };

  return (
    <Card className="group bg-white/90 backdrop-blur-sm border border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 hover:scale-105 overflow-hidden w-full">
      <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      <CardContent className="p-6 overflow-hidden">
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{household.name}</h3>
              <p className="text-[10px] text-gray-500">{household.members?.length || 0} member{(household.members?.length || 0) !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Household</DialogTitle>
                  <DialogDescription>
                    Change the name of your household
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Household Name</Label>
                    <Input
                      id="name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter household name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="cursor-pointer">
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleEdit} className="cursor-pointer">Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    Delete Household
                  </DialogTitle>
                  <DialogDescription className="pt-2">
                    Are you sure you want to delete <strong>{household.name}</strong>?
                    <br /><br />
                    <strong className="text-red-600">⚠️ This will affect all {household.members?.length || 0} member(s) of this household.</strong>
                    <br /><br />
                    This action cannot be undone. All related data will be permanently deleted:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All expenses</li>
                      <li>All chores</li>
                      <li>All inventory items</li>
                      <li>All household members</li>
                    </ul>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} className="cursor-pointer">
                    Cancel
                  </Button>
                  <Button type="button" variant="destructive" onClick={handleDelete} className="cursor-pointer">
                    Delete Household
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {household.members && household.members.length > 0 && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 mb-3 shadow-inner">
            <div className="text-[10px] text-gray-600 mb-1 font-medium">Created by</div>
            <div className="text-sm font-semibold text-gray-900 truncate">{household.members[0]?.user?.name || 'Unknown'}</div>
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 mb-3 shadow-inner">
          <div className="text-[10px] text-gray-600 mb-1 font-medium">Invite Code</div>
          <div className="font-mono text-base font-bold text-gray-900">{household.inviteCode}</div>
        </div>

        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className={`w-full cursor-pointer transition-all duration-300 text-xs ${copied ? "text-green-600 border-green-300 bg-green-50" : "hover:bg-blue-50 hover:border-blue-300"}`}
        >
          {copied ? (
            <><ClipboardCheck className="w-3 h-3 mr-1" />Copied!</>
          ) : (
            <><Clipboard className="w-3 h-3 mr-1" />Copy Code</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default HouseholdCard;
