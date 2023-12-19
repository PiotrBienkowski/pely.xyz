import { useCallback, useEffect } from 'react';

export const useUndo = (pages, setPages, activePage) => {
    const undoLastLine = useCallback(() => {
        setPages(prevPages => {
            if (prevPages[activePage] && prevPages[activePage].length > 0) {
                const updatedPage = [...prevPages[activePage]];
                updatedPage.pop();
                return [...prevPages.slice(0, activePage), updatedPage, ...prevPages.slice(activePage + 1)];
            }
            return prevPages;
        });
    }, [activePage, pages, setPages]);

    return undoLastLine;
};

export const useKeyboardUndo = (undoLastLine) => {
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
    }, [undoLastLine]);
};
