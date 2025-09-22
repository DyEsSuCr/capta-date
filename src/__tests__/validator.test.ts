import { Validator } from '../utils/validator';
import { QueryParams } from '../types';

describe('Validator', () => {
  describe('validateParams', () => {
    test('should validate correct days parameter', () => {
      const params: QueryParams = { days: '5' };
      const result = Validator.validateParams(params);
      expect(result.days).toBe(5);
    });

    test('should validate correct hours parameter', () => {
      const params: QueryParams = { hours: '8' };
      const result = Validator.validateParams(params);
      expect(result.hours).toBe(8);
    });

    test('should validate correct date parameter', () => {
      const params: QueryParams = { 
        days: '1',
        date: '2025-04-10T15:00:00.000Z' 
      };
      const result = Validator.validateParams(params);
      expect(result.startDate).toBeInstanceOf(Date);
    });

    test('should throw error when no parameters provided', () => {
      const params: QueryParams = {};
      expect(() => Validator.validateParams(params))
        .toThrow('Al menos uno de los parámetros "days" o "hours" debe ser proporcionado');
    });

    test('should throw error for invalid days', () => {
      const params: QueryParams = { days: 'invalid' };
      expect(() => Validator.validateParams(params))
        .toThrow('El parámetro "days" debe ser un entero positivo');
    });

    test('should throw error for negative hours', () => {
      const params: QueryParams = { hours: '-1' };
      expect(() => Validator.validateParams(params))
        .toThrow('El parámetro "hours" debe ser un entero positivo');
    });

    test('should throw error for date without Z suffix', () => {
      const params: QueryParams = { 
        days: '1',
        date: '2025-04-10T15:00:00.000' 
      };
      expect(() => Validator.validateParams(params))
        .toThrow('El parámetro "date" debe estar en formato UTC con sufijo Z');
    });
  });
});