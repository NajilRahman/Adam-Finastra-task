import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    role: {
      type: String,
      required: [true, 'Role is required']
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      index: true
    },
    entity: {
      type: String,
      required: [true, 'Entity type is required']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
