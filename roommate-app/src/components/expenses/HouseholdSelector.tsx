import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function HouseholdSelector() {
  const households = [
    { id: 1, name: "Household A" },
    { id: 2, name: "Household B" },
    { id: 3, name: "Household C" },
  ];
  return (
    <Select>
      <SelectTrigger className="w-[15.8rem] mb-4">
        <SelectValue placeholder="Select a Household" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Households</SelectLabel>

          {households &&
            households.map((household) => (
              <SelectItem key={household.id} value={household.name}>
                {household.name}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
