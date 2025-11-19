import { useContext } from "react";
import { HouseholdContext } from "@/contexts/HouseholdContext";

const useHousehold = () => {
  const context = useContext(HouseholdContext);

  if (!context)
    throw new Error(
      "Household context must be present inside HouseholdProvider"
    );

  return context;
};

export default useHousehold;
