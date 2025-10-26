import { useContext } from 'react';
import { AuthContext, AuthContextType } from '@/lib/auth.tsx';
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};