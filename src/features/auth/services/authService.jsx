// Service layer isolating HTTP operations from UI elements
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const loginUser = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    throw new Error('Network communication failure');
  }
  
  return await response.json();
};