import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;  // Explicitly typing children
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="content p-4" style={{ flex: 1, marginLeft: '250px' }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
