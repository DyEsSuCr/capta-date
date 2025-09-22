import { WorkingDaysService } from '../services/working-days-service';

jest.mock('../services/holidayService', () => ({
  HolidayService: {
    getHolidays: jest.fn().mockResolvedValue([
      { date: '2025-01-01', name: 'Año Nuevo' },
      { date: '2025-04-17', name: 'Jueves Santo' },
      { date: '2025-04-18', name: 'Viernes Santo' }
    ])
  }
}));

describe('WorkingDaysService', () => {
  let service: WorkingDaysService;

  beforeEach(() => {
    service = new WorkingDaysService();
  });

  test('should add working days correctly', async () => {
    // Lunes 8:00 AM + 1 día = Martes 8:00 AM
    const startDate = new Date('2025-01-13T13:00:00.000Z'); // 8:00 AM Colombia
    const result = await service.calculateWorkingDateTime(1, 0, startDate);
    
    // Debería ser martes a las 8:00 AM Colombia = 13:00 UTC
    expect(result.getUTCHours()).toBe(13);
    expect(result.getUTCDate()).toBe(14); // Martes
  });

  test('should add working hours correctly', async () => {
    // Lunes 8:00 AM + 8 horas = Lunes 5:00 PM (considerando almuerzo)
    const startDate = new Date('2025-01-13T13:00:00.000Z'); // 8:00 AM Colombia
    const result = await service.calculateWorkingDateTime(0, 8, startDate);
    
    // Debería ser lunes a las 5:00 PM Colombia = 22:00 UTC
    expect(result.getUTCHours()).toBe(22);
    expect(result.getUTCDate()).toBe(13); // Mismo lunes
  });

  test('should handle weekend adjustment', async () => {
    // Sábado + 1 hora = Lunes 9:00 AM
    const startDate = new Date('2025-01-18T19:00:00.000Z'); // Sábado 2:00 PM Colombia
    const result = await service.calculateWorkingDateTime(0, 1, startDate);
    
    // Debería ajustar al viernes anterior y luego sumar la hora
    expect(result.getDay()).toBe(1); // Lunes
  });
});