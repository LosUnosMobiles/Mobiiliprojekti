import { DeviceMotion, Magnetometer } from "expo-sensors";
import { useState, useEffect } from "react";

/*
* Return `direction` and `offsetNorth` polled from DeviceMotion and Magnetometer. Direction is in degrees, while offsetNorth is in radians.
*
* Error contains possible error message, or `null` if none.
*
* @returns {{direction: number, offsetNorth: number, error: string}}
*/

const useCompass = () => {
    const [hasPermission, setHasPermission] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const [error, setError] = useState("Need sensors to be available");
    const [orientation, setOrientation] = useState({ 
        alpha: 0,
        beta: 0,
        gamma: 0,
        x: 0,
        y: 0,
        z: 0,
        direction: 0, 
        offsetNorth: 0, 
        error: error 
    });

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
                const { alpha, beta, gamma } = motionData.rotation;
                setOrientation((prevOrientation) => ({ // Update the orientation state
                    ...prevOrientation,
                    alpha,
                    beta,
                    gamma,
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
                setOrientation((prevOrientation) => ({ // Update the orientation state
                    ...prevOrientation,
                    x,
                    y,
                    z,
                    error: null
                }));
            }
        });

        Magnetometer.setUpdateInterval(300); // Set the update interval to 300ms
        return () => {
            magnetometerListener.remove(); // Clean up the listener.
        };
    },[hasPermission, isAvailable]);

    // Calculate the compass heading
    useEffect(() => {
        if (orientation.alpha !== undefined && orientation.x !== undefined) {
            const { alpha, beta, gamma, x, y, z } = orientation;

            // Calculate the tilt compensation
            const cosAlpha = Math.cos(alpha);
            const sinAlpha = Math.sin(alpha);
            const cosBeta = Math.cos(beta);
            const sinBeta = Math.sin(beta);
            const cosGamma = Math.cos(gamma);
            const sinGamma = Math.sin(gamma);

            const Xh = x * cosBeta + y * sinAlpha * sinBeta + z * cosAlpha * sinBeta;
            const Yh = y * cosAlpha - z * sinAlpha;

            const heading = Math.atan2(Yh, Xh) * (180 / Math.PI);
            const correctedHeading = (heading + 360) % 360;

            setOrientation((prevOrientation) => ({
                ...prevOrientation,
                direction: correctedHeading.toFixed(2),
                offsetNorth: Math.atan2(y, x).toFixed(2),
                error: null
            }));
        }
    }, [orientation.alpha, orientation.x, orientation.y, orientation.z]);

    return orientation;
}

export default useCompass;