import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isMinimized: boolean;
  toggleSidebar: () => void;
  setMinimized: (minimized: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  // Check localStorage for saved state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-minimized');
    if (saved !== null) {
      setIsMinimized(JSON.parse(saved));
    }
  }, []);

  // Auto-minimize on smaller screens with better breakpoints
  useEffect(() => {
    const handleResize = () => {
      // Auto minimize when viewport width suggests sidebar should be compact
      if (window.innerWidth < 1400) {
        setIsMinimized(true);
      } else if (window.innerWidth >= 1600) {
        // Auto expand on larger screens unless user explicitly set to minimized
        const saved = localStorage.getItem('sidebar-minimized');
        if (saved === null) {
          setIsMinimized(false);
        }
      }
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    const newState = !isMinimized;
    setIsMinimized(newState);
    localStorage.setItem('sidebar-minimized', JSON.stringify(newState));
  };

  const setMinimized = (minimized: boolean) => {
    setIsMinimized(minimized);
    localStorage.setItem('sidebar-minimized', JSON.stringify(minimized));
  };

  return (
    <SidebarContext.Provider value={{ isMinimized, toggleSidebar, setMinimized }}>
      {children}
    </SidebarContext.Provider>
  );
};