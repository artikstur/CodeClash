import {API_BASE_URL} from "../../utils/constants.ts";
import {useQuery} from "@tanstack/react-query";

export const getSolutionStatus = async (solutionId: number): Promise<number> => {
  const res = await fetch(`${API_BASE_URL}/api/testcases/solutionStatus/${solutionId}`, {
    method: 'GET',
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Ошибка при получении статуса решения");
  }

  const data = await res.json();
  return data.status;
};

export const useSolutionPolling = (solutionId: number | null) => {
  const enabled = solutionId !== null;

  const { data, isFetching, isLoading, isError, refetch } = useQuery({
    queryKey: ["solutionStatus", solutionId],
    queryFn: () => getSolutionStatus(solutionId!),
    enabled,
    refetchInterval: (latestData) => {
      if (
        latestData.state.data === 2 ||
        latestData.state.data === 3
      ) {
        return false;
      }
      return 500;
    },
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  return {
    status: data,
    isPending: enabled && (isFetching || isLoading),
    isError,
    isTestSuccess: data === 3,
    isTestFailed: data === 2,
    refetch,
  };
};
