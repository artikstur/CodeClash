import {API_BASE_URL} from "../../utils/constants.ts";
import {useQuery} from "@tanstack/react-query";
import type {SolutionStatusResponse} from "../../interfaces/api/responses/SolutionResult.ts";

export const getTaskSolutionStatus = async (solutionId: number): Promise<SolutionStatusResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/problems/solutionStatus/${solutionId}`, {
    method: 'GET',
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Ошибка при получении статуса решения");
  }

  return await res.json();
};

export const useTaskSolutionPolling = (solutionId: number | null) => {
  const enabled = solutionId !== null;

  const { data, isFetching, isLoading, isError, refetch } = useQuery({
    queryKey: ["solutionTaskStatus", solutionId],
    queryFn: () => getTaskSolutionStatus(solutionId!),
    enabled,
    refetchInterval: (latestData) => {
      if (
        latestData.state.data?.status === 2 ||
        latestData.state.data?.status === 3
      ) {
        return false;
      }
      return 1000;
    },
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  return {
    results: data?.data,
    status: data,
    isPending: data === 1,
    isError,
    isTestSuccess: data === 3,
    isTestFailed: data === 2,
    refetch,
  };
};
