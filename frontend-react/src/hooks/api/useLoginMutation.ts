import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '../../utils/constants.ts';

const loginUser = async (data: { email: string; password: string }) => {
  const response = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Ошибка при авторизации');
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const useLoginMutation = () =>
  useMutation({
    mutationFn: loginUser,
  });