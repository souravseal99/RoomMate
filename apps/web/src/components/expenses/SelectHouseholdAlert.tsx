import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

function SelectHouseholdAlert() {
  return (
    <div className="mx-4">
      <Alert className="mt-4 w-fit border border-dashed shadow-sm">
        <Info className="h-4 w-4" />
        <AlertTitle className="font-medium">No household selected</AlertTitle>
        <AlertDescription>
          Select a household to view or add the related expenses.
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default SelectHouseholdAlert;
