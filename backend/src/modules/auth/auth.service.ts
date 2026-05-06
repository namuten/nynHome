import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { RegisterDto } from './auth.types';

export async function register(dto: RegisterDto) {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) throw new Error('EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(dto.password, 12);
  return prisma.user.create({
    data: { email: dto.email, passwordHash, nickname: dto.nickname },
    select: { id: true, email: true, nickname: true, role: true, createdAt: true },
  });
}
