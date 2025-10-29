import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useHousehold from "@/hooks/useHousehold";
import type { HouseholdOptions } from "@/types/hosueholdTypes";
import { useEffect } from "react";
import { Home, Users } from "lucide-react";
import { cn } from "@/utils/utils";

// Style constants
const TRIGGER_CONTAINER_STYLES = [
  "w-full h-12 px-4 py-3 bg-white dark:bg-gray-800",
  "border-2 border-gray-200 dark:border-gray-700",
  "hover:border-blue-300 dark:hover:border-blue-600",
  "focus:border-blue-500 dark:focus:border-blue-400",
  "focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20",
  "rounded-xl shadow-sm transition-all duration-200",
  "text-gray-900 dark:text-gray-100",
  "data-[placeholder]:text-gray-500 dark:data-[placeholder]:text-gray-400"
];

const SELECT_CONTENT_STYLES = "w-full min-w-[var(--radix-select-trigger-width)] rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg";

const SELECT_ITEM_STYLES = [
  "px-3 py-3 mx-1 rounded-lg cursor-pointer transition-all duration-150",
  "hover:bg-blue-50 dark:hover:bg-blue-900/20",
  "focus:bg-blue-50 dark:focus:bg-blue-900/20",
  "data-[state=checked]:bg-blue-100 dark:data-[state=checked]:bg-blue-900/30",
  "data-[state=checked]:text-blue-900 dark:data-[state=checked]:text-blue-100"
];

const SELECTED_HOUSEHOLD_CARD_STYLES = "mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800";

type Props = {
  householdOptions: HouseholdOptions[];
};

export default function HouseholdSelector(props: Props) {
  const { householdOptions } = props;
  const { selectedHousehold, setSelectedHousehold } = useHousehold();

  useEffect(() => {
    if (householdOptions.length > 0 && !selectedHousehold) {
      setSelectedHousehold(householdOptions[0]);
    }
  }, [householdOptions]);

  const handleValueChange = (value: string) => {
    const selectedHousehold = householdOptions.find((h) => h.value === value);

    if (selectedHousehold) {
      setSelectedHousehold({
        key: selectedHousehold.key,
        value: selectedHousehold.value,
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      {/* Header with icon and title */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Select Household
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Choose which household to manage expenses for
          </p>
        </div>
      </div>

      {/* Enhanced Select Component */}
      <Select onValueChange={handleValueChange} value={selectedHousehold?.value}>
        <SelectTrigger className={cn(...TRIGGER_CONTAINER_STYLES)}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-md">
              <Users className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
            </div>
            <SelectValue 
              placeholder="Choose a household..." 
              className="text-sm font-medium"
            />
          </div>
        </SelectTrigger>
        
        <SelectContent className={SELECT_CONTENT_STYLES}>
          <SelectGroup>
            <SelectLabel className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Available Households
            </SelectLabel>
            
            {householdOptions && householdOptions.length > 0 ? (
              householdOptions.map((household, index) => (
                <SelectItem 
                  key={household.key} 
                  value={household.value}
                  className={cn(
                    ...SELECT_ITEM_STYLES,
                    index === 0 && "mt-1",
                    index === householdOptions.length - 1 && "mb-1"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <Home className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {household.value}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Household ID: {household.key.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="px-3 py-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <Home className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No households available
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    Create a household to get started
                  </div>
                </div>
              </div>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Selected household info */}
      {selectedHousehold && (
        <div className={SELECTED_HOUSEHOLD_CARD_STYLES}>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-800 rounded">
              <Users className="w-3 h-3 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Active: {selectedHousehold.value}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                Managing expenses for this household
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
