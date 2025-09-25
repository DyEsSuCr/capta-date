import {  Holiday } from '../types';
import { WORKING_TIME_CONFIG } from '../config/working-time';

export class DateUtils {
  private static readonly COLOMBIA_TIMEZONE_OFFSET = -5; // UTC-5

  /**
   * Convierte una fecha UTC a hora de Colombia
   */
  static toColombiaTime(utcDate: Date): Date {
    const offsetMs = this.COLOMBIA_TIMEZONE_OFFSET * 60 * 60 * 1000;
    return new Date(utcDate.getTime() + offsetMs);
  }

  /**
   * Convierte una fecha de Colombia a UTC
   */
  static toUTC(colombiaDate: Date): Date {
    const offsetMs = this.COLOMBIA_TIMEZONE_OFFSET * 60 * 60 * 1000;
    return new Date(colombiaDate.getTime() - offsetMs);
  }

  /**
   * Verifica si una fecha es día laboral (lunes a viernes)
   */
  static isWorkingDay(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return WORKING_TIME_CONFIG.workingDays.includes(dayOfWeek);
  }

  /**
   * Verifica si una fecha es festivo
   */
  static isHoliday(date: Date, holidays: Holiday[]): boolean {
    const dateStr = this.formatDateAsString(date);
    return holidays.some(holiday => holiday.date === dateStr);
  }

  /**
   * Formatea una fecha como string YYYY-MM-DD
   */
  static formatDateAsString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Verifica si una hora está en horario laboral
   */
  static isWorkingHour(date: Date): boolean {
    const hour = date.getHours();
    const minute = date.getMinutes();
    
    // Antes del inicio del trabajo
    if (hour < WORKING_TIME_CONFIG.startHour) return false;
    
    // Después del fin del trabajo
    if (hour >= WORKING_TIME_CONFIG.endHour) return false;
    
    // Durante el almuerzo
    if (hour >= WORKING_TIME_CONFIG.lunchStartHour && 
        hour < WORKING_TIME_CONFIG.lunchEndHour) {
      return false;
    }
    
    return true;
  }

  /**
   * Obtiene las horas de trabajo disponibles en un día desde una hora específica
   */
  static getAvailableHoursInDay(date: Date): number {
    if (!this.isWorkingHour(date)) return 0;
    
    const hour = date.getHours();
    const minute = date.getMinutes();
    let availableHours = 0;

    // Desde la hora actual hasta el almuerzo
    if (hour < WORKING_TIME_CONFIG.lunchStartHour) {
      availableHours += WORKING_TIME_CONFIG.lunchStartHour - hour;
      if (minute > 0) {
        availableHours -= (minute / 60);
      }
    }

    // Desde el almuerzo hasta el final del día
    const startAfternoon = Math.max(hour, WORKING_TIME_CONFIG.lunchEndHour);
    if (startAfternoon < WORKING_TIME_CONFIG.endHour) {
      let afternoonHours = WORKING_TIME_CONFIG.endHour - startAfternoon;
      if (hour >= WORKING_TIME_CONFIG.lunchEndHour && minute > 0) {
        afternoonHours -= (minute / 60);
      }
      availableHours += afternoonHours;
    }

    return Math.max(0, availableHours);
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

    // Ajustar hora si está fuera del horario laboral
    const hour = adjustedDate.getHours();
    const minute = adjustedDate.getMinutes();

    if (hour < WORKING_TIME_CONFIG.startHour) {
      // Antes de las 8:00 AM - ir al día anterior a las 4:59 PM
      adjustedDate.setDate(adjustedDate.getDate() - 1);
      while (!this.isWorkingDay(adjustedDate) || this.isHoliday(adjustedDate, holidays)) {
        adjustedDate.setDate(adjustedDate.getDate() - 1);
      }
      adjustedDate.setHours(WORKING_TIME_CONFIG.endHour - 1, 59, 59, 999);
    } else if (hour >= WORKING_TIME_CONFIG.endHour) {
      // Después de las 5:00 PM - ajustar a las 4:59 PM del mismo día
      adjustedDate.setHours(WORKING_TIME_CONFIG.endHour - 1, 59, 59, 999);
    } else if (hour >= WORKING_TIME_CONFIG.lunchStartHour && 
               hour < WORKING_TIME_CONFIG.lunchEndHour) {
      // Durante el almuerzo - ajustar a las 11:59 AM
      adjustedDate.setHours(WORKING_TIME_CONFIG.lunchStartHour - 1, 59, 59, 999);
    }

    return adjustedDate;
  }

  /**
   * Encuentra el siguiente día laboral (excluyendo festivos)
   */
  static getNextWorkingDay(date: Date, holidays: Holiday[]): Date {
    let nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    while (!this.isWorkingDay(nextDay) || this.isHoliday(nextDay, holidays)) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    
    return nextDay;
  }

  /**
   * Crea una nueva fecha con hora específica
   */
  static setTimeOnDate(date: Date, hour: number, minute: number = 0, second: number = 0, ms: number = 0): Date {
    const newDate = new Date(date);
    newDate.setHours(hour, minute, second, ms);
    return newDate;
  }

  /**
   * Añade días hábiles a una fecha
   */
  static addWorkingDays(startDate: Date, daysToAdd: number, holidays: Holiday[]): Date {
    if (daysToAdd === 0) return new Date(startDate);
    
    let currentDate = new Date(startDate);
    let addedDays = 0;

    while (addedDays < daysToAdd) {
      currentDate = this.getNextWorkingDay(currentDate, holidays);
      addedDays++;
    }

    return currentDate;
  }

  /**
   * Añade horas hábiles a una fecha
   */
  static addWorkingHours(startDate: Date, hoursToAdd: number, holidays: Holiday[]): Date {
    if (hoursToAdd === 0) return new Date(startDate);
    
    let currentDate = new Date(startDate);
    let remainingHours = hoursToAdd;

    while (remainingHours > 0) {
      // Asegurar que estamos en un día laboral
      if (!this.isWorkingDay(currentDate) || this.isHoliday(currentDate, holidays)) {
        currentDate = this.getNextWorkingDay(currentDate, holidays);
        currentDate = this.setTimeOnDate(currentDate, WORKING_TIME_CONFIG.startHour);
        continue;
      }

      // Si no estamos en horario laboral, ajustar
      if (!this.isWorkingHour(currentDate)) {
        const hour = currentDate.getHours();
        
        if (hour < WORKING_TIME_CONFIG.startHour) {
          // Antes del horario, ir al inicio del día
          currentDate = this.setTimeOnDate(currentDate, WORKING_TIME_CONFIG.startHour);
        } else if (hour >= WORKING_TIME_CONFIG.endHour) {
          // Después del horario, ir al siguiente día laboral
          currentDate = this.getNextWorkingDay(currentDate, holidays);
          currentDate = this.setTimeOnDate(currentDate, WORKING_TIME_CONFIG.startHour);
          continue;
        } else if (hour >= WORKING_TIME_CONFIG.lunchStartHour && 
                   hour < WORKING_TIME_CONFIG.lunchEndHour) {
          // Durante almuerzo, ir a las 1:00 PM
          currentDate = this.setTimeOnDate(currentDate, WORKING_TIME_CONFIG.lunchEndHour);
        }
      }

      // Calcular horas disponibles en el día actual
      const availableHours = this.getAvailableHoursInDay(currentDate);
      
      if (remainingHours <= availableHours) {
        // Podemos completar las horas en el día actual
        currentDate = this.addHoursToWorkingDay(currentDate, remainingHours);
        remainingHours = 0;
      } else {
        // Necesitamos múltiples días
        remainingHours -= availableHours;
        currentDate = this.getNextWorkingDay(currentDate, holidays);
        currentDate = this.setTimeOnDate(currentDate, WORKING_TIME_CONFIG.startHour);
      }
    }

    return currentDate;
  }

  /**
   * Añade horas a un día laboral específico, respetando el horario de almuerzo
   */
  private static addHoursToWorkingDay(date: Date, hours: number): Date {
    let currentDate = new Date(date);
    let remainingHours = hours;
    
    while (remainingHours > 0) {
      const hour = currentDate.getHours();
      const minute = currentDate.getMinutes();
      
      if (hour < WORKING_TIME_CONFIG.lunchStartHour) {
        // Estamos en la mañana
        const hoursUntilLunch = WORKING_TIME_CONFIG.lunchStartHour - hour - (minute / 60);
        
        if (remainingHours <= hoursUntilLunch) {
          // Podemos terminar en la mañana
          const minutesToAdd = Math.round(remainingHours * 60);
          currentDate.setMinutes(currentDate.getMinutes() + minutesToAdd);
          remainingHours = 0;
        } else {
          // Llegamos hasta el almuerzo y continuamos en la tarde
          remainingHours -= hoursUntilLunch;
          currentDate = this.setTimeOnDate(currentDate, WORKING_TIME_CONFIG.lunchEndHour);
        }
      } else {
        // Estamos en la tarde
        const minutesToAdd = Math.round(remainingHours * 60);
        currentDate.setMinutes(currentDate.getMinutes() + minutesToAdd);
        remainingHours = 0;
      }
    }
    
    return currentDate;
  }
}