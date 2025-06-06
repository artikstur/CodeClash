import { API_BASE_URL } from "../../utils/constants.ts";
import type ProblemsSpec from "../../interfaces/api/requests/ProblemsSpec.ts";
import {useQuery} from "@tanstack/react-query";
import {toQueryString} from "./apiUtils.ts";
import type {GetProblemsResult} from "../../interfaces/api/responses/GetProblemsResult.ts";

export const getProblems = async (spec: ProblemsSpec): Promise<GetProblemsResult> => {
  const queryString = toQueryString(spec);

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
  return text ? JSON.parse(text) : { items: [], count: 0 };
};

export const useGetProblems = (spec: ProblemsSpec, enabled = true) => {
  return useQuery({
    queryKey: ['problems', spec],
    queryFn: () => getProblems(spec),
    enabled,
  });
};