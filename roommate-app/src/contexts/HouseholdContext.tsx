import { createContext, useMemo, useState } from "react";
import type { HouseholdResponse } from "@/types/hosueholdTypes";
import householdApi from "@/api/householdApi";

type HouseholdContextType = {
  households: HouseholdResponse[];
  setHouseholds: (households: HouseholdResponse[]) => void;
  fetchAllHouseholds: () => void;
  selectedHouseholdId: string | null;
  setSelectedHouseholdId: (id: string | null) => void;
};

export const HouseholdContext = createContext<HouseholdContextType | undefined>(
  undefined
);

export default function HouseholdProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [households, setHouseholds] = useState<HouseholdResponse[]>([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>("");
  const HouseholdApi = useMemo(householdApi, []);

  const fetchAllHouseholds = async () => {
    const householdRecords = await HouseholdApi.fetchAll();

    if (householdRecords) setHouseholds(householdRecords);

    if (householdRecords[0]?.householdId && selectedHouseholdId === null)
      setSelectedHouseholdId(householdRecords[0]?.householdId);
  };

  const providerValues = useMemo(
    () => ({
      households,
      setHouseholds,
      fetchAllHouseholds,
      selectedHouseholdId,
      setSelectedHouseholdId,
    }),
    [households, selectedHouseholdId]
  );

  return (
    <HouseholdContext.Provider value={providerValues as HouseholdContextType}>
      {children}
    </HouseholdContext.Provider>
  );
}
