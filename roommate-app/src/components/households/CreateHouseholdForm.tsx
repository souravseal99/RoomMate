import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async () => {
    if (!householdName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      await HouseholdApi.create({ name: householdName });
      // success
      toast({ title: "Household created", description: "Your household was created successfully." });
      setIsOpen(false);
      setHouseholdName("");
      fetchAllHouseholds();
    } catch (error) {
      console.error("Error creating household:", error);
      toast({ title: "Error", description: "Failed to create household. Please try again." });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all">
          <Home className="w-4 h-4" />
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
              onKeyDown={(e) => e.key === "Enter" && !isCreating && handleSubmit()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} className="cursor-pointer">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!householdName.trim() || isCreating}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isCreating ? "Creating..." : "Create Household"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateHouseholdSheet;
