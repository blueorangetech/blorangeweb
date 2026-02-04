import React from 'react';
import '../styles/Common.css';

function Header({ title, children }) {
    return (
        <header className="common-header">
            <div className="common-container">
                <h1 className="common-header-title">{title}</h1>
                {children && <div className="header-actions">{children}</div>}
            </div>
        </header>
    );
}

export default Header;
