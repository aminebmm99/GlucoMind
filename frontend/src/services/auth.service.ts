import { api } from "./api";

interface LoginResponse {
  token: string;
}

interface LoginData {
  email: string;
  password: string;
}

export async function login(
  data: LoginData,
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    data,
  );

  return response.data;
}