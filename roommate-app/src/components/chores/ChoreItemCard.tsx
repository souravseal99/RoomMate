import { ShieldAlertIcon, ClockAlertIcon, ArmchairIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import type { ChoreItem } from "@/types/choreTypes";
import { getDateDifferenceInDays } from "@/utils/utils";

type ChoreItemCardProps = {
  chore: ChoreItem;
};

export function ChoreItemCard({ chore }: ChoreItemCardProps) {
  const differenceInDays = getDateDifferenceInDays(chore.nextDue);

  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <Item variant="outline">
        <ItemMedia variant="icon">
          {differenceInDays <= 1 ? (
            <ShieldAlertIcon className="text-red-500" />
          ) : differenceInDays <= 3 ? (
            <ClockAlertIcon className="text-yellow-500" />
          ) : (
            <ArmchairIcon className="text-green-500" />
          )}
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{chore.description}</ItemTitle>
          <ItemDescription>
            Next Due: {new Date(chore.nextDue).toLocaleDateString()} |
            Frequency: {chore.frequency} | Status:{" "}
            {chore.completed ? "Completed" : "Pending"}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Mark as Done
          </Button>
        </ItemActions>
      </Item>
    </div>
  );
}
