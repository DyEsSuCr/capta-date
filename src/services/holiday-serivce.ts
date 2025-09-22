import { type Holiday } from '../types';

export class HolidayService {
  private static holidays: Holiday[] | null = null;

  static async getHolidays(): Promise<Holiday[]> {
    if (this.holidays) {
      return this.holidays;
    }

    try {
      const response = await fetch('https://content.capta.co/Recruitment/WorkingDays.json');
      if (!response.ok) {
        throw new Error(`Error HTTP! status: ${response.status}`);
      }
      this.holidays = await response.json() as Holiday[];
      return this.holidays;
    } catch (error) {
      console.error('Error fetching holidays:', error);
      // Fallback con algunos festivos colombianos conocidos para 2025
      this.holidays = [
        { date: '2025-01-01', name: 'Año Nuevo' },
        { date: '2025-01-06', name: 'Día de los Reyes Magos' },
        { date: '2025-03-24', name: 'Día de San José' },
        { date: '2025-04-17', name: 'Jueves Santo' },
        { date: '2025-04-18', name: 'Viernes Santo' },
        { date: '2025-05-01', name: 'Día del Trabajo' },
        { date: '2025-06-02', name: 'Ascensión del Señor' },
        { date: '2025-06-23', name: 'Corpus Christi' },
        { date: '2025-06-30', name: 'Sagrado Corazón de Jesús' },
        { date: '2025-07-07', name: 'San Pedro y San Pablo' },
        { date: '2025-07-20', name: 'Día de la Independencia' },
        { date: '2025-08-07', name: 'Batalla de Boyacá' },
        { date: '2025-08-18', name: 'Asunción de la Virgen' },
        { date: '2025-10-13', name: 'Día de la Raza' },
        { date: '2025-11-03', name: 'Todos los Santos' },
        { date: '2025-11-17', name: 'Independencia de Cartagena' },
        { date: '2025-12-08', name: 'Inmaculada Concepción' },
        { date: '2025-12-25', name: 'Navidad' }
      ];
      return this.holidays;
    }
  }
}