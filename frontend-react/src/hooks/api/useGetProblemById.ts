import {API_BASE_URL} from "../../utils/constants.ts";
import type {GetProblemResponse} from "../../interfaces/api/responses/GetProblemsResponse.ts";
import {useQuery} from "@tanstack/react-query";

export const getProblemById = async (problemId: number): Promise<GetProblemResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/problems/${problemId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось получить данные задачи");
  }

  return await response.json();
};

export const useGetProblemById = (problemId: number) => {
  return useQuery({
    queryKey: ["problemId", problemId],
    queryFn: () => getProblemById(problemId),
    enabled: !!problemId,
  });
};