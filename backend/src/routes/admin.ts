import { Router } from 'express';
import { getStats } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/adminAuth';

const router = Router();

// Todas las rutas requieren autenticación y ser superadmin
router.use(authenticate);
router.use(requireSuperAdmin);

// GET /admin/stats - Estadísticas generales
router.get('/stats', getStats);

export default router;

