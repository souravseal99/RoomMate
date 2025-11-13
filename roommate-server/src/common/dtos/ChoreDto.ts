import { HouseholdDto } from "@src/common/dtos/HouseholdDto";
import UserDto from "@src/common/dtos/UserDto";

export default interface ChoreDto {
  householdId: string;
  assignedToId?: string;
  description: string;
  frequency: string;
  nextDue?: Date;
  completed?: boolean;
  priority?: string;
  notes?: string;
  household?: HouseholdDto;
  assignedTo?: UserDto;
}
