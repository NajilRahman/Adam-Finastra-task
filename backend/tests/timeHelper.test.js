import { timeToMinutes, minutesToTime } from '../utils/timeHelper.js';

describe('timeHelper Utility Tests', () => {
  describe('timeToMinutes', () => {
    test('should convert HH:MM string to total minutes from midnight', () => {
      expect(timeToMinutes('00:00')).toBe(0);
      expect(timeToMinutes('09:30')).toBe(570); // 9 * 60 + 30
      expect(timeToMinutes('12:00')).toBe(720); // 12 * 60
      expect(timeToMinutes('23:59')).toBe(1439); // 23 * 60 + 59
    });
  });

  describe('minutesToTime', () => {
    test('should convert minutes from midnight to HH:MM format', () => {
      expect(minutesToTime(0)).toBe('00:00');
      expect(minutesToTime(570)).toBe('09:30');
      expect(minutesToTime(720)).toBe('12:00');
      expect(minutesToTime(1439)).toBe('23:59');
    });
  });
});
