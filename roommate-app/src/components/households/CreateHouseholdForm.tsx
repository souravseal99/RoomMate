import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components//ui/button";
import { ChevronsUpDown, HousePlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components//ui/input";
import householdApi from "@/api/householdApi";
import useHousehold from "@/hooks/useHousehold";

function CreateHouseholdSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [householdName, setHouseholdName] = useState("");

  const HouseholdApi = useMemo(householdApi, []);

  const { fetchAllHouseholds } = useHousehold();

  const handleCreateHousehold = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHouseholdName(e.target.value);
  };

  const handleSubmit = async () => {
    if (!householdName.trim()) return;
    try {
      await HouseholdApi.create({ name: householdName });
      setIsOpen(false);
      setHouseholdName("");
      fetchAllHouseholds();
      // Optionally, show success message or refresh households list
    } catch (error) {
      // Optionally, handle error (e.g., show error message)
      console.error(error);
    }
  };

  return (
    <>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="flex w-full md:w-auto md:min-w-[16rem] flex-col gap-2"
      >
        <div className="flex items-center justify-center gap-4 px-4">
          <CollapsibleTrigger asChild>
            <Button
              className={`cursor-pointer text-[9px] md:text-s w-full whitespace-nowrap ${isOpen ? "bg-green-600 text-white" : ""}`}
              variant="outline"
              size="sm"
              onClick={handleCreateHousehold}
            >
              <HousePlusIcon className="w-3 h-3" /> 
              <span className="hidden md:inline">Create New Household (TBD)</span>
              <span className="md:hidden">New Household</span>
              <ChevronsUpDown className="w-3 h-3" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="flex flex-col justify-center gap-2 transition-all duration-600 ease-in-out px-4">
          <Input
            onChange={handleInputChange}
            className="rounded-md border-0 border-b-emerald-950-1 text-center px-3 text-xs"
            placeholder="Enter Household Name"
          />
          <div className="grid grid-cols-2 pt-2 pl-2 pr-2">
            <Button
              onClick={handleSubmit}
              className="bg-green-600 text-white cursor-pointer text-[8px] md:text-[10px]"
              size="sm"
            >
              Create Household
            </Button>
            <Button
              className="ml-2 bg-red-600 text-white cursor-pointer text-[10px] md:text-[10px]"
              size="sm"
              onClick={handleCreateHousehold}
            >
              Cancel
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}

export default CreateHouseholdSheet;
