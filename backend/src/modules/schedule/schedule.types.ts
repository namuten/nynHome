export interface CreateScheduleDto {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  color?: string;
}

export interface UpdateScheduleDto {
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  color?: string;
}
