import api from './axios';

interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: string;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/login', {
    email,
    password,
  });

  return response.data;
}

export async function register(
  name: string,
  email: string,
  password: string,
  password_confirmation: string,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/register', {
    name,
    email,
    password,
    password_confirmation,
  });

  return response.data;
}

export async function logout(): Promise<void> {
  await api.post('/logout');
}