import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { InventoryItem } from "@/types/inventoryTypes";
import { dateFormatterUtc } from "@/utils/utils";

type ItemDetailsCardProps = {
  itemDetails: InventoryItem;
};

export function ItemDetailsCard({ itemDetails }: ItemDetailsCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{itemDetails.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div> Quantity: {itemDetails.quantity} </div>
        <div> Last Updated: {dateFormatterUtc(itemDetails.lastUpdated)}</div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Add
        </Button>
        <Button variant="outline" className="w-full">
          Remove
        </Button>
      </CardFooter>
    </Card>
  );
}
