import { useEffect, useMemo, useState } from "react";
import HouseholdSelector from "@/components/expenses/HouseholdSelector";
import useHousehold from "@/hooks/useHousehold";
import type { HouseholdOptions } from "@/types/hosueholdTypes";
import AddExpenseSheet from "@/components/expenses/AddExpenseSheet";
import SelectHouseholdAlert from "@/components/expenses/SelectHouseholdAlert";
import ExpenseViewer from "@/components/expenses/ExpenseViewer";
import expenseApi from "@/api/expenseApi";
import useExpense from "@/hooks/useExpense";
import householdMemberApi from "@/api/householdMemberApi";

type MemberOptions = { key: string; value: string }[];

function Expenses() {
  const {
    households,
    fetchAllHouseholds,
    selectedHousehold,
    householdMembers,
    setHouseholdMembers,
  } = useHousehold();

  const { expenses, setExpenses } = useExpense();

  const HouseholdMemberApi = useMemo(householdMemberApi, []);
  const ExpenseApi = useMemo(expenseApi, []);

  const [householdMemberOptions, setHouseholdMemberOptions] =
    useState<MemberOptions>([{ key: "", value: "" }]);

  const getExpenses = async () => {
    if (!selectedHousehold?.key) {
      setExpenses([]);
      return;
    }
    const expensesByHousehold = await ExpenseApi.fetchByHouseholdId(
      selectedHousehold?.key
    );
    setExpenses(expensesByHousehold || []);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const deletedExpense = await ExpenseApi.deleteByExpenseId(expenseId);
      if (deletedExpense) {
        setExpenses((prevExpenses) =>
          prevExpenses.filter((expense) => expense.expenseId !== expenseId)
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getHouseholdMembers = async (householdId: string) => {
    const householdMemberRecords =
      await HouseholdMemberApi.getAllHouseholdMembers(householdId);

    if (householdMemberRecords && householdMemberRecords.length > 0) {
      mapHouseholdMembers(householdMemberRecords);

      setHouseholdMembers([...householdMemberRecords]);
    }
  };

  const mapHouseholdMembers = (householdMembers: any) => {
    const mappedHouseholdMembers = householdMembers.map((member: any) => ({
      value: member.user.name,
      key: member.userId,
    }));

    setHouseholdMemberOptions(mappedHouseholdMembers);
  };

  useEffect(() => {
    getExpenses();
    getHouseholdMembers(selectedHousehold?.key!);
  }, [selectedHousehold?.key]);

  useEffect(() => {
    fetchAllHouseholds();
  }, []);

  useEffect(() => {}, [householdMembers]);

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
        householdMemberOptions={householdMemberOptions}
        selectedHousehold={selectedHousehold}
        getExpenses={getExpenses}
      />
      {/* //NOTE - Have to use conteext here to resolve the expenses retention
      problem */}
      {!selectedHousehold?.value ? (
        <SelectHouseholdAlert />
      ) : (
        <ExpenseViewer handleDeleteExpense={handleDeleteExpense} />
      )}
    </section>
  );
}

export default Expenses;
