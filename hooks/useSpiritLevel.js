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

    let useCase = "";//floor, wall, frame, ceiling


    // Request permission to use DeviceMotion.
    useEffect(() => {
        const requestPermission = async () => {
            while(!(await DeviceMotion.isAvailableAsync())) {
            }
            setIsAvailable(true)
            const {status} = await DeviceMotion.requestPermissionsAsync();
            setHasPermission(status === 'granted');
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
                //console.log("alpha: ", alpha, "beta: ", beta, "gamma: ", gamma);

                if (Math.abs(beta) < Math.PI/4 && Math.abs(gamma) < Math.PI/4) {
                    useCase="floor";
                    setOrientation({
                        ...orientation, 
                        slope:toDegrees(combine(beta, gamma)).toFixed(2),
                        direction: toDirection(beta, gamma),
                        error:"floor" 
                    });
                    console.log(alpha, beta, gamma);
                } 
                else if (Math.abs(gamma) > 3*Math.PI/4 && Math.abs(beta) < Math.PI/4) {
                    useCase="roof";
                    if (gamma > Math.PI/2) { let gamma2 = Math.PI - gamma; }
                    setOrientation({
                        ...orientation, 
                        slope:toDegrees(Math.abs(combine(beta, gamma)-Math.PI)).toFixed(2),
                        direction: toDirection(beta, gamma),
                        error:"r0f" 
                         
                    });
                    console.log(alpha, beta, gamma);

                } 
                else if (Math.abs(beta) < Math.PI/4 && Math.abs(gamma) < 3*Math.PI/4) {
                    useCase="frame";
                    setOrientation({
                        ...orientation, 
                        slope:toDegrees(combine(beta, gamma)).toFixed(2),
                        direction: toDirection(beta, gamma),
                        error:"frame"  
                    });

                }
                else if (Math.abs(beta) > Math.PI/4 ) {
                    useCase="wall";
                    setOrientation({
                        ...orientation, 
                        slope:toDegrees(combine(beta,0)).toFixed(2),
                        direction: toDirection(beta, 0),
                        error:"wall"  
                    });
                }
                else {
                    useCase="unknown";
                    setOrientation({
                        ...orientation, 
                        slope:toDegrees(combine(beta, gamma)).toFixed(2),
                        direction: toDirection(beta, gamma),
                        error:"floor"  
                    });
                }

                //console.log("useCase", useCase);



            }
            
        });

            DeviceMotion.setUpdateInterval(2000); // Set the update interval to 200ms
            if (!isAvailable) {
                setError("laite ei saatavilla")
            } else if (!hasPermission) {
                setError("puuttuvia oikeuksia")
            } else {
                setError(useCase)
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