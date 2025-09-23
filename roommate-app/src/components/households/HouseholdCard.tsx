import { useMemo, useState } from "react";
import { Clipboard, ClipboardCheck, Edit3, Trash2Icon } from "lucide-react";
import type { HouseholdResponse } from "@/types/hosueholdTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import householdApi from "@/api/householdApi";
import useHousehold from "@/hooks/useHousehold";

type Props = {
  household: HouseholdResponse;
};

function HouseholdCard({ household }: Props) {
  const [copied, setCopied] = useState(false);

  const { fetchAllHouseholds } = useHousehold();

  const HouseholdApi = useMemo(householdApi, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(household.inviteCode);
      setCopied(true);

      // Reset after 2s
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleDelete = async () => {
    await HouseholdApi.deleteCascated(household.householdId);
    await fetchAllHouseholds();
    //TODO: implement a confirmation dialog before deleting, cuz we are hard deleting the household along with expenses, chores, inventoryItems etc.
    // Optionally, show counts of deleted items: dummy response in householdApi.ts
  };

  const InviteCodeButton = () => (
    <Button
      onClick={handleCopy}
      className={`w-full ${copied ? "border-green-600 text-green-700" : ""}`}
      variant="outline"
      size="sm"
    >
      {copied ? <ClipboardCheck className="text-green-700" /> : <Clipboard />}
      Invite Code
    </Button>
  );

  return (
    <Card className="w-full pt-2 md:w-[18rem]">
      <CardHeader>
        <CardTitle className="px-2 pb-1 shadow-2xs items-center inline-flex justify-between">
          <span className="font-medium text-lg truncate">{household.name}</span>

          <Button
            variant="ghost"
            size="icon"
            className="text-red-600 hover:bg-red-100"
            onClick={handleDelete}
          >
            <Trash2Icon />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-1 gap-3">
        <Button className="w-full" variant="outline" size="sm">
          <Edit3 />
          Edit(TBD)
        </Button>
        <InviteCodeButton />
      </CardContent>
    </Card>
  );
}

export default HouseholdCard;
