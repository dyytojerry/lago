import { Router } from 'express';
import {
  assignOperationStaffRoles,
  createOperationRole,
  deleteOperationRole,
  listOperationPermissions,
  listOperationRoles,
  listOperationStaffs,
  updateOperationRole,
} from '../controllers/operationRoles.controller';
import { authOperation, requirePermissions } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  assignOperationStaffRolesSchema,
  createOperationRoleSchema,
  updateOperationRoleSchema,
} from '../schemas/operationRoleSchema';

const router = Router();

router.use(authOperation);

router.get('/permissions', requirePermissions('system:roles'), listOperationPermissions);
router.get('/roles', requirePermissions('system:roles'), listOperationRoles);
router.post('/roles', requirePermissions('system:roles'), validateRequest(createOperationRoleSchema), createOperationRole);
router.put('/roles/:roleId', requirePermissions('system:roles'), validateRequest(updateOperationRoleSchema), updateOperationRole);
router.delete('/roles/:roleId', requirePermissions('system:roles'), deleteOperationRole);

router.get('/staffs', requirePermissions('system:staff_roles'), listOperationStaffs);
router.put(
  '/staffs/:staffId/roles',
  requirePermissions('system:staff_roles'),
  validateRequest(assignOperationStaffRolesSchema),
  assignOperationStaffRoles
);

export default router;

