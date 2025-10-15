import { useEffect, useState } from "react";
import HouseholdCard from "@/components/households/HouseholdCard";
import CreateHouseholdSheet from "@/components/households/CreateHouseholdForm";
import JoinHouseholdDialog from "@/components/households/JoinHouseholdDialog";
import useHousehold from "@/hooks/useHousehold";
import { Home, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

function Households() {
  const { households, fetchAllHouseholds } = useHousehold();
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  useEffect(() => {
    fetchAllHouseholds();
  }, []);

  const sortedHouseholds = [...households].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <JoinHouseholdDialog
        open={joinDialogOpen}
        onClose={() => setJoinDialogOpen(false)}
      />
      <div className="flex-shrink-0 p-4 sm:p-6 border-b bg-white/80 backdrop-blur-sm">
        <div className="w-full px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <Home className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" />
              <span>Households</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Manage your shared living spaces
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => setJoinDialogOpen(true)}
              variant={"outline"}
              className="cursor-pointer shadow-lg hover:shadow-xl transition-all w-28 sm:w-auto"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Join Household</span>
              <span className="sm:hidden">Join</span>
            </Button>
            {households.length > 0 && <CreateHouseholdSheet />}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-white">
        <div className="w-full">
          {households.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
              {sortedHouseholds.map((household, index) => (
                <div
                  key={household.householdId}
                  className="animate-in fade-in slide-in-from-bottom-5 duration-700"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <HouseholdCard household={household} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center animate-in fade-in zoom-in duration-700">
                <div
                  className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
                  style={{
                    boxShadow: "0 20px 60px -15px rgba(59, 130, 246, 0.5)",
                  }}
                >
                  <Home className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No households yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first household to get started
                </p>
                <CreateHouseholdSheet />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Households;

