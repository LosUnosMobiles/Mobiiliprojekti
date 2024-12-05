
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useReducer, useState} from "react";

const _storeData = async (value) => {
    try {
        await AsyncStorage.setItem('magnetometerCalibrationRawData', value);
    } catch (e) {
        throw e
    }
}

/**
 * Store min and max values for raw sensory `x`, `y` and `z`.
 * @param x
 * @param y
 * @param z
 * @returns {Promise<void>}
 */
const storeMagnetometerCalibrationData = async ({x, y, z}) => {
    const {xMax, yMax, zMax, xMin, yMin, zMin} = await getMinMaxMagnetometerData()
    await _storeData({
        xMax: Math.max(xMax, x),
        xMin: Math.min(xMin, x),
        yMax: Math.max(yMax, y),
        yMin: Math.max(yMin, y),
        zMax: Math.max(zMax, z),
        zMin: Math.max(zMin, z),
    })
}

/**
 * Returned object has keys {`xMax`, `xMin`, `yMax`, `yMin`, `zMax`, `zMin`}.
 *
 * @returns {Promise<object|null>}
 */
const getMinMaxMagnetometerData = async () => {
    try {
        const value = await AsyncStorage.getItem('magnetometerCalibrationRawData');
        return value ? JSON.parse(value) : null
    } catch (e) {
        console.log(e)
        throw e
    }
}

/**
 * Calculate average between `a` and `b`.
 * @param a
 * @param b
 * @returns {number}
 */
const calculateAverage = (a, b) => {
    return (a + b) / 2
}

/**
 * Shift `min`, `max` and `val` towards 0 by average of `min` and `max`.
 * @param min Minimum value `val` has taken in history.
 * @param max Maximum value `val` has taken in history.
 * @param val Comes along for the shifting ride. If omitted, `val` of the returned object will be 0. **[optional]**
 * @returns {{val: number, min: number, max: number}}
 */
const shift = (min, max, val) => {
    const avg = calculateAverage(min, max)
    const shiftedMin = min - avg
    const shiftedMax = max - avg
    return {min: shiftedMin, max: shiftedMax, val: val??avg - avg}
}

/**
 * Scale `val` to [-1, 1] assuming it can take pre-scaled values from `min` to `max`.
 * @param min Minimum value `val` has taken in the past.
 * @param max Maximum value `val` has taken in the past.
 * @param val Value to be scaled
 * @returns {number}
 */
const scale = (min, max, val) => {
    const currentScale = max-min  // Scale to [-1, 1]
    return val / currentScale
}

const useMagnetometerCalibrator = ({xTesla, yTesla, zTesla}) => {

    const [calibratedData, dispatch] = useReducer((state, action) => { // Action contains type and params
            switch (action.type) {
                case "updateLocalStorage":
                    storeMagnetometerCalibrationData({x: action.params.x, y: action.params.y, z: action.params.z})
                        .catch(e => {
                            console.error(e)
                            throw e
                        })
                    // Intentional fallthrough!
                case "update":  // calibrate
                    const [minX, maxX] = [
                        Math.min(action.params.x, state.xMin),
                        Math.max(action.params.x, state.xMax)
                    ]
                    const [minY, maxY] = [
                        Math.min(action.params.y, state.yMin),
                        Math.max(action.params.y, state.yMax)
                    ]
                    const [minZ, maxZ] = [
                        Math.min(action.params.z, state.zMin),
                        Math.max(action.params.z, state.zMax)
                    ]
                    const shiftedX = shift(minX, maxX, action.params.x)
                    const shiftedY = shift(minY, maxY, action.params.y)
                    const shiftedZ = shift(minZ, maxZ, action.params.z)
                    const scaledX = scale(minX, maxX, shiftedX.val)
                    const scaledY = scale(maxY, maxY, shiftedY.val)
                    const scaledZ = scale(maxZ, maxZ, shiftedZ.val)
                    const calibrated = {
                        x: scaledX, y: scaledY, z: scaledZ,  // Calibrated for export
                        xMin: minX, xMax: maxX,  // Updated for future calibrations
                        yMin: minY, yMax: maxY,
                        zMin: minZ, zMax: maxZ
                    }
                    return calibrated
                default:
                    throw `Unknown axis as action: ${action}`;
            }
        }, {
            x: xTesla, y: yTesla, z: zTesla, // Exported
            xMin:0, yMin:0, zMin:0, // Not exported
            xMax:0, yMax:0, zMax:0, // Not exported
        }, (a) => {
        getMinMaxMagnetometerData() // Palauttaa LocalStoragesta tallennetut kalibraatiotiedot.
            .catch(e => throw e)
            .then(v => {
                dispatch({type: "update", params: v??e})
            })
    }) // TODO: Write initial state function

    const [teslas, setTeslas] = useState({x: xTesla, y: yTesla, z: zTesla})
    const [teslasUpdatedSwitch, setTeslasUpdatedSwitch] = useState(false)
    const [updateLocalStorageCounter, setUpdateLocalStorageCounter] = useState(1)

    useEffect(() => {
        if (updateLocalStorageCounter % 50 === 0)
            dispatch({type: "updateLocalStorage", params: teslas})
        dispatch({type: "update", params: teslas})
    }, [teslasUpdatedSwitch]);

    useEffect(() => {
        setTeslas({x: xTesla, y: yTesla, z: zTesla})
    }, [updateLocalStorageCounter])

    const minMaxChanged = (x, y, z) => {
        return x < calibratedData.xMin || x > calibratedData.xMax ||
            y < calibratedData.yMin || y > calibratedData.yMax ||
            z < calibratedData.zMin || z > calibratedData.zMax
    }
    
    if (minMaxChanged(xTesla, yTesla, zTesla)) {
        setTeslasUpdatedSwitch(!teslasUpdatedSwitch)
    }

    return calibratedData
}

export default useMagnetometerCalibrator;