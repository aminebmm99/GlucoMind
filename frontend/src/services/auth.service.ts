import { api } from "./api";

interface LoginResponse {
  token: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  name?: string;
  password: string;
}

interface RegisterResponse {
  id: number;
  email: string;
  name: string | null;
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

export async function register(data: RegisterData): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>("/auth/register", data);
  return response.data;
}