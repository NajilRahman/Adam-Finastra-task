import { generatePatientId } from '../utils/idGenerator.js';

describe('idGenerator Utility Tests', () => {
  describe('generatePatientId', () => {
    test('should return a string in the format P-YYYYMMDD-XXXX', () => {
      const patientId = generatePatientId();
      
      // Format validation: P- followed by 8 digits, a hyphen, and 4 digits
      expect(patientId).toMatch(/^P-\d{8}-\d{4}$/);
    });

    test('should generate unique values across consecutive calls', () => {
      const id1 = generatePatientId();
      const id2 = generatePatientId();
      
      // Even if called in the same millisecond, the random suffix should separate them
      expect(id1).not.toBe(id2);
    });
  });
});
