import {API_BASE_URL} from "../../utils/constants.ts";
import {useQuery} from "@tanstack/react-query";
import type {ProblemLevel} from "../../interfaces/api/enums/ProblemLevel.ts";
import type {GetProblemResponse} from "../../interfaces/api/responses/GetProblemsResponse.ts";
export const getProblemForBattle = async (problemLevel: ProblemLevel): Promise<GetProblemResponse> => {
  const url = new URL(`${API_BASE_URL}/api/problems/ProblemForBattle`);
  url.searchParams.append('problemLevel', problemLevel.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMsg = 'Ошибка при получении задачи для поединка';
    try {
      const error = await response.json();
      errorMsg = error.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
};

export const useGetProblemForBattle = (problemLevel: ProblemLevel) => {
  return useQuery({
    queryKey: ['battleProblems', problemLevel],
    queryFn: () => getProblemForBattle(problemLevel),
    enabled: !!problemLevel,
  });
};