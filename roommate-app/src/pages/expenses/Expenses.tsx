import { useEffect, useMemo, useState } from "react";
import HouseholdSelector from "@/components/expenses/HouseholdSelector";
import useHousehold from "@/hooks/useHousehold";
import type { HouseholdOptions } from "@/types/hosueholdTypes";
import AddExpenseSheet from "@/components/expenses/AddExpenseSheet";
import SelectHouseholdAlert from "@/components/expenses/SelectHouseholdAlert";
import ExpenseViewer from "@/components/expenses/ExpenseViewer";
import expenseApi from "@/api/expenseApi";

function Expenses() {
  const { households, fetchAllHouseholds, selectedHousehold, householdMembers } = useHousehold();
  const [expenses, setExpenses] = useState<any[]>([]);

  const ExpenseApi = useMemo(expenseApi, []);

  const getExpenses = async () => {
    const expensesByHousehold = await ExpenseApi.fetchByHouseholdId(
      selectedHousehold?.key
    );

    if (expensesByHousehold && expensesByHousehold.length > 0)
      setExpenses([...expensesByHousehold]);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const deletedExpense = await ExpenseApi.deleteByExpenseId(expenseId);
      if (deletedExpense) {
        getExpenses();
        console.log("Deleted Expense :: ", deletedExpense);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getExpenses();
  }, [selectedHousehold?.key]);

  useEffect(() => {
    fetchAllHouseholds();
  }, []);

  const householdNames: HouseholdOptions[] = useMemo(
    () =>
      households.map((household) => ({
        key: household.householdId,
        value: household.name,
      })),
    [households]
  );

  return (
    <section className="container mx-auto mt-1 flex flex-col items-center lg:w-[80rem]">
      <div className="text-center text-3xl font-stretch-70% mb-6 drop-shadow-lg tracking-wide">
        💸 Expenses
      </div>
      <HouseholdSelector householdOptions={householdNames} />
      <AddExpenseSheet
        selectedHousehold={selectedHousehold}
        getExpenses={getExpenses}
        householdMembers={householdMembers.map(member => ({
          key: member.userId,
          value: member.user?.firstName || member.user?.email || 'Unknown',
          userId: member.userId,
          role: member.role
        }))}
      />
      {/* //NOTE - Have to use conteext here to resolve the expenses retention
      problem */}
      {!selectedHousehold?.value ? (
        <SelectHouseholdAlert />
      ) : (
        <ExpenseViewer
          expenses={expenses}
          handleDeleteExpense={handleDeleteExpense}
        />
      )}
    </section>
  );
}

export default Expenses;
