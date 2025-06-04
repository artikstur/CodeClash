import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '../utils/constants.ts';

const registerUser = async (data: { email: string; password: string; userName: string }) => {
  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Ошибка при регистрации');
  }

  return response.json();
};

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: registerUser,
  });