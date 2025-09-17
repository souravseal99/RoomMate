import api from "@/api/axios";

export async function createHousehold(createHouseholdData: { name: string }) {
  const { data, status } = await api.post(
    "/household/create",
    createHouseholdData
  );
  return { data, status };
}

export async function deleteHousehold(householdId: string) {
  const { data, status } = await api.post("/household/delete", {
    householdId: householdId,
  });
  return { data, status };

  // dummy response
  // Ref: household.controller.ts

  //   {
  //     "message": "Household deleted successfully",
  //     "data": {
  //         "household": [
  //             {
  //                 "count": 1 // householdMembers deleted
  //             },
  //             {
  //                 "count": 0 // expense splits deleted
  //             },
  //             {
  //                 "count": 0 // expenses deleted
  //             },
  //             {
  //                 "count": 0 // chores deleted
  //             },
  //             {
  //                 "count": 0 // inventoryItems deleted
  //             },
  //             {
  //                 "householdId": "df23efae-62c0-4016-8e20-6d92f55daec2",
  //                 "name": "household 4",
  //                 "inviteCode": "HGnIiO9q",
  //                 "createdAt": "2025-09-17T08:45:27.237Z"
  //             }
  //         ]
  //     }
  // }
}
