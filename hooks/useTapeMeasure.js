/**
 * Custom hook that measures the device's motion and calculates the relative position
 * from the initial position using the device's accelerometer data.
 *
 * @module useTapeMeasure
 **/

import { useState, useEffect } from 'react';
import { DeviceMotion } from 'expo-sensors';
import * as Permissions from 'expo-permissions';

/**
 * Requests permission to access the device's motion data.
 * Throws an error if the permission is not granted.
 *
 * @async
 * @function requestPermission
 * @throws {Error} If permission to access motion data is denied.
 **/
const requestPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.MOTION);
    if (status !== 'granted') {
        throw new Error('Permission to access motion data was denied');
    }
};

/**
 * Custom hook that uses the device's accelerometer data to measure the relative position
 * from the initial position.
 *
 * @function useTapeMeasure
 * @returns {Object} An object containing the relative position with properties `x`, `y`, and `z`.
 * @property {number} x - The relative position along the x-axis.
 * @property {number} y - The relative position along the y-axis.
 * @property {number} z - The relative position along the z-axis.
 *
 * @example
 * const position = useTapeMeasure();
 * console.log(position); // { x: 0, y: 0, z: 0 }
 **/
const useTapeMeasure = () => {
    const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
    const [initialPosition, setInitialPosition] = useState(null);
    const {distance, setDistance} = useState(0);
    const permission = requestPermission();

    useEffect(() => {

        const subscription = DeviceMotion.addListener((event) => {
            const { accelerationIncludingGravity } = event;
            const { x, y, z } = accelerationIncludingGravity;

            if (initialPosition) {
                setPosition({
                    x: x - initialPosition.x,
                    y: y - initialPosition.y,
                    z: z - initialPosition.z,
                });
                dist = Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2);
                setDistance(dist);
            } else {
                setInitialPosition({ x, y, z });
            }
        });

        return () => {
            subscription && subscription.remove();
        };
    }, [initialPosition]);

    return position, distance, setInitialPosition();
};

export default useTapeMeasure;
