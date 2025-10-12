import { Button } from "@/components/ui/button";
import { HousePlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import householdApi from "@/api/householdApi";
import useHousehold from "@/hooks/useHousehold";

function CreateHouseholdSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [householdName, setHouseholdName] = useState("");

  const HouseholdApi = useMemo(householdApi, []);
  const { fetchAllHouseholds } = useHousehold();

  const handleSubmit = async () => {
    if (!householdName.trim()) return;
    try {
      await HouseholdApi.create({ name: householdName });
      setIsOpen(false);
      setHouseholdName("");
      fetchAllHouseholds();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all">
          <HousePlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Create Household</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Household</DialogTitle>
          <DialogDescription>
            Enter a name for your new shared living space
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Household Name</Label>
            <Input
              id="name"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="e.g., Downtown Apartment"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} className="cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!householdName.trim()} className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white">
            Create Household
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateHouseholdSheet;
