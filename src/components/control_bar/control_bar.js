import React from 'react';
import small from "../../assets/icons/small.svg";
import mid from '../../assets/icons/mid.svg';
import big from '../../assets/icons/big.svg';
import pink from '../../assets/icons/pink.svg';
import orange from '../../assets/icons/orange.svg';
import black from '../../assets/icons/black.svg';
import easer from '../../assets/icons/easer.svg';
import blackPen from '../../assets/icons/black_pen.svg';
import pinkPen from '../../assets/icons/pink_pen.svg';
import orangePen from '../../assets/icons/orange_pen.svg';
import download from '../../assets/icons/download.svg';

const ControlBar = ({ currentColor, currentSize, setCurrentSize, isErasing, toggleEraser, lastColor, funcSetCurrentColor, convertSVGToPDF }) => {
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

    const getIconStyle = (color) => ({
        margin: '10px',
        cursor: 'pointer',
        width: currentColor === color ? 'calc(20px - 8px)' : '20px',
        height: currentColor === color ? 'calc(20px - 8px)' : '20px',
        borderRadius: '50%',
        border: currentColor === color ? '4px solid #55CCFF' : 'none',
    });

    const getIconStyleSize = (size) => ({
        margin: '10px',
        cursor: 'pointer',
        width: currentSize === size ? 'calc(20px - 8px)' : '20px',
        height: currentSize === size ? 'calc(20px - 8px)' : '20px',
        borderRadius: '50%',
        border: currentSize === size ? '4px solid #55CCFF' : 'none',
    });

    const downloadStyle = {
        margin: '10px',
        cursor: 'pointer',
        width: '20px',
        height: '20px',
    }

    return (
        <div style={style}>
            <img onClick={() => setCurrentSize(1)} src={small} style={getIconStyleSize(1)} />
            <img onClick={() => setCurrentSize(3)} src={mid} style={getIconStyleSize(3)} />
            <img onClick={() => setCurrentSize(10)} src={big} style={getIconStyleSize(10)} />
            <img onClick={() => funcSetCurrentColor('#C031B5')} src={pink} style={getIconStyle('#C031B5')} />
            <img onClick={() => funcSetCurrentColor('#ff8400')} src={orange} style={getIconStyle('#ff8400')} />
            <img onClick={() => funcSetCurrentColor('black')} src={black} style={getIconStyle('black')} />
            {!isErasing ? 
                <img onClick={() => toggleEraser()} src={easer} style={getIconStyle('')} /> 
                : 
                <img 
                    onClick={() => toggleEraser()} 
                    src={lastColor === 'black' ? blackPen : (lastColor === '#C031B5' ? pinkPen : orangePen)} 
                    style={getIconStyle("")} 
                    alt="Color Icon" 
                />
            }
            <img onClick={() => convertSVGToPDF()} src={download} style={downloadStyle} />
        </div>
    );

}

export default ControlBar;
