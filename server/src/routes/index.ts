import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import propertyRoutes from './properties';
import documentRoutes from './documents';
import reportRoutes from './reports';
import adminRoutes from './admin';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/properties', propertyRoutes);
router.use('/properties/:propertyId/documents', documentRoutes);
router.use('/properties/:propertyId', reportRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'PronA Analyzer API' });
});

export default router;
