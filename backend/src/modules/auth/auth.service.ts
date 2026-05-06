import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { RegisterDto, LoginDto, JwtPayload } from './auth.types';

export async function register(dto: RegisterDto) {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) throw new Error('EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(dto.password, 12);
  return prisma.user.create({
    data: { email: dto.email, passwordHash, nickname: dto.nickname },
    select: { id: true, email: true, nickname: true, role: true, createdAt: true },
  });
}

export async function login(dto: LoginDto) {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) throw new Error('INVALID_CREDENTIALS');

  const valid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!valid) throw new Error('INVALID_CREDENTIALS');

  const payload: JwtPayload = { userId: user.id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });

  return {
    token,
    user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role },
  };
}

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, nickname: true, avatarUrl: true, role: true, createdAt: true },
  });
  if (!user) throw new Error('USER_NOT_FOUND');
  return user;
}
