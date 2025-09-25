import { Holiday } from '../types';

export class HolidayService {
  private static holidays: Holiday[] | null = null;
  private static lastFetch: number = 0;
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000;

  static async getHolidays(): Promise<Holiday[]> {
    const now = Date.now();
    
    if (this.holidays && (now - this.lastFetch) < this.CACHE_TTL) {
      return this.holidays;
    }

    try {
      const response = await fetch('https://content.capta.co/Recruitment/WorkingDays.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const fetchedHolidays = await response.json();
      if (Array.isArray(fetchedHolidays)) {
        this.holidays = fetchedHolidays;
        this.lastFetch = now;
        return this.holidays;
      } else {
        throw new Error('Invalid holidays format');
      }
    } catch (error) {
      console.error('Error fetching holidays, using fallback:', error);
      
      this.holidays = this.getFallbackHolidays();
      this.lastFetch = now;
      return this.holidays;
    }
  }

  private static getFallbackHolidays(): Holiday[] {
    return [
      { date: '2024-01-01', name: 'Año Nuevo' },
      { date: '2024-01-08', name: 'Día de los Reyes Magos' },
      { date: '2024-03-25', name: 'Día de San José' },
      { date: '2024-03-28', name: 'Jueves Santo' },
      { date: '2024-03-29', name: 'Viernes Santo' },
      { date: '2024-05-01', name: 'Día del Trabajo' },
      { date: '2024-05-13', name: 'Ascensión del Señor' },
      { date: '2024-06-03', name: 'Corpus Christi' },
      { date: '2024-06-10', name: 'Sagrado Corazón de Jesús' },
      { date: '2024-07-01', name: 'San Pedro y San Pablo' },
      { date: '2024-07-20', name: 'Día de la Independencia' },
      { date: '2024-08-07', name: 'Batalla de Boyacá' },
      { date: '2024-08-19', name: 'Asunción de la Virgen' },
      { date: '2024-10-14', name: 'Día de la Raza' },
      { date: '2024-11-04', name: 'Todos los Santos' },
      { date: '2024-11-11', name: 'Independencia de Cartagena' },
      { date: '2024-12-08', name: 'Inmaculada Concepción' },
      { date: '2024-12-25', name: 'Navidad' },
      
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
  }
}
