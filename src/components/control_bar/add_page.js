import React, { useState } from 'react';
import plus from '../../assets/icons/plus.svg';

const AddPage = ({setPages, svgRefs}) => {
    const [isPressed, setIsPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const addPage = () => {
        setPages(prevPages => [...prevPages, []]);
        svgRefs.current = [...svgRefs.current, React.createRef()];
    };

    const icoStyle = {
        width: isPressed ? '47px' : '50px',
        height: isPressed ? '47px' : '50px',
        display: 'block',
        margin: 'auto',
        transition: 'width 0.1s ease-in-out, height 0.1s ease-in-out',
        cursor: 'pointer',
        opacity: isHovered ? 0.8 : 1,
    };

    const divStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100px',
        marginTop: '30px',
        marginBottom: '100px',
    };

    return (
        <div style={divStyle}>
            <img 
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                onMouseLeave={() => {
                    setIsPressed(false);
                    setIsHovered(false);
                }}
                onMouseEnter={() => setIsHovered(true)}
                onClick={addPage} 
                src={plus} 
                style={icoStyle} 
                alt="Small Icon" 
            />
        </div>
    );
};

export default AddPage;
