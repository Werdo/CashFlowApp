import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, TrendingUp, Receipt, Tag,
  AlertCircle, BarChart3, FileText, Download, Settings,
  User, HelpCircle, ChevronLeft, Menu, X, Brain,
  Server, Users, Database, Shield, CreditCard
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';
import './Sidebar.css';

const getSidebarSections = (user) => {
  const baseSections = [
    {
      title: "Principal",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", route: "/" },
        { icon: Calendar, label: "Calendario", route: "/calendar" },
        { icon: TrendingUp, label: "Analytics", route: "/analytics" }
      ]
    },
    {
      title: "Gestión",
      items: [
        { icon: Receipt, label: "Transacciones", route: "/transactions" },
        { icon: Tag, label: "Categorías", route: "/categories" },
        { icon: AlertCircle, label: "Alertas", route: "/alerts" }
      ]
    },
    {
      title: "Reportes",
      items: [
        { icon: BarChart3, label: "Reportes", route: "/reports" },
        { icon: FileText, label: "Documentos", route: "/documents" },
        { icon: Download, label: "Exportar", route: "/export" },
        { icon: Brain, label: "Análisis IA", route: "/ai-analysis" }
      ]
    }
  ];

  // Add admin section for admin users
  if (user?.role === 'admin' || user?.isAdmin) {
    baseSections.push({
      title: "Administración",
      items: [
        { icon: Server, label: "Backend", route: "/admin/backend" },
        { icon: Users, label: "Usuarios", route: "/admin/users" },
        { icon: CreditCard, label: "Facturación", route: "/admin/billing" },
        { icon: Database, label: "Base de Datos", route: "/admin/database" },
        { icon: Shield, label: "Seguridad", route: "/admin/security" }
      ],
      requiresAdmin: true
    });
  }

  baseSections.push({
    title: "Configuración",
    items: [
      { icon: Settings, label: "Ajustes", route: "/settings" },
      { icon: User, label: "Perfil", route: "/profile" },
      { icon: HelpCircle, label: "Ayuda", route: "/help" }
    ]
  });

  return baseSections;
};

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, isExpanded, isMobile, toggleSidebar, closeSidebar } = useSidebar();
  const [customLogo, setCustomLogo] = React.useState(localStorage.getItem('app-logo'));
  const sidebarSections = React.useMemo(() => getSidebarSections(user), [user]);

  // Listen for logo changes
  React.useEffect(() => {
    const handleStorageChange = () => {
      setCustomLogo(localStorage.getItem('app-logo'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleItemClick = (route) => {
    navigate(route);
    if (isMobile) {
      closeSidebar();
    }
  };

  const isActive = (route) => {
    return location.pathname === route;
  };

  // Framer Motion variants for animations
  const sidebarVariants = {
    desktop: {
      width: isExpanded ? '240px' : '64px',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    mobile: {
      x: isOpen ? 0 : '-100%',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    collapsed: { opacity: 0, x: -10 },
    expanded: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <>
      {/* Mobile: Backdrop with animation */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="sidebar-backdrop"
            onClick={closeSidebar}
            aria-hidden="true"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
        )}
      </AnimatePresence>

      {/* Sidebar with Framer Motion */}
      <motion.aside
        className={`
          sidebar
          ${isMobile ? 'sidebar-mobile' : 'sidebar-desktop'}
          ${isOpen ? 'sidebar-open' : ''}
          ${isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}
        `}
        variants={sidebarVariants}
        animate={isMobile ? 'mobile' : 'desktop'}
        initial={false}
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {customLogo ? (
              <>
                {isExpanded && <img src={customLogo} alt="Logo" className="sidebar-logo-image" />}
                {!isExpanded && <img src={customLogo} alt="Logo" className="sidebar-logo-icon-image" />}
              </>
            ) : (
              <>
                {isExpanded && <span className="sidebar-logo-text">💰 CashFlow</span>}
                {!isExpanded && <span className="sidebar-logo-icon">💰</span>}
              </>
            )}
          </div>

          {/* Toggle Button - Desktop Only */}
          {!isMobile && (
            <button
              className="sidebar-toggle-btn"
              onClick={toggleSidebar}
              aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <ChevronLeft
                size={20}
                className={`sidebar-toggle-icon ${!isExpanded ? 'rotated' : ''}`}
              />
            </button>
          )}

          {/* Close Button - Mobile Only */}
          {isMobile && (
            <button
              className="sidebar-close-btn"
              onClick={closeSidebar}
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {sidebarSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="sidebar-section">
              {isExpanded && (
                <div className="sidebar-section-title">{section.title}</div>
              )}
              {!isExpanded && <div className="sidebar-divider" />}

              <ul className="sidebar-menu">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const active = isActive(item.route);

                  return (
                    <li key={itemIdx} className="sidebar-menu-item">
                      <button
                        className={`sidebar-menu-link ${active ? 'active' : ''}`}
                        onClick={() => handleItemClick(item.route)}
                        title={!isExpanded ? item.label : undefined}
                      >
                        <Icon size={20} className="sidebar-menu-icon" />
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.span
                              className="sidebar-menu-label"
                              variants={itemVariants}
                              initial="collapsed"
                              animate="expanded"
                              exit="collapsed"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {active && <div className="sidebar-menu-indicator" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-version">
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  className="text-tertiary text-xs"
                  variants={itemVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                >
                  v3.0.0
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
