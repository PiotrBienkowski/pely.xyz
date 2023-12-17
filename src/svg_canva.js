import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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

    const handleResize = useCallback(() => {
        clearTimeout(handleResize.debounce);
        handleResize.debounce = setTimeout(() => {
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight);
        }, 200);
    }, []);

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(handleResize.debounce);
            window.removeEventListener('resize', handleResize);
        };
    }, [handleResize]);

    const calculatedHeight = useMemo(() => calcHeight(windowWidth * 0.9), [windowWidth]);
    const calculatedWidth = useMemo(() => calcWidth(windowHeight * 0.9), [windowHeight]);

    useEffect(() => {
        let newHeight, newWidth;

        if (calculatedHeight <= windowHeight * 0.9) {
            newHeight = calculatedHeight;
            newWidth = windowWidth * 0.9;
        } else {
            newHeight = windowHeight * 0.9;
            newWidth = calculatedWidth;
        }

        setSizeHeight(newHeight);
        setSizeWidth(newWidth);
    }, [windowWidth, windowHeight, calculatedHeight, calculatedWidth]);

    useEffect(() => {
        setScale(sizeWidth / 1500);
    }, [sizeWidth]);

    const handleStartDrawing = (pageIndex) => (event) => {
        let { clientX, clientY, touches } = event;
        if (touches) {
            clientX = touches[0].clientX;
            clientY = touches[0].clientY;
        }
        const rect = svgRefs.current[pageIndex].current.getBoundingClientRect();
    
        setIsDrawing(true);
        const page = pages[pageIndex];
        
        page.push({ 
            points: [{ 
                x: (clientX - rect.left) * (1 / scale), 
                y: (clientY - rect.top) * (1 / scale) 
            }], 
            color: currentColor, 
            size: currentSize 
        });
    
        setPages(prevPages => {
            const newPages = [...prevPages];
            newPages[pageIndex] = page;
            return newPages;
        });
        
        setDrawingStartPage(pageIndex);
    };
    

    const handleDrawing = (pageIndex) => (event) => {
        if (pageIndex !== drawingStartPage || !isDrawing) {
            return;
        }
        if (!pages[pageIndex] || pages[pageIndex].length === 0) {
            return;
        }
    
        let { clientX, clientY, touches } = event;
        if (touches) {
            clientX = touches[0].clientX;
            clientY = touches[0].clientY;
        }
        const rect = svgRefs.current[pageIndex].current.getBoundingClientRect();
    
        // Aktualizacja stanu za pomocą funkcji callback
        setPages(prevPages => {
            // Tworzymy kopię strony, na której odbywa się rysowanie
            const updatedPage = [...prevPages[pageIndex]];
    
            // Dodajemy nowy punkt do ostatniej linii na stronie
            const lastLineIndex = updatedPage.length - 1;
            const lastLine = { ...updatedPage[lastLineIndex] };
            lastLine.points.push({
                x: (clientX - rect.left) * (1 / scale), 
                y: (clientY - rect.top) * (1 / scale)
            });
            updatedPage[lastLineIndex] = lastLine;
    
            // Tworzymy nową tablicę stron z zaktualizowaną stroną
            const newPages = [...prevPages];
            newPages[pageIndex] = updatedPage;
    
            return newPages;
        });
    };
    

    const handleStopDrawing = () => {
        setIsDrawing(false);
        setDrawingStartPage(null);
    };
    
    const addPage = () => {
        setPages(prevPages => [...prevPages, []]);
        svgRefs.current = [...svgRefs.current, React.createRef()];
    };
    
    const undoLastLine = useCallback(() => {
        setPages(prevPages => {
            if (prevPages[activePage] && prevPages[activePage].length > 0) {
                const updatedPage = [...prevPages[activePage]];
                updatedPage.pop();
                return [...prevPages.slice(0, activePage), updatedPage, ...prevPages.slice(activePage + 1)];
            }
            return prevPages;
        });
    }, [activePage, pages]); // zależności
    
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
    }, [undoLastLine]); // zależność tylko od undoLastLine    

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
        if (isErasing) {
            setIsErasing(false);
            setCurrentColor(color);
        } else {
            setCurrentColor(color);
        }
    }
    
    const toggleEraser = () => {
        if (!isErasing) {
            setLastColor(currentColor);
            setCurrentColor("transparent");
        } else {
            setCurrentColor(lastColor);
        }
        setIsErasing(!isErasing);
        setIsDrawing(false);
    };

    const handleEraser = useCallback((pageIndex) => (event) => {
        if (!isErasing) return;
    
        let { clientX, clientY, touches } = event;
        if (touches) {
            clientX = touches[0].clientX;
            clientY = touches[0].clientY;
        }
        const rect = svgRefs.current[pageIndex].current.getBoundingClientRect();
        const clickX = (clientX - rect.left) * (1 / scale);
        const clickY = (clientY - rect.top) * (1 / scale);
    
        setPages(prevPages => {
            const updatedPages = [...prevPages];
            updatedPages[pageIndex] = updatedPages[pageIndex].filter(line => {
                for (let i = 0; i < line.points.length - 1; i++) {
                    if (distanceToLineSegment(line.points[i], line.points[i + 1], { x: clickX, y: clickY }) < (10 * currentSize * 0.7) * scale) {
                        return false;
                    }
                }
                return true;
            });
    
            return updatedPages;
        });
    }, [isErasing, scale, currentSize]);
    
    const distanceToLineSegment = useCallback((lineStart, lineEnd, point) => {
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
    }, []);
    
    const handleEraserAction = (pageIndex, event) => {
        handleEraser(pageIndex)(event);
    };    

    const startErasing = useCallback((pageIndex) => (event) => {
        if (!isErasing) return;
        setIsErasingActive(true);
        handleEraserAction(pageIndex, event);
    }, [isErasing, handleEraserAction]);
    
    const continueErasing = useCallback((pageIndex) => (event) => {
        if (!isErasingActive) return;
        handleEraserAction(pageIndex, event);
    }, [isErasingActive, handleEraserAction]);
    
    const stopErasing = useCallback(() => {
        setIsErasingActive(false);
    }, []);

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