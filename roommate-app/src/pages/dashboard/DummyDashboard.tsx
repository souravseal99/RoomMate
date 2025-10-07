import { Home, DollarSign, CheckSquare, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function DummyDashboard() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Households",
      description: "Create and manage your shared living spaces",
      icon: Home,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      stats: { label: "Active Households", value: "2" },
      action: () => navigate("/households"),
    },
    {
      title: "Chores",
      description: "Assign and track household tasks",
      icon: CheckSquare,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      stats: { label: "Pending Tasks", value: "5" },
      action: () => navigate("/chores"),
    },
    {
      title: "Expenses",
      description: "Split bills and track shared expenses",
      icon: DollarSign,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      stats: { label: "This Month", value: "$1,234" },
      action: () => navigate("/expenses"),
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      
      <div className="flex-shrink-0 p-6 border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Welcome back! Here's your overview</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group bg-white/90 backdrop-blur-sm border border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 hover:scale-105 cursor-pointer overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700"
                  onClick={feature.action}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`h-2 bg-gradient-to-r ${feature.gradient}`}></div>
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.bgGradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <Icon className="w-8 h-8 text-gray-700" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{feature.description}</p>
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${feature.bgGradient} mb-4 shadow-inner`}>
                      <p className="text-xs text-gray-600 mb-1 font-medium">{feature.stats.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{feature.stats.value}</p>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-between group-hover:bg-gray-100 cursor-pointer"
                    >
                      <span className="font-medium">View Details</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DummyDashboard;
