import { Router, Response } from 'express';
import { requireSession, AuthenticatedRequest } from '../middleware/auth';
import { sessionManager } from '../utils/sessionManager';
import { calculateDebtAggregation } from '../utils/debtCalculations';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import Papa from 'papaparse';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const debtSchema = z.object({
  debtType: z.enum(['credit_card', 'personal_loan', 'student_loan', 'auto_loan', 'other']),
  balance: z.number().min(0),
  apr: z.number().min(0).max(100),
  minimumPayment: z.number().min(0),
  nextPaymentDate: z.string().optional(),
  creditLimit: z.number().min(0).optional(),
});

router.use(requireSession);

// Get all debts
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = sessionManager.getSession(req.sessionId!);
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session does not exist or has expired',
      });
    }

    res.json({
      debts: session.debts,
      aggregation: calculateDebtAggregation(
        session.debts,
        session.financialContext?.monthlyIncome || 0
      ),
    });
  } catch (error) {
    console.error('Error getting debts:', error);
    res.status(500).json({
      error: 'Failed to get debts',
      message: 'An error occurred while retrieving your debts',
    });
  }
});

// Add a single debt
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const validationResult = debtSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid debt data',
        details: validationResult.error.errors,
      });
    }

    const session = sessionManager.getSession(req.sessionId!);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session does not exist or has expired',
      });
    }

    const newDebt = {
      ...validationResult.data,
      id: uuidv4(),
    };

    const updatedDebts = [...session.debts, newDebt];

    const success = sessionManager.updateSession(req.sessionId!, {
      debts: updatedDebts,
    });

    if (!success) {
      return res.status(500).json({
        error: 'Failed to save debt',
        message: 'An error occurred while saving your debt',
      });
    }

    res.status(201).json({
      message: 'Debt added successfully',
      debt: newDebt,
      aggregation: calculateDebtAggregation(
        updatedDebts,
        session.financialContext?.monthlyIncome || 0
      ),
    });
  } catch (error) {
    console.error('Error adding debt:', error);
    res.status(500).json({
      error: 'Failed to add debt',
      message: 'An error occurred while adding your debt',
    });
  }
});

// Update a debt
router.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validationResult = debtSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid debt data',
        details: validationResult.error.errors,
      });
    }

    const session = sessionManager.getSession(req.sessionId!);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session does not exist or has expired',
      });
    }

    const debtIndex = session.debts.findIndex(d => d.id === id);
    if (debtIndex === -1) {
      return res.status(404).json({
        error: 'Debt not found',
        message: 'The debt you are trying to update does not exist',
      });
    }

    const updatedDebt = {
      ...validationResult.data,
      id,
    };

    const updatedDebts = [...session.debts];
    updatedDebts[debtIndex] = updatedDebt;

    const success = sessionManager.updateSession(req.sessionId!, {
      debts: updatedDebts,
    });

    if (!success) {
      return res.status(500).json({
        error: 'Failed to update debt',
        message: 'An error occurred while updating your debt',
      });
    }

    res.json({
      message: 'Debt updated successfully',
      debt: updatedDebt,
      aggregation: calculateDebtAggregation(
        updatedDebts,
        session.financialContext?.monthlyIncome || 0
      ),
    });
  } catch (error) {
    console.error('Error updating debt:', error);
    res.status(500).json({
      error: 'Failed to update debt',
      message: 'An error occurred while updating your debt',
    });
  }
});

// Delete a debt
router.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const session = sessionManager.getSession(req.sessionId!);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session does not exist or has expired',
      });
    }

    const updatedDebts = session.debts.filter(d => d.id !== id);

    if (updatedDebts.length === session.debts.length) {
      return res.status(404).json({
        error: 'Debt not found',
        message: 'The debt you are trying to delete does not exist',
      });
    }

    const success = sessionManager.updateSession(req.sessionId!, {
      debts: updatedDebts,
    });

    if (!success) {
      return res.status(500).json({
        error: 'Failed to delete debt',
        message: 'An error occurred while deleting your debt',
      });
    }

    res.json({
      message: 'Debt deleted successfully',
      aggregation: calculateDebtAggregation(
        updatedDebts,
        session.financialContext?.monthlyIncome || 0
      ),
    });
  } catch (error) {
    console.error('Error deleting debt:', error);
    res.status(500).json({
      error: 'Failed to delete debt',
      message: 'An error occurred while deleting your debt',
    });
  }
});

// CSV Upload
router.post('/upload', upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a CSV file',
      });
    }

    const session = sessionManager.getSession(req.sessionId!);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session does not exist or has expired',
      });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const debtTypes = ['credit_card', 'personal_loan', 'student_loan', 'auto_loan', 'other'];
        const addedDebts = [];
        const errors = [];

        for (const row of results.data as any[]) {
          try {
            const balance = parseFloat(row.balance);
            const apr = parseFloat(row.apr);
            const minimumPayment = parseFloat(row.minimumPayment);
            const debtType = row.debtType?.toLowerCase().replace(/\s+/g, '_');

            if (
              debtTypes.includes(debtType) &&
              !isNaN(balance) && balance > 0 &&
              !isNaN(apr) && apr >= 0 && apr <= 100 &&
              !isNaN(minimumPayment) && minimumPayment > 0
            ) {
              const newDebt = {
                id: uuidv4(),
                debtType: debtType as any,
                balance,
                apr,
                minimumPayment,
              };
              addedDebts.push(newDebt);
            } else {
              errors.push({
                row,
                reason: 'Invalid data format or values',
              });
            }
          } catch (error) {
            errors.push({
              row,
              reason: 'Error parsing row',
            });
          }
        }

        if (addedDebts.length === 0) {
          return res.status(400).json({
            error: 'No valid debts found',
            message: 'The CSV file did not contain any valid debt records',
            errors,
          });
        }

        const updatedDebts = [...session.debts, ...addedDebts];

        const success = sessionManager.updateSession(req.sessionId!, {
          debts: updatedDebts,
        });

        if (!success) {
          return res.status(500).json({
            error: 'Failed to save debts',
            message: 'An error occurred while saving your debts',
          });
        }

        res.status(201).json({
          message: `Successfully added ${addedDebts.length} debt(s)`,
          addedCount: addedDebts.length,
          errorCount: errors.length,
          errors: errors.length > 0 ? errors : undefined,
          aggregation: calculateDebtAggregation(
            updatedDebts,
            session.financialContext?.monthlyIncome || 0
          ),
        });
      },
      error: (error: any) => {
        res.status(400).json({
          error: 'CSV parsing error',
          message: `Error parsing CSV file: ${error.message || 'Unknown error'}`,
        });
      },
    });
  } catch (error) {
    console.error('Error uploading CSV:', error);
    res.status(500).json({
      error: 'Failed to process CSV upload',
      message: 'An error occurred while processing your CSV file',
    });
  }
});

export default router;

