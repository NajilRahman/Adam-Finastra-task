import AuditLog from '../models/auditLog.model.js';
import logger from '../utils/logger.js';

export const logAction = async (userId, role, action, entity, entityId = null, details = {}) => {
  try {
    const auditEntry = new AuditLog({
      user: userId,
      role,
      action,
      entity,
      entityId,
      details
    });
    
    await auditEntry.save();
    logger.info(`Audit Log created: ${action} on ${entity} by ${role}`);
  } catch (error) {
    logger.error('Failed to write audit log:', error);
  }
};
