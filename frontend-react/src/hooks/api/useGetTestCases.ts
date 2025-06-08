import { useQuery } from '@tanstack/react-query';
import type {TestCase} from "../../interfaces/api/core/TestCase.ts";
import {API_BASE_URL} from "../../utils/constants.ts";

export const getTestCases = async (problemId: number): Promise<TestCase[]> => {
  const response = await fetch(`${API_BASE_URL}/api/testcases/${problemId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMsg = 'Ошибка при получении тестов';
    try {
      const error = await response.json();
      errorMsg = error.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return await response.json();
};

export const useGetTestCases = (problemId: number) => {
  return useQuery({
    queryKey: ['testCases', problemId],
    queryFn: () => getTestCases(problemId),
    enabled: !!problemId,
  });
};