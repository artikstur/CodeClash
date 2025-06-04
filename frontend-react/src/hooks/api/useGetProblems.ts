import { API_BASE_URL } from "../../utils/constants.ts";
import type ProblemsSpec from "../../interfaces/api/requests/ProblemsSpec.ts";
import type {GetProblemResponse} from "../../interfaces/api/responses/GetProblemsResponse.ts";
import {useQuery} from "@tanstack/react-query";
const toQueryString = (params: Record<string, any>) => {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== '' && !isNaN(value))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return query ? `?${query}` : '';
};

export const getProblems = async (spec: ProblemsSpec): Promise<GetProblemResponse[]> => {
  console.log(spec)
  const queryString = toQueryString(spec)
  console.log(queryString)

  const response = await fetch(`${API_BASE_URL}/api/problems${queryString}`, {
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

export const useGetProblems = (spec: ProblemsSpec) => {
  return useQuery<GetProblemResponse[], Error>({
    queryKey: ["problems", spec],
    queryFn: () => getProblems(spec)
  });
};