import { useQuery } from "@tanstack/react-query";
import {API_BASE_URL} from "../../utils/constants.ts";

const fetchAuthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/api/users/check`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Not authorized");
  }

  return response.json();
};

export const useAuthQuery = () =>
  useQuery({
    queryKey: ["auth"],
    queryFn: fetchAuthCheck,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
