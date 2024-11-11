import { DeviceMotion, Magnetometer } from "expo-sensors";
import { useState, useEffect } from "react";


const useCompass = () => {
    const [hasPermission, setHasPermission] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const [error, setError] = useState("Need sensors to be available");
    const [orientation, setOrientation] = useState({ direction: 0, offsetNorth: 0, error: error });

    // Request permission to use DeviceMotion and Magnetometer.
    useEffect(() => {
        const requestPermissions = async () => {
            const deviceMotionAvailable = await DeviceMotion.isAvailableAsync();
            const magnetometerAvailable = await Magnetometer.isAvailableAsync();

            if (deviceMotionAvailable && magnetometerAvailable) {
                setIsAvailable(true);
                const deviceMotionPermission = await DeviceMotion.requestPermissionsAsync();
                const magnetometerPermission = await Magnetometer.requestPermissionsAsync();
                setHasPermission(deviceMotionPermission.status === 'granted' && magnetometerPermission.status === 'granted');
            } else {
                setIsAvailable(false);
            }
        };
        requestPermissions();
    }, []);   

    // Subscribe to DeviceMotion.
    useEffect(() => {
        if (!hasPermission || !isAvailable) { // Guard clause and error messages for missing permissions or device not available
            if (!isAvailable) {
                setError("Device not available")
            } else {
                setError("Missing permissions")
            }
            return;
        }
        const deviceMotionListener = DeviceMotion.addListener((motionData) => {
            if (motionData.rotation) { // Added check for motionData.rotation
                const { alpha } = motionData.rotation;
                setOrientation((prevOrientation) => ({ // Update the orientation state
                    ...prevOrientation,
                    direction: alpha.toFixed(2),
                    error: null
                }));
            }

        });

        DeviceMotion.setUpdateInterval(300); // Set the update interval to 300ms
        return () => {
            deviceMotionListener.remove(); // Clean up the listener.
        };
    },[hasPermission, isAvailable]);

    // Subscribe to Magnetometer.
    useEffect(() => {
        if (!hasPermission || !isAvailable) { // Guard clause and error messages for missing permissions or device not available
            if (!isAvailable) {
                setError("Device not available")
            } else {
                setError("Missing permissions")
            }
            return;
        }
        const magnetometerListener = Magnetometer.addListener((magnetometerData) => {
            if (magnetometerData) {
                const { x, y, z } = magnetometerData;
                const offsetNorth = Math.atan2(y, x);
                setOrientation((prevOrientation) => ({ // Update the orientation state
                    ...prevOrientation,
                    offsetNorth: offsetNorth.toFixed(2),
                    error: null
                }));
            }
        });

        Magnetometer.setUpdateInterval(300); // Set the update interval to 300ms
        return () => {
            magnetometerListener.remove(); // Clean up the listener.
        };
    },[hasPermission, isAvailable]);
    return orientation;
}

export default useCompass;