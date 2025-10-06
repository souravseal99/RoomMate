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
    <Select onValueChange={handleValueChange}>
      <SelectTrigger className="w-[15.8rem] mb-4">
        <SelectValue placeholder="Select a Household" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Households</SelectLabel>

          {householdOptions &&
            householdOptions.map((household) => (
              <SelectItem key={household.key} value={household.value}>
                {household.value}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
