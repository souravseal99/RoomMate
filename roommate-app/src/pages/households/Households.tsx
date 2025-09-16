import api from "@/api/axios";
import { useEffect, useState } from "react";
import { HouseholdCard } from "@/components/Household/HouseholdCard";

function Households() {
  const [households, setHouseholds] = useState([]);
  useEffect(() => {
    const fetchHousehold = async () => {
      const { data } = await api.get("/household/all");
      setHouseholds(data.household);
      console.log("Household data: ", data.household);
    };
    fetchHousehold();
  }, []);
  return (
    <div className=" mx-auto p-6">
      {/* {households && households.length > 0 ? (
        households.map((household) => (
          <HouseholdCard key={household.householdId} household={household} />
        ))
      ) : (
        <p>No households found.</p>
      )} */}
    </div>
  );
}

export default Households;
