import { QueryParams, ValidationResult } from '../types';

export class Validator {
  static validateParams(query: QueryParams): ValidationResult {
    const { days, hours, date } = query;

    // Validar que al menos uno de los parámetros esté presente
    if (!days && !hours) {
      throw new Error('Al menos uno de los parámetros "days" o "hours" debe ser proporcionado');
    }

    const result: ValidationResult = {};

    // Validar días
    if (days !== undefined) {
      const daysNum = parseInt(days, 10);
      if (isNaN(daysNum) || daysNum < 0) {
        throw new Error('El parámetro "days" debe ser un entero positivo');
      }
      result.days = daysNum;
    }

    // Validar horas
    if (hours !== undefined) {
      const hoursNum = parseInt(hours, 10);
      if (isNaN(hoursNum) || hoursNum < 0) {
        throw new Error('El parámetro "hours" debe ser un entero positivo');
      }
      result.hours = hoursNum;
    }

    // Validar fecha
    if (date !== undefined) {
      if (!date.endsWith('Z')) {
        throw new Error('El parámetro "date" debe estar en formato UTC con sufijo Z');
      }
      
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('El parámetro "date" debe ser una fecha válida en formato ISO 8601');
      }
      
      result.startDate = parsedDate;
    }

    return result;
  }
}