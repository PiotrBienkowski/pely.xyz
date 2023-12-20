import React from 'react';
import logo from '../../assets/icons/logo.svg';
import './Logo.css';

const Logo = () => {
    return (
        <div style={{ position: 'fixed', top: '10px', left: '10px' }}>
            <img src={logo} alt="Logo" className="logo" />
        </div>
    );
};

export default Logo;