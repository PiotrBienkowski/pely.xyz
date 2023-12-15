import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import small from "../assets/icons/small.svg";
import mid from '../assets/icons/mid.svg';
import big from '../assets/icons/big.svg';
import pink from '../assets/icons/pink.svg';
import orange from '../assets/icons/orange.svg';
import black from '../assets/icons/black.svg';

const ControlBar = ({ setCurrentColor, currentColor, currentSize, setCurrentSize }) => {
    const style = {
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        right: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: '#ffffff',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
        padding: '10px',
        zIndex: '1000'
    };

    const iconStyle = {
        margin: '10px',
        cursor: 'pointer',
        fontSize: '16px',
        width: '20px',
        height: '20px'
    };

    const getIconStyle = (color) => ({
        margin: '10px',
        cursor: 'pointer',
        width: currentColor === color ? 'calc(20px - 8px)' : '20px', // Odejmowanie szerokości ramki
        height: currentColor === color ? 'calc(20px - 8px)' : '20px',
        borderRadius: '50%',
        border: currentColor === color ? '4px solid #0081CF' : 'none',
    });

    const getIconStyleSize = (size) => ({
        margin: '10px',
        cursor: 'pointer',
        width: currentSize === size ? 'calc(20px - 8px)' : '20px', // Odejmowanie szerokości ramki
        height: currentSize === size ? 'calc(20px - 8px)' : '20px',
        borderRadius: '50%',
        border: currentSize === size ? '4px solid #0081CF' : 'none',
    });

    return (
        <div style={style}>
            <img onClick={() => setCurrentSize(2)} src={small} style={getIconStyleSize(2)} alt="Small Icon" />
            <img onClick={() => setCurrentSize(5)} src={mid} style={getIconStyleSize(5)} alt="Mid Icon" />
            <img onClick={() => setCurrentSize(10)} src={big} style={getIconStyleSize(10)} alt="Big Icon" />
            <img onClick={() => setCurrentColor('black')} src={black} style={getIconStyle('black')} alt="Black Icon" />
            <img onClick={() => setCurrentColor('#C031B5')} src={pink} style={getIconStyle('#C031B5')} alt="Pink Icon" />
            <img onClick={() => setCurrentColor('#ff8400')} src={orange} style={getIconStyle('#ff8400')} alt="Orange Icon" />
        </div>
    );

}

export default ControlBar;
