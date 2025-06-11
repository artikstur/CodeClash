import type GetUserDataResponse from "../../interfaces/api/responses/GetUserDataResponse.ts";
import {API_BASE_URL} from "../../utils/constants.ts";
import {useQuery} from "@tanstack/react-query";

const fetchUserStats = async (): Promise<GetUserDataResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/users/stats`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Ошибка при загрузке данных пользователя');
  }
  return res.json();
};

export const useUserStats = () =>
  useQuery({
    queryKey: ['userStats'],
    queryFn: fetchUserStats,
  });