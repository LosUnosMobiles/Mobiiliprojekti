import {useEffect, useState} from "react";

/**
 * Prior to entering
 *
 * @type {pushPoint} ({longitude, latitude}) => {}
 * @type {popPoint} () => point
 * @type {point} {longitude: number, latitude: number, ordinal: integer}
 * @type {area} {ha: number, sqm: number, numVertices: number}
 * @type {error} string
 * @return {pushPoint, popPoint, area, error}
 */
const useFieldPatchArea = () => {

    const [points, setPoints] = useState([])
    const [area, setArea] = useState(0)

    /**
     * Push a GPS point to the stack.
     *
     * @arg point Is an object like `{longitude: number, latitude: number}`
     */
    const pushPoint = (point) => {
        setPoints([...points, point])
    }

    /**
     * Pop a GPS point from the stack.
     *
     */
    const popPoint = () => {
        if (points.length > 0) {
            return {...points.splice(points.length - 1, 1)[0], ordinal: points.length + 1}
        }
        return null
    }

    /**
     * Re-calculate area when points change.
     */
    useEffect(() => {
        const areaInSqm = calculateArea()
        setArea({
            ha: areaInSqm / 10000,
            sqm: areaInSqm,
            numVertices: points.length
        })
    }, [points]);

    /**
     * Calculate area delimited by the hook's line segments.
     *
     * @returns {number} Is in *m^2*
     */
    const calculateArea = () => {
        if (points.length >= 3 && areaIsContiguous(points)) {
            let copy = [...points]
            const a = points[0]
            let accumulatedArea = 0
            while (copy.length >= 3) {
                const [b, c] = copy.slice(copy.length-2)
                copy.splice(copy.length-1, 1)
                accumulatedArea += calculateAreaOfTriangle(a,b,c)
            }
            return accumulatedArea
        } else if (!areaIsContiguous(points)) {
            throw "Area is not contiguous"
        }
        return 0 // Could not calculate area from too few points or non-contiguous area.
    }

    return {
        pushPoint: pushPoint,
        popPoint: popPoint,
        area: area,
        error: null,
    }
}

/**
 * Calculate area of a triangle defined by three GPS points.
 *
 * @param p1 Is an object like `{longitude: number, latitude: number}`
 * @param p2 Same as p1
 * @param p3 Same as p1
 * @returns {number} Is a value in sqm.
 */
const calculateAreaOfTriangle = (p1, p2, p3) => {
    const d1 = distanceBetween(p1, p2)
    const d2 = distanceBetween(p2, p3)
    const d3 = distanceBetween(p3, p1)
    const s = (d1 + d2 + d3) / 2
    const area = Math.sqrt(s*(s-d1)*(s-d2)*(s-d3))
    return area
}

/**
 * Return `true` if lines *a1->a2* and *b1->b2* intersect.
 * @param a1 Is an object like `{longitude: number, latitude: number}`
 * @param a2 Same as a1
 * @param b1 Same as a1
 * @param b2 Same as a1
 * @return boolean
 */
const isIntersect = (a1, a2, b1, b2) => {
    const ccw = (p1, p2, p3) => {
        return (
            (p3.longitude - p1.latitude) * (p2.longitude - p1.longitude)
            > (p2.longitude - p1.longitude) * (p3.longitude - p1.longitude)
        )
    }
    return ccw(a1, b1, b2) !== ccw(a2, b1, b2) && ccw(a1, a2, b1) !== ccw(a1, b1, b2)
}

/**
 * Check that given area delimited by given GPS points is contiguous.
 *
 * @param area Is an array like `[{latitude: number, longitude: number}, ...]`
 * @returns {boolean}
 */
const areaIsContiguous = (areaPoints) => {
    let copy = [...areaPoints]
    const a = areaPoints[0]
    if (copy.length >= 3) {
        const newestLine = areaPoints.slice(areaPoints.length - 2)
        const [np1, np2] = newestLine

        for (let i = 0; i <= copy.length - 2; i++) {
            const cmpLine = isIntersect(np1, np2, copy[i], copy[i + 1])
            if (cmpLine) {
                return false
            }
        }
    }
    return true
}

/**
 * Calculate distance GPS point1 and GPS point2 and return that in meters.
 *
 * @param point1 Is an object of form `{latitude: number, longitude: number}`
 * @param point2 Is an object of form `{latitude: number, longitude: number}`
 * @returns {number} Meters
 */
const distanceBetween = (point1, point2) => {
    const deltaLatitude = point2.latitude - point1.latitude
    const deltaLongitude = point2.longitude - point1.longitude
    const latitudeCircumference = 40017560 * Math.cos(point1.latitude * Math.PI / 180)

    const dist = Math.sqrt(
        (deltaLatitude * latitudeCircumference / 360)**2
        + (deltaLongitude * 40008000 / 360)**2
    )
    return dist
}


export default useFieldPatchArea
export {
    calculateAreaOfTriangle as __internal_calculateAreaOfTriangle,
    distanceBetween as __internal_distanceBetween,
    isIntersect as __internal_isIntersect,
    areaIsContiguous as __internal_areaIsContiguous,
}