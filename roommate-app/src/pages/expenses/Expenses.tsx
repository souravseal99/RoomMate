import { useEffect, useMemo, useState } from 'react';
import HouseholdSelector from '@/components/expenses/HouseholdSelector';
import useHousehold from '@/hooks/useHousehold';
import AddExpenseSheet from '@/components/expenses/AddExpenseSheet';
import SelectHouseholdAlert from '@/components/expenses/SelectHouseholdAlert';
import ExpenseViewer from '@/components/expenses/ExpenseViewer';
import BalanceSummary from '@/components/expenses/BalanceSummary';
import expenseApi from '@/api/expenseApi';
import useExpense from '@/hooks/useExpense';
import householdMemberApi from '@/api/householdMemberApi';
import { Receipt } from 'lucide-react';

type MemberOptions = { key: string; value: string }[];

function Expenses() {
  const { selectedHousehold, householdMembers, setHouseholdMembers } = useHousehold();
  const { setExpenses, setIsLoading } = useExpense();

  const HouseholdMemberApi = useMemo(householdMemberApi, []);
  const ExpenseApi = useMemo(expenseApi, []);

  const [householdMemberOptions, setHouseholdMemberOptions] = useState<MemberOptions>([
    { key: '', value: '' },
  ]);

  const [balanceRefreshKey, setBalanceRefreshKey] = useState(0);

  const getExpenses = async () => {
    if (!selectedHousehold?.key) {
      setExpenses([]);
      return;
    }
    setIsLoading(true);
    try {
      const expensesByHousehold = await ExpenseApi.fetchByHouseholdId(selectedHousehold?.key);
      setExpenses(expensesByHousehold || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpensesChange = () => {
    getExpenses();
    setBalanceRefreshKey((k) => k + 1);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const deletedExpense = await ExpenseApi.deleteByExpenseId(expenseId);
      if (deletedExpense) {
        setExpenses((prevExpenses) =>
          prevExpenses?.filter((expense) => expense.expenseId !== expenseId)
        );
        setBalanceRefreshKey((k) => k + 1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getHouseholdMembers = async (householdId: string) => {
    if (!householdId) return;
    const householdMemberRecords = await HouseholdMemberApi.getAllHouseholdMembers(householdId);

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
    if (selectedHousehold?.key) {
      getHouseholdMembers(selectedHousehold.key);
    }
  }, [selectedHousehold?.key]);

  return (
    <section className="container mx-auto px-4 py-6 max-w-5xl flex flex-col items-center gap-6 bg-background text-foreground font-sans">
      {/* Page Header */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary-container">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Expenses Ledger</h1>
            <p className="text-xs text-muted-foreground">Track shared bills and settle up debt balances</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <HouseholdSelector />
          <AddExpenseSheet
            householdMemberOptions={householdMemberOptions}
            selectedHousehold={selectedHousehold}
            getExpenses={handleExpensesChange}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        {!selectedHousehold?.value ? (
          <SelectHouseholdAlert />
        ) : (
          <div className="space-y-6">
            <BalanceSummary householdId={selectedHousehold?.key} refreshKey={balanceRefreshKey} />
            <ExpenseViewer handleDeleteExpense={handleDeleteExpense} />
          </div>
        )}
      </div>
    </section>
  );
}

export default Expenses;
