/**
 * Generates a unique Patient ID with the format: P-YYYYMMDD-XXXX
 * @returns {string} The generated unique patient ID.
 */
export const generatePatientId = () => {
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randSeq = Math.floor(1000 + Math.random() * 9000);
  return `P-${todayStr}-${randSeq}`;
};
