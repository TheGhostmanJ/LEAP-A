// src/services/leaveService.js

// Initial fallback mock data matching your DB structure
const INITIAL_CREDITS = {
  vacation: 15.0,
  sick: 10.0,
  splUsed: 1,
  soloParentUsed: 0
};

export const leaveService = {
  // Fetch leave balances
  getUserCredits: async (employeeKey) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const stored = localStorage.getItem(`leave_credits_${employeeKey}`);
    return stored ? JSON.parse(stored) : INITIAL_CREDITS;
  },

  // Save new leave application
  submitApplication: async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Save to local applications history
    const existing = JSON.parse(localStorage.getItem('recent_leave_applications') || '[]');
    localStorage.setItem('recent_leave_applications', JSON.stringify([payload, ...existing]));

    // Deduct mock credits temporarily to test frontend credit UI updates
    const credits = JSON.parse(localStorage.getItem(`leave_credits_${payload.employee_key}`) || JSON.stringify(INITIAL_CREDITS));
    if (payload.leave_type === 'Vacation Leave') credits.vacation -= payload.working_days;
    if (payload.leave_type === 'Sick Leave') credits.sick -= payload.working_days;
    if (payload.leave_type === 'Special Privilege Leave') credits.splUsed += payload.working_days;

    localStorage.setItem(`leave_credits_${payload.employee_key}`, JSON.stringify(credits));
    return { success: true, message: 'Application submitted successfully' };
  }
};