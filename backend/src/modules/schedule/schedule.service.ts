import { prisma } from '../../lib/prisma';
import { CreateScheduleDto, UpdateScheduleDto } from './schedule.types';

export async function createSchedule(dto: CreateScheduleDto) {
  return prisma.schedule.create({
    data: {
      title: dto.title,
      description: dto.description,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      color: dto.color,
    },
  });
}

export async function listSchedules(month?: string) {
  let where = {};
  if (month) {
    const start = new Date(`${month}-01T00:00:00Z`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
    where = { startAt: { gte: start, lte: end } };
  }

  return prisma.schedule.findMany({
    where,
    orderBy: { startAt: 'asc' },
  });
}

export async function updateSchedule(id: number, dto: UpdateScheduleDto) {
  const schedule = await prisma.schedule.findUnique({ where: { id } });
  if (!schedule) throw new Error('NOT_FOUND');

  return prisma.schedule.update({
    where: { id },
    data: {
      title: dto.title,
      description: dto.description,
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
      endAt: dto.endAt ? new Date(dto.endAt) : undefined,
      color: dto.color,
    },
  });
}

export async function deleteSchedule(id: number) {
  const schedule = await prisma.schedule.findUnique({ where: { id } });
  if (!schedule) throw new Error('NOT_FOUND');
  await prisma.schedule.delete({ where: { id } });
}
