export interface QueryParams {
  days?: string;
  hours?: string;
  date?: string;
}

export interface ValidationResult {
  days?: number;
  hours?: number;
  startDate?: Date;
}

export interface SuccessResponse {
  date: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface Holiday {
  date: string;
  name: string;
}

export interface WorkingTimeConfig {
  startHour: number;
  endHour: number;
  lunchStartHour: number;
  lunchEndHour: number;
  workingDays: number[];
  hoursPerDay: number;
}