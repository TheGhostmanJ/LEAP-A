// src/features/leave/cscRules.js

// 1. Calculate working days excluding Weekends (Sat/Sun)
export const calculateWorkingDays = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return 0;
  let start = new Date(startDateStr);
  let end = new Date(endDateStr);
  if (start > end) return 0;

  let count = 0;
  let cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++; // Exclude Sun (0) and Sat (6)
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

// 2. Compute minimum allowed start date for advance filing rules
export const getMinFilingDate = (leaveType) => {
  const today = new Date();
  
  // Vacation & Special Privilege require at least 5 working days advance notice
  if (leaveType === 'Vacation Leave' || leaveType === 'Special Privilege Leave') {
    let added = 0;
    let target = new Date(today);
    while (added < 5) {
      target.setDate(target.getDate() + 1);
      if (target.getDay() !== 0 && target.getDay() !== 6) added++;
    }
    return target.toISOString().split('T')[0];
  }
  
  // Sick leave or urgent leaves can be filed immediately
  return today.toISOString().split('T')[0];
};

// 3. Evaluate dynamic rules and required attachments
export const validateCSCApplication = (formData = {}, userCredits = {}) => {
  const errors = [];
  const requiredFiles = [];

  // Safeguard against null userCredits or missing formData
  const credits = userCredits || {};
  const days = parseFloat(formData?.workingDays || 0);
  const leaveType = formData?.leaveType;

  const vacationBalance = credits.vacation ?? 0;
  const sickBalance = credits.sick ?? 0;
  const splUsed = credits.splUsed ?? 0;

  // --- Rule A: Credit Balance Check ---
  if (leaveType === 'Vacation Leave' && vacationBalance < days) {
    errors.push(`Insufficient Vacation Leave credits (Available: ${vacationBalance}).`);
  }
  if (leaveType === 'Sick Leave' && sickBalance < days) {
    errors.push(`Insufficient Sick Leave credits (Available: ${sickBalance}). This will be tagged as Leave Without Pay (LWOP).`);
  }

  // --- Rule B: Special Privilege Leave (SPL) Annual Limit ---
  if (leaveType === 'Special Privilege Leave') {
    if (days > 3 || (splUsed + days) > 3) {
      errors.push('Special Privilege Leave is capped at a maximum of 3 days per calendar year.');
    }
  }

  // --- Rule C: Attachment Requirements ---
  if (leaveType === 'Sick Leave' && days > 5) {
    requiredFiles.push('Medical Certificate (Required for > 5 days)');
  }
  if (leaveType === 'Maternity Leave') {
    requiredFiles.push('Proof of Pregnancy / Medical Certificate');
  }
  if (leaveType === 'Special Leave Benefits for Women') {
    requiredFiles.push('Medical Certificate with Clinical Summary');
  }
  if (leaveType === '10-Day VAWC Leave') {
    requiredFiles.push('Barangay/Court Protection Order');
  }
  if (leaveType === 'Vacation Leave' && formData?.vacationSplLocation === 'abroad') {
    requiredFiles.push('Approved Travel Authority / Office Clearance');
  }

  return { 
    errors, 
    requiredFiles,
    requiredDocs: requiredFiles // Backup property key to match LeaveApplication component mapping
  };
};