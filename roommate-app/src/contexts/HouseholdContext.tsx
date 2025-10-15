import { createContext, useEffect, useMemo, useState } from "react";
import type {
  HouseholdOptions,
  HouseholdResponse,
} from "@/types/hosueholdTypes";
import householdApi from "@/api/householdApi";

type HouseholdContextType = {
  households: HouseholdResponse[];
  setHouseholds: (households: HouseholdResponse[]) => void;
  fetchAllHouseholds: () => void;
  selectedHousehold: HouseholdOptions | null;
  setSelectedHousehold: (selectedOption: HouseholdOptions | null) => void;
  householdMembers: any[]; //TODO - add type to this
  setHouseholdMembers: (members: any[]) => void;
  joinHousehold: (inviteCode: string) => Promise<any>;
};

export const HouseholdContext = createContext<HouseholdContextType | undefined>(
  undefined
);

export default function HouseholdProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [households, setHouseholds] = useState<HouseholdResponse[]>([]);
  const [householdMembers, setHouseholdMembers] = useState<any[]>([]); //TODO - add type to this

  const [selectedHousehold, setSelectedHousehold] =
    useState<HouseholdOptions | null>(null);

  useEffect(() => {}, [selectedHousehold]);

  const HouseholdApi = useMemo(householdApi, []);

  const fetchAllHouseholds = async () => {
    const householdRecords = await HouseholdApi.fetchAll();

    if (householdRecords) setHouseholds(householdRecords);

    if (householdRecords[0]?.householdId && selectedHousehold === null)
      setSelectedHousehold(householdRecords[0]?.householdId);
  };

  const joinHousehold = async (inviteCode: string) => {
    return HouseholdApi.join(inviteCode);
  };

  const providerValues = useMemo(
    () => ({
      households,
      setHouseholds,
      fetchAllHouseholds,
      selectedHousehold,
      setSelectedHousehold,
      householdMembers,
      setHouseholdMembers,
      joinHousehold,
    }),
    [households, selectedHousehold]
  );

  return (
    <HouseholdContext.Provider value={providerValues as HouseholdContextType}>
      {children}
    </HouseholdContext.Provider>
  );
}
