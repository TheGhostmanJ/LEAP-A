// src/services/leaveService.js

const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const leaveService = {
  // Fetch leave balances from the real backend (credit ledger endpoint)
  getUserCredits: async (employeeKey) => {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/api/credit-ledger/${employeeKey}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch leave credits (status ${response.status})`);
    }

    const data = await response.json();

    // Map the balances array [{leave_type, remaining_credits}, ...] into the
    // {vacation, sick, splUsed} shape that cscRules.js / LeaveApplication.jsx expect.
    const credits = { vacation: 0, sick: 0, splUsed: 0 };
    (data.balances || []).forEach((row) => {
      if (row.leave_type === 'Vacation Leave') credits.vacation = parseFloat(row.remaining_credits) || 0;
      if (row.leave_type === 'Sick Leave') credits.sick = parseFloat(row.remaining_credits) || 0;
    });

    // splUsed comes from how many Special Privilege Leave days have been used this year
    (data.used || []).forEach((row) => {
      if (row.leave_type === 'Special Privilege Leave') {
        credits.splUsed = parseFloat(row.used_days) || 0;
      }
    });

    return credits;
  },

  // Save new leave application — actually POSTs to the backend now.
  submitApplication: async (payload) => {
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/leave/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      // response body wasn't JSON — leave data as null, handled below
    }

    if (!response.ok) {
      const message = (data && (data.message || data.error)) || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return data || { success: true };
  }
};
