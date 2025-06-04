import {useMutation} from "@tanstack/react-query";
import { API_BASE_URL } from '../../utils/constants.ts';
import type AddProblemRequest from "../../interfaces/api/requests/AddProblemRequest.ts";

export const createProblem = async (data: AddProblemRequest) => {
  const response = await fetch(`${API_BASE_URL}/api/problems`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Ошибка при создании задачи');
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const useCreateProblem = () => {
  return useMutation({
    mutationFn: (data: AddProblemRequest) => createProblem(data),
  });
};