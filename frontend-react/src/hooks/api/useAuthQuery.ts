import { useQuery } from "@tanstack/react-query";

const fetchAuthCheck = async () => {
  const response = await fetch("/api/auth/check", {
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
