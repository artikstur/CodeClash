import type ProblemsSpec from "../../interfaces/api/requests/ProblemsSpec.ts";
import type {GetProblemResponse} from "../../interfaces/api/responses/GetProblemsResponse.ts";
import {useQuery} from "@tanstack/react-query";
import {toQueryString} from "./apiUtils.ts";
import {API_BASE_URL} from "../../utils/constants.ts";

export const getUserProblems = async (spec: ProblemsSpec): Promise<GetProblemResponse[]> => {
  console.log(spec)
  const queryString = toQueryString(spec)
  console.log(queryString)

  const response = await fetch(`${API_BASE_URL}/api/problems/user${queryString}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMsg = 'Ошибка при получении задач';
    try {
      const error = await response.json();
      errorMsg = error.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : [];
};

export const useGetUserProblems = (spec: ProblemsSpec, enabled = true) => {
  return useQuery({
    queryKey: ['problems', spec],
    queryFn: () => getUserProblems(spec),
    enabled,
  });
};
