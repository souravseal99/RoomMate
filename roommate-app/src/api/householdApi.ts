import api from "@/api/axios";

const householdApi = () => {
  const fetchAll = async () => {
    const { data } = await api.get("/household/all");

    return data.household;
  };

  const create = async (createHouseholdData: { name: string }) => {
    const { data, status } = await api.post(
      "/household/create",
      createHouseholdData
    );
    return { data, status };
  };

  const deleteCascated = async (householdId: string) => {
    const { data, status } = await api.post("/household/delete", {
      householdId: householdId,
    });
    return { data, status };
  };

  const update = async (householdId: string, updateData: { name: string }) => {
    const { data, status } = await api.post(`/household/update`, {
      householdId,
      ...updateData
    });
    return { data, status };
  };

  const join = async (inviteCode: string) => {
    const { data, status } = await api.post(`/household/join/${inviteCode}`);
    return { data, status };
  };

  return {
    fetchAll,
    create,
    deleteCascated,
    update,
    join,
  };
};

export default householdApi;

//TODO - enhance household delete feature

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
