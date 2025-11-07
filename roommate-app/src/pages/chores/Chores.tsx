import { ChoreItemCard } from "@/components/chores/ChoreItemCard";
import HouseholdSelector from "@/components/expenses/HouseholdSelector";
import ChoresDummyData from "./ChoresDummyData";
import type { ChoreItem } from "@/types/choreTypes";

function Chores() {
  return (
    <div className="container mx-auto flex flex-col items-center w-[90vw] mt-4">
      <div className="text-center text-3xl font-stretch-70% mb-6 drop-shadow-lg tracking-wide">
        🧹 Chores
      </div>
      <div>
        <HouseholdSelector />
      </div>
      <div className="w-full flex flex-col items-center gap-4">
        {/* Example ChoreItem components */}

        {ChoresDummyData.map((chore) => (
          <div key={chore.choreId} className="w-full flex justify-center">
            <div className="w-full max-w-lg">
              <ChoreItemCard chore={chore as ChoreItem} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Chores;
