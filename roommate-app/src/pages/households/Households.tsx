import { useEffect } from "react";
import HouseholdCard from "@/components/households/HouseholdCard";
import CreateHouseholdSheet from "@/components/households/CreateHouseholdForm";
import useHousehold from "@/hooks/useHousehold";

function Households() {
  const { households, fetchAllHouseholds } = useHousehold();

  useEffect(() => {
    fetchAllHouseholds();
  }, []);

  return (
    <section className="container mx-auto mt-1 flex flex-col items-center lg:w-[80rem]">
      <div className="text-center text-3xl font-stretch-70% mb-6 drop-shadow-lg tracking-wide">
        🏠 Households
      </div>

      <div>
        <CreateHouseholdSheet />
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        {households.length ? (
          households.map((household) => (
            <HouseholdCard key={household.householdId} household={household} />
          ))
        ) : (
          <div className="text-xl font-stretch-75% text-center col-span-full">
            No households found. Create one!
          </div>
        )}
      </div>
    </section>
  );
}

export default Households;
