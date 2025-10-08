import { useMemo, useState } from "react";
import { Clipboard, ClipboardCheck, Trash2Icon, Home, Pencil } from "lucide-react";
import type { HouseholdResponse } from "@/types/hosueholdTypes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import householdApi from "@/api/householdApi";
import useHousehold from "@/hooks/useHousehold";

type Props = {
  household: HouseholdResponse;
};

function HouseholdCard({ household }: Props) {
  const [copied, setCopied] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newName, setNewName] = useState(household.name);
  const { fetchAllHouseholds } = useHousehold();
  const HouseholdApi = useMemo(householdApi, []);

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
    if (confirm("Delete this household?")) {
      await HouseholdApi.deleteCascated(household.householdId);
      await fetchAllHouseholds();
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
    <Card className="group bg-white/90 backdrop-blur-sm border border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 hover:scale-105 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
              <Home className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{household.name}</h3>
              <p className="text-xs text-gray-500">Active household</p>
            </div>
          </div>
          <div className="flex gap-1">
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
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
              onClick={handleDelete}
            >
              <Trash2Icon className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 shadow-inner">
          <div className="text-xs text-gray-600 mb-2 font-medium">Invite Code</div>
          <div className="font-mono text-xl font-bold text-gray-900">{household.inviteCode}</div>
        </div>
        
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className={`w-full cursor-pointer transition-all duration-300 ${copied ? "text-green-600 border-green-300 bg-green-50" : "hover:bg-blue-50 hover:border-blue-300"}`}
        >
          {copied ? (
            <><ClipboardCheck className="w-4 h-4 mr-2" />Copied!</>
          ) : (
            <><Clipboard className="w-4 h-4 mr-2" />Copy Code</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default HouseholdCard;
