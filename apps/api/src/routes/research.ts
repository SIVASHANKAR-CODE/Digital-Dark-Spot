import { Router } from 'express';
import {
  createResearch,
  getAllResearch,
  getResearch,
  deleteResearch,
  addSources,
  getSources,
  analyzeResearch,
  getStatus,
  getReport,
  updateChecklist,
  toggleChecklistItem,
  addChecklistItem,
} from '../controllers/researchController';
import { validateRequest } from '../middleware/validateRequest';
import { CreateResearchSchema, AddSourceSchema } from '../schemas/research';

const router = Router();

// Sessions
router.post('/', validateRequest(CreateResearchSchema), createResearch);
router.get('/', getAllResearch);
router.get('/:id', getResearch);
router.delete('/:id', deleteResearch);

// Sources
router.post('/:id/sources', validateRequest(AddSourceSchema), addSources);
router.get('/:id/sources', getSources);

// Analysis
router.post('/:id/analyze', analyzeResearch);
router.get('/:id/status', getStatus);

// Reports
router.get('/:id/report', getReport);

// Checklist items
router.put('/:id/checklist', updateChecklist);
router.patch('/:id/checklist/:itemId/toggle', toggleChecklistItem);
router.post('/:id/checklist', addChecklistItem);

export default router;

