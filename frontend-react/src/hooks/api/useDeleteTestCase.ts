import {API_BASE_URL} from "../../utils/constants.ts";
import {useMutation} from "@tanstack/react-query";

export const deleteTestCase = async ({testId, problemId}: {
  testId: number;
  problemId: number;
}): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/testCases/${testId}/${problemId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    let errorMsg = "Ошибка при удалении тест-кейса";
    try {
      const error = await response.json();
      errorMsg = error.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
};

export const useDeleteTestCase = () => {
  return useMutation({
    mutationFn: ({ testId, problemId }: { testId: number; problemId: number }) =>
      deleteTestCase({ testId, problemId }),
  });
};