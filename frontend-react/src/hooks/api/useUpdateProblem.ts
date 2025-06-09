import type UpdateProblemRequest from "../../interfaces/api/requests/UpdateProblemRequest.ts";
import {API_BASE_URL} from "../../utils/constants.ts";
import {useMutation} from "@tanstack/react-query";

export const updateProblem = async (
  problemId: number,
  update: UpdateProblemRequest
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/problems/${problemId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(update),
  });

  if (!response.ok) {
    let errorMsg = 'Ошибка при обновлении задачи';
    try {
      const error = await response.json();
      errorMsg = error.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
};

export const useUpdateProblem = () => {
  return useMutation({
    mutationFn: ({ problemId, update }: { problemId: number; update: UpdateProblemRequest }) =>
      updateProblem(problemId, update),
  });
};
