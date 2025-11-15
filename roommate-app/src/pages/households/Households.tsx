import { useEffect } from "react";
import HouseholdCard from "@/components/households/HouseholdCard";
import CreateHouseholdSheet from "@/components/households/CreateHouseholdForm";
import JoinHouseholdForm from "@/components/households/JoinHouseholdForm";
import useHousehold from "@/hooks/useHousehold";
import { Home } from "lucide-react";
import HouseholdCardSkeleton from "@/components/households/HouseholdCardSkeleton";

function Households() {
  const { households, fetchAllHouseholds, isLoading } = useHousehold();

  useEffect(() => {
    fetchAllHouseholds();
    
    // Auto-refresh every 10 seconds to show updates from other users
    const interval = setInterval(() => {
      fetchAllHouseholds();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const sortedHouseholds = [...households].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      
      <div className="flex-shrink-0 p-6 border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <Home className="w-7 h-7 text-blue-600" />
              <span>Households</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">Manage your shared living spaces</p>
          </div>
          {households.length > 0 && (
            <div className="flex gap-2">
              <JoinHouseholdForm />
              <CreateHouseholdSheet />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6 bg-white">
        <div className="max-w-6xl mx-auto h-full">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <HouseholdCardSkeleton key={index} />
              ))}
            </div>
          ) : households.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedHouseholds.map((household, index) => (
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
                <p className="text-gray-600 mb-6">Create your first household or join an existing one</p>
                <div className="flex gap-2 justify-center">
                  <JoinHouseholdForm />
                  <CreateHouseholdSheet />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Households;