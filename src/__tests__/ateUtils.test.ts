import { DateUtils } from '../utils/date';
import { Holiday } from '../types';

describe('DateUtils', () => {
  const mockHolidays: Holiday[] = [
    { date: '2025-01-01', name: 'Año Nuevo' },
    { date: '2025-04-17', name: 'Jueves Santo' },
    { date: '2025-04-18', name: 'Viernes Santo' }
  ];

  describe('isWorkingDay', () => {
    test('should return true for Monday to Friday', () => {
      // Lunes
      expect(DateUtils.isWorkingDay(new Date('2025-01-13'))).toBe(true);
      // Viernes
      expect(DateUtils.isWorkingDay(new Date('2025-01-17'))).toBe(true);
    });

    test('should return false for weekends', () => {
      // Sábado
      expect(DateUtils.isWorkingDay(new Date('2025-01-18'))).toBe(false);
      // Domingo
      expect(DateUtils.isWorkingDay(new Date('2025-01-19'))).toBe(false);
    });
  });

  describe('isWorkingHour', () => {
    test('should return true for working hours', () => {
      // 8:00 AM
      expect(DateUtils.isWorkingHour(new Date('2025-01-13T08:00:00'))).toBe(true);
      // 4:59 PM
      expect(DateUtils.isWorkingHour(new Date('2025-01-13T16:59:00'))).toBe(true);
    });

    test('should return false for non-working hours', () => {
      // 7:59 AM
      expect(DateUtils.isWorkingHour(new Date('2025-01-13T07:59:00'))).toBe(false);
      // 5:00 PM
      expect(DateUtils.isWorkingHour(new Date('2025-01-13T17:00:00'))).toBe(false);
      // Lunch time 12:00 PM
      expect(DateUtils.isWorkingHour(new Date('2025-01-13T12:00:00'))).toBe(false);
    });
  });

  describe('isHoliday', () => {
    test('should return true for holidays', () => {
      const date = new Date('2025-01-01');
      expect(DateUtils.isHoliday(date, mockHolidays)).toBe(true);
    });

    test('should return false for non-holidays', () => {
      const date = new Date('2025-01-02');
      expect(DateUtils.isHoliday(date, mockHolidays)).toBe(false);
    });
  });
});