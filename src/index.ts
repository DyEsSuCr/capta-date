import express, { Request, Response } from 'express';
import cors from 'cors';
import { QueryParams, SuccessResponse, ErrorResponse } from './types';
import { Validator } from './utils/validator';
import { WorkingDaysService } from './services/working-days-service';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.path !== '/favicon.ico') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Query:`, req.query);
  }
  next();
});

const workingDaysService = new WorkingDaysService();

const calculateHandler = async (req: Request<{}, SuccessResponse | ErrorResponse, {}, QueryParams>, res: Response<SuccessResponse | ErrorResponse>) => {
  try {
    console.log('Received query parameters:', req.query);
    
    const validatedParams = Validator.validateParams(req.query);
    console.log('Validated parameters:', validatedParams);

    const resultDate = await workingDaysService.calculateWorkingDateTime(
      validatedParams.days,
      validatedParams.hours,
      validatedParams.startDate
    );
    
    console.log('Calculated result:', resultDate.toISOString());

    const response: SuccessResponse = {
      date: resultDate.toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Error in calculation:', errMsg);
    
    const errorResponse: ErrorResponse = {
      error: 'InvalidParameters',
      message: errMsg
    };

    const statusCode = errMsg.includes('servidor') ? 503 : 400;
    res.status(statusCode).json(errorResponse);
  }
};

app.get('/calculate-working-time', calculateHandler);
app.get('/', calculateHandler);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

app.use((req: Request, res: Response<ErrorResponse>) => {
  res.status(404).json({
    error: 'NotFound',
    message: 'Endpoint no encontrado'
  });
});

app.use((err: any, req: Request, res: Response<ErrorResponse>, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'InternalServerError',
    message: 'Error interno del servidor'
  });
});

const server = app.listen(port, () => {
  console.log(`Servidor ejecutándose en puerto ${port}`);
  console.log(`Health check disponible en: http://localhost:${port}/health`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;