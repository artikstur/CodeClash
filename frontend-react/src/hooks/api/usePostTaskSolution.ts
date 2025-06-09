import {useMutation} from "@tanstack/react-query";
import {API_BASE_URL} from "../../utils/constants.ts";

export const postTaskSolution = async (problemId: number, code: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/problems/Solve/${problemId}`, {
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

export const usePostTaskSolution = () => {
  return useMutation({
    mutationFn: ({ problemId, code }: { problemId: number; code: string }) =>
      postTaskSolution(problemId, code),
  });
};