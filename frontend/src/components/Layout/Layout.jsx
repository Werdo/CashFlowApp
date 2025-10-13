import React from 'react';
import { useSidebar } from '../../contexts/SidebarContext';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import './Layout.css';

const Layout = ({ children, user }) => {
  const { isExpanded, isMobile } = useSidebar();

  return (
    <div className="layout">
      <Sidebar user={user} />

      <div
        className={`
          layout-main
          ${isMobile ? 'layout-main-mobile' : 'layout-main-desktop'}
          ${isExpanded && !isMobile ? 'layout-main-sidebar-expanded' : 'layout-main-sidebar-collapsed'}
        `}
      >
        <Header user={user} />

        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
