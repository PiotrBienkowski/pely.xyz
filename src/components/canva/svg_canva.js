import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ControlBar from '../control_bar/control_bar.js';
import AddPage from '../control_bar/add_page.js';
import { convertSVGToPDF } from '../../utils/svg/SVGtoPDF.js';
import { handleStartDrawing, handleDrawing, handleStopDrawing, useSetColor } from '../../utils/drawing_logic/drawing_logic.js';
import usePreventPageUnload from '../../utils/preventReload/PreventPageUnload.js';
import { usePageSizing } from '../../utils/pageSizing/pageSizing.js';
import { useUndo, useKeyboardUndo } from '../../utils/undo/undoFunctions.js';
import { useEraser } from '../../utils/eraser/useEraser.js';

const SVGCanvas = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [pages, setPages] = useState([[]]);
    const [activePage, setActivePage] = useState(0);
    const [currentColor, setCurrentColor] = useState('black');
    const [lastColor, setLastColor] = useState('black');
    const [currentSize, setCurrentSize] = useState(3);
    const svgRefs = useRef(pages.map(() => React.createRef()));
    const [drawingStartPage, setDrawingStartPage] = useState(null);

    // --- SIZING ---
    const { sizeWidth, sizeHeight, scale, setSizeWidth, setSizeHeight, setScale } = usePageSizing();

    // --- ERASING ---
    const { isErasing, setIsErasing, startErasing, continueErasing, stopErasing, toggleEraser } = useEraser(pages, setPages, scale, currentSize, svgRefs, setLastColor, currentColor, setCurrentColor, lastColor, setIsDrawing);


    // --- DRAWING ---
    const startDrawing = handleStartDrawing(pages, setPages, setIsDrawing, setDrawingStartPage, currentColor, currentSize, scale, svgRefs, setDrawingStartPage); 
    const drawing = handleDrawing(pages, setPages, drawingStartPage, isDrawing, scale, svgRefs);
    const stopDrawing = handleStopDrawing(setIsDrawing, setDrawingStartPage);
    const funcSetCurrentColor = useSetColor(isErasing, setIsErasing, setCurrentColor);

    // --- SVG ---
    const handleConvertToPDF = async () => {
        await convertSVGToPDF(pages, svgRefs, sizeWidth, sizeHeight, scale, setSizeWidth, setSizeHeight, setScale);
    };
    
    // --- PREVENT RELOAD ---
    usePreventPageUnload();

    // --- UNDO ---
    const undoLastLine = useUndo(pages, setPages, activePage);
    useKeyboardUndo(undoLastLine);

    const svgStyle = {
        display: 'block',
        margin: 'auto',
        marginTop: '160px',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        backgroundColor: '#fff',
        maxWidth: '90%',
        maxHeight: '90vh',
        marginTop: '20px',
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none'
    };

    return (
        <div>
            <ControlBar
                currentColor={currentColor}
                currentSize={currentSize}
                setCurrentSize={setCurrentSize}
                isErasing={isErasing}
                toggleEraser={toggleEraser}
                lastColor={lastColor}
                funcSetCurrentColor={funcSetCurrentColor}
                convertSVGToPDF={handleConvertToPDF}
            />
            {pages.map((page, pageIndex) => (
                <div key={pageIndex} onClick={() => setActivePage(pageIndex)} style={{ cursor: 'pointer' }}>
                    <svg
                        ref={svgRefs.current[pageIndex]}
                        width={sizeWidth}
                        height={sizeHeight}
                        onMouseDown={isErasing ? startErasing(pageIndex) : startDrawing(pageIndex)}
                        onMouseMove={isErasing ? continueErasing(pageIndex) : drawing(pageIndex)}
                        onMouseUp={isErasing ? stopErasing : stopDrawing}
                        onMouseLeave={isErasing ? stopErasing : stopDrawing}
                        onTouchStart={isErasing ? startErasing(pageIndex) : startDrawing(pageIndex)}
                        onTouchMove={isErasing ? continueErasing(pageIndex) : drawing(pageIndex)}
                        onTouchEnd={isErasing ? stopErasing : stopDrawing}
                        style={svgStyle}
                        
                    >
                        {page.map((line, lineIndex) => (
                            <polyline
                                key={lineIndex}
                                points={line.points.map(p => `${p.x * scale},${p.y  * scale}`).join(' ')}
                                stroke={line.color}
                                strokeWidth={(line.size * scale)}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        ))}
                    </svg>
                </div>
            ))}
            <AddPage setPages={setPages} svgRefs={svgRefs} />
        </div>
    );
};

export default SVGCanvas;