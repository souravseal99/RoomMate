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
};

export const HouseholdContext = createContext<HouseholdContextType | undefined>(
  undefined
);

export default function HouseholdProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [households, setHouseholds] = useState<HouseholdResponse[]>([]);

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

  const providerValues = useMemo(
    () => ({
      households,
      setHouseholds,
      fetchAllHouseholds,
      selectedHousehold,
      setSelectedHousehold,
    }),
    [households, selectedHousehold]
  );

  return (
    <HouseholdContext.Provider value={providerValues as HouseholdContextType}>
      {children}
    </HouseholdContext.Provider>
  );
}
