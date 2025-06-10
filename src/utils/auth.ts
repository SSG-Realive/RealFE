export function getUserRole(): 'admin' | 'seller' | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role; // 'admin' 또는 'seller'
  } catch {
    return null;
  }
} 