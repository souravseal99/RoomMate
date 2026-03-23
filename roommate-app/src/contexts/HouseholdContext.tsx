import { createContext, useEffect, useMemo, useState } from "react";
import type {
  HouseholdOptions,
  HouseholdResponse,
} from "@/types/householdTypes";
import householdApi from "@/api/householdApi";

type HouseholdContextType = {
  households: HouseholdResponse[];
  setHouseholds: (households: HouseholdResponse[]) => void;
  fetchAllHouseholds: () => void;
  selectedHousehold: HouseholdOptions | null;
  setSelectedHousehold: (selectedOption: HouseholdOptions | null) => void;
  householdMembers: any[]; //TODO - add type to this
  setHouseholdMembers: (members: any[]) => void;
  isLoading?: boolean;
};

export const HouseholdContext = createContext<HouseholdContextType | undefined>(
  undefined
);

export default function HouseholdProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [households, setHouseholds] = useState<HouseholdResponse[]>([]);
  const [householdMembers, setHouseholdMembers] = useState<any[]>([]); //TODO - add type to this
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedHousehold, setSelectedHousehold] =
    useState<HouseholdOptions | null>(null);

  useEffect(() => { }, [selectedHousehold]);

  const HouseholdApi = useMemo(householdApi, []);

  const fetchAllHouseholds = async () => {
    try {
      const householdRecords = await HouseholdApi.fetchAll();

      if (householdRecords) setHouseholds(householdRecords);

      if (householdRecords[0]?.householdId && selectedHousehold === null)
        setSelectedHousehold(householdRecords[0]?.householdId);
    } catch (error) {
      console.error("Error fetching households:", error);
    } finally {
      if (isLoading) {
        setIsLoading(false);
      }
    }
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
      isLoading
    }),
    [households, selectedHousehold, isLoading, householdMembers]
  );

  return (
    <HouseholdContext.Provider value={providerValues as HouseholdContextType}>
      {children}
    </HouseholdContext.Provider>
  );
}
