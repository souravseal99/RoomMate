import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type PayerDropdownProps = {
  householdMemberOptions: { key: string; value: string }[];
  onSelectPayer: (payerId: string) => void;
  selectedPayer: string;
};

export function PayerDropdown({
  householdMemberOptions,
  onSelectPayer,
  selectedPayer,
}: PayerDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {selectedPayer
            ? `Payer: ${
                householdMemberOptions.find((m) => m.key === selectedPayer)
                  ?.value ?? selectedPayer
              }`
            : "Select Payer"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Select who paid for it</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup
          value={selectedPayer}
          onValueChange={(value) => onSelectPayer(value)}
        >
          {householdMemberOptions.map((member) => (
            <DropdownMenuRadioItem key={member.key} value={member.key}>
              {member.value}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
