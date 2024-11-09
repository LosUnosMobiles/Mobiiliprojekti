import {useState, useEffect} from 'react';
import {DeviceMotion} from 'expo-sensors';

/**
 * Return `slope` and `direction` polled from DeviceMotion. Slope is in degrees, while direction is in radians.
 *
 * Error contains possible error message, or `null` if none.
 *
 * @returns {{slope: number, direction: number, error: string}}
 */

const useSpiritLevel = () => {
    const [hasPermission, setHasPermission] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const [error, setError] = useState("Need sensors to be available");
    const [orientation, setOrientation] = useState({slope: 0, direction: 0, error: error});


    // Request permission to use DeviceMotion.
    useEffect(() => {
        const requestPermission = async () => {
            while(!(await DeviceMotion.isAvailableAsync())) {
            }
            setIsAvailable(true)
            const {status} = await DeviceMotion.requestPermissionsAsync();
            setHasPermission(status === 'granted');
            console.log("status", status);
            console.log("isAvailable", isAvailable);
        };
        requestPermission();
    }, []);

    // Subscribe to DeviceMotion.
    useEffect(() => {
        if (!hasPermission || !isAvailable) {
            return;
        }
        const listener = DeviceMotion.addListener((motionData) => {
            if (motionData.rotation) { // Added check for motionData.rotation
                const {alpha, beta, gamma} = motionData.rotation;
                setOrientation({
                    slope: toDegrees(combine(beta, gamma)).toFixed(2),
                    direction: toDirection(beta, gamma), 
                    status: hasPermission
                });
            }
            
        });

            DeviceMotion.setUpdateInterval(300); // Set the update interval to 200ms
            if (!isAvailable) {
                setError("laite ei saatavilla")
            } else if (!hasPermission) {
                setError("puuttuvia oikeuksia")
            } else {
                setError(null)
            }
        return () => {
            listener.remove(); // Clean up the listener.
        };
    }, [hasPermission, isAvailable]);

    return orientation;
};

const toDegrees = (radians) => (radians * 180) / Math.PI;
const combine = (a, b) => Math.sqrt(a ** 2 + b ** 2).toFixed(2);
const toDirection = (a, b) => Math.atan2(a, b);

export default useSpiritLevel;