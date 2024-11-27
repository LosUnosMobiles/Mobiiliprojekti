import { useEffect, useState, useRef } from 'react';

const useSpeedometerDemo = () => {
    const [speed, setSpeed] = useState(0);
    const timeoutRef = useRef(null); // Add a ref to store the timeout handle

    const adjustSpeed = () => {
        const force = 161
        const airResistance = 1

        setSpeed(prevSpeed => {
            const newSpeed = prevSpeed + (force - airResistance * prevSpeed) / 400;
            if (newSpeed >= 160) {
                clearTimeout(timeoutRef.current);
                return 0;
            }
            return newSpeed;
        });
    };

    const handleButtonClick = () => {
        clearTimeout(timeoutRef.current); // Clear any existing timeout
        adjustSpeed();
        timeoutRef.current = setTimeout(handleButtonClick, 20); // Set a new timeout
    };

    /** 
    useEffect(() => {
        console.log(speed);
    }, [speed]);
    */

    return {
        speed,
        startDemo: handleButtonClick
    };
};

export { useSpeedometerDemo };
