import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function BuySoonPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Buy Soon</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet
          obcaecati nobis ratione quibusdam explicabo non eligendi, velit
          molestias corporis impedit, quis necessitatibus nemo tenetur sed
          pariatur cupiditate minima harum aut?
        </div>
      </PopoverContent>
    </Popover>
  );
}
