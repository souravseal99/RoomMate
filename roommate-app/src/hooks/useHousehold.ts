import { useActiveHousehold } from '@/hooks/queries/useHouseholdQueries';

export const useHousehold = () => {
  return useActiveHousehold();
};

export default useHousehold;
