import { useEffect } from "react";
import HouseholdCard from "@/components/households/HouseholdCard";
import CreateHouseholdSheet from "@/components/households/CreateHouseholdForm";
import useHousehold from "@/hooks/useHousehold";
import { Home } from "lucide-react";

function Households() {
  const { households, fetchAllHouseholds } = useHousehold();

  useEffect(() => {
    fetchAllHouseholds();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      
      <div className="flex-shrink-0 p-6 border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <Home className="w-7 h-7 text-blue-600" />
              Households
            </h1>
            <p className="text-sm text-gray-600 mt-1">Manage your shared living spaces</p>
          </div>
          <CreateHouseholdSheet />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {households.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {households.map((household, index) => (
                <div key={household.householdId} className="animate-in fade-in slide-in-from-bottom-5 duration-700" style={{animationDelay: `${index * 150}ms`}}>
                  <HouseholdCard household={household} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-2xl" style={{boxShadow: '0 20px 60px -15px rgba(59, 130, 246, 0.5)'}}>
                  <Home className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No households yet</h3>
                <p className="text-gray-600 mb-6">Create your first household to get started</p>
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
