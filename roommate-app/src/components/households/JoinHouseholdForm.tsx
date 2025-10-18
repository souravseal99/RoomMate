import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

function JoinHouseholdForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const HouseholdApi = useMemo(householdApi, []);
  const { fetchAllHouseholds } = useHousehold();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!inviteCode.trim()) return;
    setIsLoading(true);
    try {
      await HouseholdApi.join(inviteCode.trim());
      toast({
        title: "Success!",
        description: "You've successfully joined the household.",
      });
      setIsOpen(false);
      setInviteCode("");
      fetchAllHouseholds();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to join household. Please check the invite code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer shadow-lg hover:shadow-xl transition-all">
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Join Household</span>
          <span className="sm:hidden">Join</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Household</DialogTitle>
          <DialogDescription>
            Enter the invite code to join an existing household
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="inviteCode">Invite Code</Label>
            <Input
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="e.g., Z-SSxEbQ"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} className="cursor-pointer">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!inviteCode.trim() || isLoading} 
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Joining..." : "Join Household"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default JoinHouseholdForm;
