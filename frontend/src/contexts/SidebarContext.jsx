import React, { createContext, useContext, useState, useEffect } from 'react';
import useDeviceScreen from '../hooks/useDeviceScreen';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  // Use Facit's device screen hook for better responsive detection
  const deviceScreen = useDeviceScreen();

  // Sidebar states (Facit-inspired)
  const [isOpen, setIsOpen] = useState(false); // Mobile sidebar open state
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebar-expanded');
    return saved ? JSON.parse(saved) : true;
  });

  // Detect mobile based on Facit breakpoints (< 768px)
  const isMobile = deviceScreen.width ? deviceScreen.width < 768 : false;

  // Detect tablet portrait (641-768px) - auto-collapse sidebar
  const isTabletPortrait = deviceScreen.width ?
    (deviceScreen.width >= 641 && deviceScreen.width <= 768) : false;

  // Auto-collapse on tablet portrait
  useEffect(() => {
    if (isTabletPortrait && !isMobile) {
      setIsExpanded(false);
    }
  }, [isTabletPortrait, isMobile]);

  // Auto-close sidebar on mobile when resizing to larger screen
  useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);

  // Save expanded state
  useEffect(() => {
    localStorage.setItem('sidebar-expanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const openSidebar = () => {
    setIsOpen(true);
  };

  const collapseSidebar = () => {
    setIsExpanded(false);
  };

  const expandSidebar = () => {
    setIsExpanded(true);
  };

  const value = {
    // States
    isOpen,
    isExpanded,
    isMobile,
    isTabletPortrait,
    deviceScreen,

    // Actions
    toggleSidebar,
    closeSidebar,
    openSidebar,
    collapseSidebar,
    expandSidebar,
    setIsExpanded
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};
