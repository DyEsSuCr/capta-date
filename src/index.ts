// src/index.ts
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import type { QueryParams, SuccessResponse, ErrorResponse } from './types';
import { Validator } from './utils/validator';
import { WorkingDaysService } from './services/working-days-service';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servicio
const workingDaysService = new WorkingDaysService();

// Endpoint principal
app.get(
  '/calculate-working-time',
  async (
    req: Request<{}, SuccessResponse | ErrorResponse, {}, QueryParams>,
    res: Response<SuccessResponse | ErrorResponse>
  ) => {
    try {
      const validatedParams = Validator.validateParams(req.query);

      const resultDate = await workingDaysService.calculateWorkingDateTime(
        validatedParams.days,
        validatedParams.hours,
        validatedParams.startDate
      );

      res.status(200).json({ date: resultDate.toISOString() });
    } catch (error) {
      console.error('Error:', error);

      const errorResponse: ErrorResponse = {
        error: 'InvalidParameters',
        message:
          error instanceof Error
            ? error.message
            : 'Error interno del servidor',
      };

      const statusCode =
        error instanceof Error && error.message.includes('servidor')
          ? 503
          : 400;
      res.status(statusCode).json(errorResponse);
    }
  }
);

// Endpoint alternativo (ruta raíz)
app.get(
  '/',
  async (
    req: Request<{}, SuccessResponse | ErrorResponse, {}, QueryParams>,
    res: Response<SuccessResponse | ErrorResponse>
  ) => {
    try {
      const validatedParams = Validator.validateParams(req.query);

      const resultDate = await workingDaysService.calculateWorkingDateTime(
        validatedParams.days,
        validatedParams.hours,
        validatedParams.startDate
      );

      res.status(200).json({ date: resultDate.toISOString() });
    } catch (error) {
      console.error('Error:', error);

      const errorResponse: ErrorResponse = {
        error: 'InvalidParameters',
        message:
          error instanceof Error
            ? error.message
            : 'Error interno del servidor',
      };

      const statusCode =
        error instanceof Error && error.message.includes('servidor')
          ? 503
          : 400;
      res.status(statusCode).json(errorResponse);
    }
  }
);

// Manejo de rutas no encontradas
app.use((req: Request, res: Response<ErrorResponse>) => {
  res.status(404).json({
    error: 'NotFound',
    message: 'Endpoint no encontrado',
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor ejecutándose en puerto ${port}`);
});

export default app;
