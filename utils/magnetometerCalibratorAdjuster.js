/**
 * Adjust magnetometer maximum and minimum values to approach each other in the middle
 * @param maxX
 * @param minX
 * @param maxY
 * @param minY
 * @param percentage percentage to reduce from both ends of the distance between min and max.
 * @returns {{maxX: *, maxY: *, minX: *, minY: *}}
 */
const magnetometerCalibratorAdjuster = ({maxX, minX, maxY, minY, percentage}) => {
    const defaultPercentage = 0.05
    const p = percentage??defaultPercentage

    const deltaX = maxX - minX
    const deltaY = maxY - minY

    const percentageX = p * deltaX
    const percentageY = p * deltaY

    let newMaxX = maxX
    let newMinX = minX
    let newMaxY = maxY
    let newMinY = minY
    if (deltaX > 2) {
        newMaxX = maxX - percentageX
        newMinX = minX + percentageX
    }
    if (deltaY > 2) {
        newMaxY = maxY - percentageY
        newMinY = minY + percentageY
    }

    return {maxX: newMaxX, minX: newMinX, maxY: newMaxY, minY: newMinY}
}

export default magnetometerCalibratorAdjuster;