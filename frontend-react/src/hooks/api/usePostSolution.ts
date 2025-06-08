import {useMutation} from "@tanstack/react-query";
import {API_BASE_URL} from "../../utils/constants.ts";

export const postSolution = async (testCaseId: number, code: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/testCases/${testCaseId}/AddNewForOneTask`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    let errorMsg = 'Ошибка при отправке решения';
    try {
      const error = await response.json();
      errorMsg = error.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return data.solutionId;
};

export const usePostSolution = () => {
  return useMutation({
    mutationFn: ({ testCaseId, code }: { testCaseId: number; code: string }) =>
      postSolution(testCaseId, code),
  });
};