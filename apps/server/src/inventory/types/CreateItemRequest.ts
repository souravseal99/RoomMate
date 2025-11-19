export default interface CreateItemRequest {
  name: string;
  quantity: number;
  lowThreshold: number;
  householdId: string;
}
