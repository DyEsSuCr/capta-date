import { type Holiday } from '../types';

export class DateUtils {
  private static readonly COLOMBIA_TIMEZONE = 'America/Bogota';
  private static readonly WORK_START_HOUR = 8;
  private static readonly WORK_END_HOUR = 17;
  private static readonly LUNCH_START_HOUR = 12;
  private static readonly LUNCH_END_HOUR = 13;

  /**
   * Convierte una fecha UTC a hora de Colombia
   */
  static toColombiaTime(utcDate: Date): Date {
    const colombiaOffset = this.getColombiaOffset(utcDate);
    return new Date(utcDate.getTime() + colombiaOffset);
  }

  /**
   * Convierte una fecha de Colombia a UTC
   */
  static toUTC(colombiaDate: Date): Date {
    const utcEquivalent = new Date(colombiaDate.getTime());
    const colombiaOffset = this.getColombiaOffset(utcEquivalent);
    return new Date(utcEquivalent.getTime() - colombiaOffset);
  }

  /**
   * Obtiene el offset de Colombia respecto a UTC en milisegundos
   */
  private static getColombiaOffset(date: Date): number {
    // Colombia está en UTC-5 todo el año (no tiene horario de verano)
    return -5 * 60 * 60 * 1000;
  }

  /**
   * Verifica si una fecha es día laboral (lunes a viernes)
   */
  static isWorkingDay(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5; // 1=Lunes, 5=Viernes
  }

  /**
   * Verifica si una fecha es festivo
   */
  static isHoliday(date: Date, holidays: Holiday[]): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.some(holiday => holiday.date === dateStr);
  }

  /**
   * Verifica si una hora está en horario laboral
   */
  static isWorkingHour(date: Date): boolean {
    const hour = date.getHours();
    const minute = date.getMinutes();
    
    // Antes de las 8:00 AM
    if (hour < this.WORK_START_HOUR) return false;
    
    // Después de las 5:00 PM
    if (hour >= this.WORK_END_HOUR) return false;
    
    // Durante el almuerzo (12:00 PM - 1:00 PM)
    if (hour === this.LUNCH_START_HOUR || 
        (hour === this.LUNCH_END_HOUR && minute === 0)) {
      return false;
    }
    
    return true;
  }

  /**
   * Ajusta una fecha al horario laboral más cercano hacia atrás
   */
  static adjustToWorkingTime(date: Date, holidays: Holiday[]): Date {
    let adjustedDate = new Date(date);

    // Si es fin de semana o festivo, retroceder al último día laboral
    while (!this.isWorkingDay(adjustedDate) || this.isHoliday(adjustedDate, holidays)) {
      adjustedDate.setDate(adjustedDate.getDate() - 1);
    }

    // Si está fuera del horario laboral, ajustar la hora
    if (!this.isWorkingHour(adjustedDate)) {
      const hour = adjustedDate.getHours();
      
      if (hour < this.WORK_START_HOUR) {
        // Si es antes de las 8:00 AM, ir al día laboral anterior a las 5:00 PM
        adjustedDate.setDate(adjustedDate.getDate() - 1);
        while (!this.isWorkingDay(adjustedDate) || this.isHoliday(adjustedDate, holidays)) {
          adjustedDate.setDate(adjustedDate.getDate() - 1);
        }
        adjustedDate.setHours(this.WORK_END_HOUR - 1, 0, 0, 0); // 4:00 PM
      } else if (hour >= this.WORK_END_HOUR) {
        // Si es después de las 5:00 PM, ajustar a las 4:00 PM del mismo día
        adjustedDate.setHours(this.WORK_END_HOUR - 1, 0, 0, 0);
      } else if (hour === this.LUNCH_START_HOUR || hour === this.LUNCH_END_HOUR) {
        // Si está en hora de almuerzo, ajustar a las 11:59 AM
        adjustedDate.setHours(11, 59, 0, 0);
      }
    }

    return adjustedDate;
  }

  /**
   * Añade días hábiles a una fecha
   */
  static addWorkingDays(startDate: Date, daysToAdd: number, holidays: Holiday[]): Date {
    let currentDate = new Date(startDate);
    let addedDays = 0;

    while (addedDays < daysToAdd) {
      currentDate.setDate(currentDate.getDate() + 1);
      
      if (this.isWorkingDay(currentDate) && !this.isHoliday(currentDate, holidays)) {
        addedDays++;
      }
    }

    return currentDate;
  }

  /**
   * Añade horas hábiles a una fecha
   */
  static addWorkingHours(startDate: Date, hoursToAdd: number, holidays: Holiday[]): Date {
    let currentDate = new Date(startDate);
    let remainingHours = hoursToAdd;

    while (remainingHours > 0) {
      // Asegurar que estamos en un día laboral
      while (!this.isWorkingDay(currentDate) || this.isHoliday(currentDate, holidays)) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(this.WORK_START_HOUR, 0, 0, 0);
      }

      // Si no estamos en horario laboral, ajustar
      if (!this.isWorkingHour(currentDate)) {
        if (currentDate.getHours() < this.WORK_START_HOUR) {
          currentDate.setHours(this.WORK_START_HOUR, 0, 0, 0);
        } else if (currentDate.getHours() >= this.WORK_END_HOUR) {
          currentDate.setDate(currentDate.getDate() + 1);
          currentDate.setHours(this.WORK_START_HOUR, 0, 0, 0);
          continue;
        } else if (currentDate.getHours() >= this.LUNCH_START_HOUR && 
                   currentDate.getHours() < this.LUNCH_END_HOUR) {
          currentDate.setHours(this.LUNCH_END_HOUR, 0, 0, 0);
        }
      }

      // Calcular horas disponibles hasta el final del día
      let endOfDay = new Date(currentDate);
      endOfDay.setHours(this.WORK_END_HOUR, 0, 0, 0);

      // Verificar si cruzamos la hora de almuerzo
      let availableHours = 0;
      let tempDate = new Date(currentDate);

      while (tempDate.getTime() < endOfDay.getTime() && availableHours < remainingHours) {
        if (this.isWorkingHour(tempDate)) {
          availableHours += 1;
          tempDate.setHours(tempDate.getHours() + 1);
        } else {
          // Saltar la hora de almuerzo
          if (tempDate.getHours() === this.LUNCH_START_HOUR) {
            tempDate.setHours(this.LUNCH_END_HOUR);
          } else {
            tempDate.setHours(tempDate.getHours() + 1);
          }
        }
      }

      if (remainingHours <= availableHours) {
        // Podemos terminar hoy
        while (remainingHours > 0) {
          if (this.isWorkingHour(currentDate)) {
            currentDate.setHours(currentDate.getHours() + 1);
            remainingHours--;
          } else {
            // Saltar la hora de almuerzo
            if (currentDate.getHours() === this.LUNCH_START_HOUR) {
              currentDate.setHours(this.LUNCH_END_HOUR);
            } else {
              currentDate.setHours(currentDate.getHours() + 1);
            }
          }
        }
      } else {
        // Necesitamos continuar al siguiente día
        remainingHours -= availableHours;
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(this.WORK_START_HOUR, 0, 0, 0);
      }
    }

    return currentDate;
  }
}
