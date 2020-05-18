import React, { useEffect, useState } from 'react';

const useDebounce = (text, delay) => {
    delay = delay || 300;
    const [debounced, setDebounced] = useState(text);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounced(text);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [text, delay]);

    return debounced;
}

export default useDebounce;