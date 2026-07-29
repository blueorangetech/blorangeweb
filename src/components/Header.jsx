import React from 'react';
import AppLauncher from './AppLauncher';
import '../styles/Common.css';

function Header({ title, children }) {
  return (
    <header className="common-header">
      <div className="common-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="common-header-title">{title}</h1>
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {children}
          <AppLauncher />
        </div>
      </div>
    </header>
  );
}

export default Header;
