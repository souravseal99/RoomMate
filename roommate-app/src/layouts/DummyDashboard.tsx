import Axios from "@/lib/axios";
import { useEffect } from "react";

function DummyDashboard() {
  useEffect(() => {
    const fetchHousehold = async () => {
      const res = await Axios.get("/household/all");

      console.log("Household data: ", res);
    };
    fetchHousehold();
  }, []);

  return (
    <div>
      <h2>Welcome to dashboard</h2>
    </div>
  );
}

export default DummyDashboard;
