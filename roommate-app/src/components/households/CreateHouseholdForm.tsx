import { Button } from "@/components/ui/button";
import { Clipboard, ClipboardCheck, Home, PartyPopper } from "lucide-react";
import { useState } from "react";
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

  const HouseholdApi = householdApi();
  const { fetchAllHouseholds } = useHousehold();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [createdHousehold, setCreatedHousehold] = useState<{ name: string; inviteCode: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!householdName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const { data } = await HouseholdApi.create({ name: householdName });

      if (data?.data?.household) {
        setCreatedHousehold(data.data.household);
      } else {
        toast({ title: "Household created", description: "Your household was created successfully." });
        setIsOpen(false);
        setHouseholdName("");
      }
      fetchAllHouseholds();
    } catch (error) {
      console.error("Error creating household:", error);
      toast({ title: "Error", description: "Failed to create household. Please try again." });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!createdHousehold) return;
    try {
      await navigator.clipboard.writeText(createdHousehold.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Invite code copied to clipboard." });
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCreatedHousehold(null);
    setHouseholdName("");
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
      <DialogContent className="sm:max-w-md">
        {!createdHousehold ? (
          <>
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
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <PartyPopper className="w-6 h-6 text-green-600" />
              </div>
              <DialogTitle className="text-center text-2xl">Household Created!</DialogTitle>
              <DialogDescription className="text-center text-base">
                Your household <strong>{createdHousehold.name}</strong> is ready. Share this code with your roommates to invite them.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-full p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-between">
                <span className="font-mono text-2xl font-bold tracking-wider text-gray-800">
                  {createdHousehold.inviteCode}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  {copied ? (
                    <ClipboardCheck className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clipboard className="w-5 h-5 text-gray-500" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-400">Invite codes are case-sensitive</p>
            </div>
            <DialogFooter className="sm:justify-center">
              <Button
                onClick={handleClose}
                className="w-full sm:w-auto cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CreateHouseholdSheet;
