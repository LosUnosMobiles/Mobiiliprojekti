import { Magnetometer } from "expo-sensors";
import { useState, useEffect } from "react";

/*
* Return `direction` and `offsetNorth` polled from DeviceMotion and Magnetometer. Direction is in degrees, while offsetNorth is in radians.
*
* Error contains possible error message, or `null` if none.
*
* @returns {{alpha, beta, gamma, x, y, z, direction, offsetNorth, error}}
*/

const useCompass = () => {
    const [hasPermission, setHasPermission] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const [error, setError] = useState("Need sensors to be available");
    const [orientation, setOrientation] = useState({
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
            const magnetometerAvailable = await Magnetometer.isAvailableAsync();

            if (magnetometerAvailable) {
                setIsAvailable(true);
                const magnetometerPermission = await Magnetometer.requestPermissionsAsync();
                setHasPermission(magnetometerPermission.status === 'granted');
            } else {
                setIsAvailable(false);
            }
        };
        requestPermissions();
    }, []);

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
        if (orientation.x !== undefined) {
            const { x, y, z } = orientation;

            const heading = Math.atan2(y, x) * (180 / Math.PI);
            const correctedHeading = (heading + 360) % 360;

            console.log("Raw Magnetometer Data:", { x, y, z });
            console.log("Compass Heading (degrees):", correctedHeading.toFixed(2));

            setOrientation((prevOrientation) => ({
                ...prevOrientation,
                direction: correctedHeading.toFixed(2),
                offsetNorth: Math.atan2(y, x).toFixed(2),
                error: null
            }));
        }
    }, [orientation.x, orientation.y, orientation.z]);

    console.log("Current Orientation State:", orientation);
    return orientation;
}

export default useCompass;