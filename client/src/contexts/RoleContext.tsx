import { getLoggedInUser } from '@/lib/utils';
import { createContext, useContext, useState, ReactNode } from 'react';

interface RoleContextType {
  isAdminMode: boolean;
  setIsAdminMode: (value: boolean) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [isAdminMode, setIsAdminMode] = useState(getLoggedInUser().group?.split(':')?.includes('hrleader'));

  return (
    <RoleContext.Provider value={{ isAdminMode, setIsAdminMode }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}