export const handleDrawing = (pages, setPages, drawingStartPage, isDrawing, scale, svgRefs) => (pageIndex) => (event) => {
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

    setPages(prevPages => {
        const updatedPage = [...prevPages[pageIndex]];
        const lastLineIndex = updatedPage.length - 1;
        const lastLine = { ...updatedPage[lastLineIndex] };
        lastLine.points.push({
            x: (clientX - rect.left) * (1 / scale), 
            y: (clientY - rect.top) * (1 / scale)
        });
        updatedPage[lastLineIndex] = lastLine;
        const newPages = [...prevPages];
        newPages[pageIndex] = updatedPage;

        return newPages;
    });
};

export const handleStartDrawing = (pages, setPages, setIsDrawing, setCurrentPage, currentColor, currentSize, scale, svgRefs, setDrawingStartPage) => (pageIndex) => (event) => {
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

export const handleStopDrawing = (setIsDrawing, setDrawingStartPage) => () => {
    setIsDrawing(false);
    setDrawingStartPage(null);
};

export const useSetColor = (isErasing, setIsErasing, setCurrentColor) => {
    return (color) => {
        if (isErasing) {
            setIsErasing(false);
        }
        setCurrentColor(color);
    };
};
