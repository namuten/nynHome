export interface RegisterDto {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: number;
  role: 'admin' | 'user';
}
