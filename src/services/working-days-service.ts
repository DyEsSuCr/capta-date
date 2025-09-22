import { DateUtils } from '../utils/date';
import { HolidayService } from './holiday-serivce';

export class WorkingDaysService {
  async calculateWorkingDateTime(
    days: number = 0,
    hours: number = 0,
    startDate?: Date
  ): Promise<Date> {
    // Obtener festivos
    const holidays = await HolidayService.getHolidays();

    // Determinar fecha de inicio
    let currentDate: Date;
    if (startDate) {
      // Convertir de UTC a hora de Colombia
      currentDate = DateUtils.toColombiaTime(startDate);
    } else {
      // Usar hora actual de Colombia
      currentDate = DateUtils.toColombiaTime(new Date());
    }

    // Ajustar al horario laboral más cercano hacia atrás
    currentDate = DateUtils.adjustToWorkingTime(currentDate, holidays);

    // Añadir días hábiles
    if (days > 0) {
      currentDate = DateUtils.addWorkingDays(currentDate, days, holidays);
    }

    // Añadir horas hábiles
    if (hours > 0) {
      currentDate = DateUtils.addWorkingHours(currentDate, hours, holidays);
    }

    // Convertir de vuelta a UTC
    return DateUtils.toUTC(currentDate);
  }
}