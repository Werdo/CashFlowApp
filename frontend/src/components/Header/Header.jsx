import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Search, User, ChevronDown } from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './Header.css';

const Header = ({ user }) => {
  const { isMobile, openSidebar, toggleSidebar } = useSidebar();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [appTitle, setAppTitle] = useState(() => localStorage.getItem('app-title') || 'CashFlow');
  const [selectedYear, setSelectedYear] = useState(() => localStorage.getItem('selected-year') || new Date().getFullYear());
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);

  // Listen for changes to app title from Settings
  useEffect(() => {
    const handleStorageChange = () => {
      setAppTitle(localStorage.getItem('app-title') || 'CashFlow');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load available years (mock for now - will connect to API later)
  useEffect(() => {
    // TODO: Fetch from API /api/years
    const currentYear = new Date().getFullYear();
    setAvailableYears([
      currentYear - 1,
      currentYear,
      currentYear + 1
    ]);
  }, []);

  const handleYearChange = (year) => {
    setSelectedYear(year);
    localStorage.setItem('selected-year', year);
    window.dispatchEvent(new Event('storage'));
    setShowYearDropdown(false);
  };

  // Animation variants
  const menuButtonVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 }
    }
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15 }
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        {/* Mobile: Hamburger Menu with animation */}
        <AnimatePresence>
          {isMobile && (
            <motion.button
              className="header-menu-btn"
              onClick={openSidebar}
              aria-label="Open menu"
              variants={menuButtonVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Menu size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Page Title */}
        <h1 className="header-title">{appTitle}</h1>

        {/* Year Selector */}
        <div className="header-year-selector">
          <button
            className="header-year-btn"
            onClick={() => setShowYearDropdown(!showYearDropdown)}
            aria-label="Select year"
          >
            <span className="header-year-text">{selectedYear}</span>
            <ChevronDown size={16} className={`header-year-chevron ${showYearDropdown ? 'open' : ''}`} />
          </button>

          {/* Year Dropdown */}
          <AnimatePresence>
            {showYearDropdown && (
              <>
                <div
                  className="header-year-dropdown-backdrop"
                  onClick={() => setShowYearDropdown(false)}
                />
                <motion.div
                  className="header-year-dropdown"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {availableYears.map(year => (
                    <button
                      key={year}
                      className={`header-year-dropdown-item ${selectedYear == year ? 'active' : ''}`}
                      onClick={() => handleYearChange(year)}
                    >
                      {year}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="header-right">
        {/* Search Button */}
        <button
          className="header-icon-btn"
          aria-label="Search"
          title="Search"
        >
          <Search size={20} />
        </button>

        {/* Notifications */}
        <button
          className="header-icon-btn header-notification-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={20} />
          <span className="header-notification-badge">3</span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <div className="header-user-menu">
          <button
            className="header-user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
          >
            <div className="header-user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <User size={18} />
              )}
            </div>
            <span className="header-user-name">{user?.name || 'Usuario'}</span>
            <ChevronDown size={16} className="header-user-chevron" />
          </button>

          {/* Dropdown Menu with animation */}
          <AnimatePresence>
            {showUserMenu && (
              <>
                <div
                  className="header-user-menu-backdrop"
                  onClick={() => setShowUserMenu(false)}
                />
                <motion.div
                  className="header-user-menu-dropdown"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="header-user-menu-header">
                    <div className="header-user-menu-name">{user?.name || 'Usuario'}</div>
                    <div className="header-user-menu-email">{user?.email || 'user@example.com'}</div>
                  </div>
                  <div className="header-user-menu-divider" />
                  <ul className="header-user-menu-list">
                    <li>
                      <button className="header-user-menu-item">
                        Mi Perfil
                      </button>
                    </li>
                    <li>
                      <button className="header-user-menu-item">
                        Configuración
                      </button>
                    </li>
                    <li>
                      <button className="header-user-menu-item">
                        Ayuda
                      </button>
                    </li>
                  </ul>
                  <div className="header-user-menu-divider" />
                  <ul className="header-user-menu-list">
                    <li>
                      <button className="header-user-menu-item header-user-menu-item-danger">
                        Cerrar Sesión
                      </button>
                    </li>
                  </ul>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
