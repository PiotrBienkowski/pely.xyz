import React, { useState, useRef, useEffect } from 'react';
import ControlBar from './control_bar/control_bar';
import AddPage from './control_bar/add_page';

const SVGCanvas = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [pages, setPages] = useState([[]]);
    const [activePage, setActivePage] = useState(0);
    const [currentColor, setCurrentColor] = useState('black');
    const [lastColor, setLastColor] = useState('black');
    const [currentSize, setCurrentSize] = useState(3);
    const svgRefs = useRef(pages.map(() => React.createRef()));
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [sizeHeight, setSizeHeight] = useState(10);
    const [sizeWidth, setSizeWidth] = useState(10);
    const [drawingStartPage, setDrawingStartPage] = useState(null);
    const [isErasing, setIsErasing] = useState(false);
    const [isErasingActive, setIsErasingActive] = useState(false);
    const [scale, setScale] = useState(0.5);

    const svgStyle = {
        display: 'block',
        margin: 'auto',
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

    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(window.innerHeight);
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (calcHeight(windowWidth * 0.9) <= windowHeight * 0.9) {
            setSizeHeight(calcHeight(windowWidth * 0.9));
            setSizeWidth(windowWidth * 0.9);
        } else {
            setSizeHeight(windowHeight * 0.9);
            setSizeWidth(calcWidth(windowHeight * 0.9));
        }
        setScale(sizeWidth / 1500);
    }, [windowWidth, windowHeight, scale]);

    const handleStartDrawing = (pageIndex) => (event) => {
        let { clientX, clientY, touches } = event;
        if (touches) {
            clientX = touches[0].clientX;
            clientY = touches[0].clientY;
        }
        const rect = svgRefs.current[pageIndex].current.getBoundingClientRect();
        
        setIsDrawing(true);
        const newLines = [...pages[pageIndex], { points: [{ x: (clientX - rect.left) * (1 / scale), y: (clientY - rect.top) * (1 / scale) }], color: currentColor, size: (currentSize) }];
        const newPages = [...pages];
        newPages[pageIndex] = newLines;
        setPages(newPages);
        setDrawingStartPage(pageIndex);
    };

    const handleDrawing = (pageIndex) => (event) => {
        if (pageIndex !== drawingStartPage) {
            return;
        }
        if (!pages[pageIndex] || pages[pageIndex].length === 0) {
            return;
        }
        if (!isDrawing) return;
        let { clientX, clientY, touches } = event;
        if (touches) {
            clientX = touches[0].clientX;
            clientY = touches[0].clientY;
        }
        const rect = svgRefs.current[pageIndex].current.getBoundingClientRect();
        const newPages = [...pages];
        const points = newPages[pageIndex][newPages[pageIndex].length - 1].points;
        points.push({ x: (clientX - rect.left) * (1 / scale), y: (clientY - rect.top) * (1 / scale) });
        newPages[pageIndex][newPages[pageIndex].length - 1].points = points;
        setPages(newPages);
    };

    const handleStopDrawing = () => {
        setIsDrawing(false);
        setDrawingStartPage(null);
    };

    const addPage = () => {
        setPages([...pages, []]);
        svgRefs.current = [...svgRefs.current, React.createRef()];
    };

    const undoLastLine = () => {
        const newPages = [...pages];
        if (newPages[activePage] && newPages[activePage].length > 0) {
            newPages[activePage].pop();
            setPages(newPages);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
                event.preventDefault();
                undoLastLine();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [pages, activePage]);

    function calcWidth(height) {
        return height * (297 / 210);
    }

    function calcHeight(width) {
        return width * (210 / 297);
    }

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
            return '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const funcSetCurrentColor = (color) => {
        if(isErasing) {
            toggleEraser();
        }
        setCurrentColor(color);
    }

    const toggleEraser = () => {
        if (!isErasing) {
            setLastColor(currentColor);
            setCurrentColor("XD");
        } else {
            setCurrentColor(lastColor);
        }
        setIsErasing(!isErasing);
        setIsDrawing(false);
    };

    const handleEraser = (pageIndex) => (event) => {
        if (!isErasing) return;
    
        let { clientX, clientY, touches } = event;
        if (touches) {
            clientX = touches[0].clientX;
            clientY = touches[0].clientY;
        }
        const rect = svgRefs.current[pageIndex].current.getBoundingClientRect();
        const clickX = (clientX - rect.left) / scale; // Dostosowanie do skali
        const clickY = (clientY - rect.top) / scale; // Dostosowanie do skali
    
        const distanceToLineSegment = (lineStart, lineEnd, point) => {
            const A = point.x - lineStart.x;
            const B = point.y - lineStart.y;
            const C = lineEnd.x - lineStart.x;
            const D = lineEnd.y - lineStart.y;
    
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            const param = lenSq !== 0 ? dot / lenSq : -1;
    
            let xx, yy;
    
            if (param < 0) {
                xx = lineStart.x;
                yy = lineStart.y;
            } else if (param > 1) {
                xx = lineEnd.x;
                yy = lineEnd.y;
            } else {
                xx = lineStart.x + param * C;
                yy = lineStart.y + param * D;
            }
    
            const dx = point.x - xx;
            const dy = point.y - yy;
            return Math.sqrt(dx * dx + dy * dy);
        };
    
        const newPages = [...pages];
        newPages[pageIndex] = newPages[pageIndex].filter(line => {
            for (let i = 0; i < line.points.length - 1; i++) {
                if (distanceToLineSegment(line.points[i], line.points[i + 1], { x: clickX, y: clickY }) < (10 * currentSize * 0.7) * scale) {
                    return false;
                }
            }
            return true;
        });
    
        setPages(newPages);
    };
    
    const startErasing = (pageIndex) => (event) => {
        if (!isErasing) return;
        setIsErasingActive(true);
        handleEraser(pageIndex)(event);
    };
    
    const continueErasing = (pageIndex) => (event) => {
        if (!isErasingActive) return;
        handleEraser(pageIndex)(event);
    };
    
    const stopErasing = () => {
        setIsErasingActive(false);
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
            />
            {pages.map((page, pageIndex) => (
                <div key={pageIndex} onClick={() => setActivePage(pageIndex)} style={{ cursor: 'pointer' }}>
                    <svg
                        ref={svgRefs.current[pageIndex]}
                        width={sizeWidth}
                        height={sizeHeight}
                        onMouseDown={isErasing ? startErasing(pageIndex) : handleStartDrawing(pageIndex)}
                        onMouseMove={isErasing ? continueErasing(pageIndex) : handleDrawing(pageIndex)}
                        onMouseUp={isErasing ? stopErasing : handleStopDrawing}
                        onMouseLeave={isErasing ? stopErasing : handleStopDrawing}
                        onTouchStart={isErasing ? startErasing(pageIndex) : handleStartDrawing(pageIndex)}
                        onTouchMove={isErasing ? continueErasing(pageIndex) : handleDrawing(pageIndex)}
                        onTouchEnd={isErasing ? stopErasing : handleStopDrawing}
                        
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
                            />
                        ))}
                    </svg>
                </div>
            ))}
            <AddPage addPage={addPage} />
        </div>
    );
};

export default SVGCanvas;
