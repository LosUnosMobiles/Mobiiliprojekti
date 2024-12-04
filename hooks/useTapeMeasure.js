/**
 * @typedef {Object} TapeMeasure
 * @property {Function} start - Start the measurement
 * @property {Function} stop - Stop the measurement
 * @property {Function} reset - Reset the distance
 * @property {number} distance - The distance measured
 * @property {string} error - The error message
 * @property {string} permission - The permission status
 * @property {Object} initialPosition - The initial position
 * @property {Object} position - The current position with timestamp
 * @property {Object} acceleration - The acceleration data
 * @property {Function} calculateDistance - Calculate the distance
 * @property {Function} subscribe - Subscribe to the device motion
 * @property {Function} unsubscribe - Unsubscribe from the device motion
 * 
 * The useTapeMeasure hook returns an object with the following properties and methods:
 * @returns {
* start: Function,
* stop: Function,
* reset: Function,
* calculateDistance: Function,
* distance: number,
* initialPosition: Object,
* position: Object,
* acceleration: Object,
* permission: string,
* error: string }
* 
* The useTapeMeasure hook uses the DeviceMotion API to measure the device's motion and calculate the relative position
* from the initial position using the device's accelerometer data. It provides methods to start, stop, and reset the measurement,
* as well as calculate the distance between the initial and current positions.
*/


import { useState, useEffect } from 'react';
import { DeviceMotion } from 'expo-sensors';

const useTapeMeasure = () => {
  const [initialPosition, setInitialPosition] = useState({ timestamp: 0 });
  const [position, setPosition] = useState({ timestamp: 0, x: 0, y: 0, z: 0 });
  const [acceleration, setAcceleration] = useState({ timestamp: 0, x: 0, y: 0, z: 0 });
  const [permission, setPermission] = useState(null);
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const subscribe = async () => {
      try {
        const { status } = await DeviceMotion.requestPermissionsAsync();
        setPermission(status === 'granted');

        if (status === 'granted') {
          DeviceMotion.setUpdateInterval(200); // don't go below 200ms
          DeviceMotion.addListener((data) => {
            setAcceleration(data.acceleration);
          });
        } else {
          setError('Permission denied');
        }
      } catch (err) {
        setError('Error requesting permissions');
      }
    };

    subscribe();

    return () => {
      DeviceMotion.removeAllListeners();
    };
  }, []);

  // Function to start the measurement
  const start = () => {
    setInitialPosition({ timestamp: acceleration.timestamp });
    setPosition({ timestamp: acceleration.timestamp, x: 0, y: 0, z: 0 });
  };

  // Function to stop the measurement, calculate the distance, and reset
  const stop = () => {
    calculateDistance();
    setPosition({ timestamp: 0, x: 0, y: 0, z: 0 });
  };

  // Function to reset the distance and initial position
  const reset = () => {
    setDistance(0);
    setInitialPosition(0);
  };

  // Function to calculate the position using acceleration data
  // Formula: position = initialPosition + 0.5 * acceleration * time^2
  const calculatePosition = () => {
    const time = (acceleration.timestamp - position.timestamp) / 1000; // convert ms to s
    const x = position.x + 0.5 * acceleration.x * time ** 2;
    const y = position.y + 0.5 * acceleration.y * time ** 2;
    const z = position.z + 0.5 * acceleration.z * time ** 2;
    setPosition({ timestamp: acceleration.timestamp, x, y, z });
    };

  // Function to calculate the distance from the initial position to the current position using acceleration data.
  // Formula: distance = 0.5 * acceleration * time^2
  const calculateDistance = () => {
    setDistance(Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2));
  };

  // Calculate the position when the acceleration changes
  useEffect(() => {
    if (initialPosition.timestamp > 0) {
      calculatePosition();
    }
  }, [acceleration]);

  return { start, stop, reset, calculateDistance, distance, acceleration, initialPosition, position, error, permission };
};

export default useTapeMeasure;
