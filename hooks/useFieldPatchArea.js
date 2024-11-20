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
            let lastPoint={...points[points.length-1], ordinal: points.length}
            setPoints([...points.slice(0, points.length - 1)])  
            return lastPoint
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
 * Return 0 if a and b are the same within tolerance.
 * Return >0 if b>a.
 * Return <0 if a>b.
 *
 * @param a
 * @param b
 * @param tolerance Defaults to 0.005
 * @returns {number}
 */
const floatCmp = (a, b, tolerance) => {
    if (a < b + (tolerance ?? 0.005) && a > b - (tolerance && 0.005)) {
        return 0
    }
    return a - b
}

/**
 * Return `true` if lines *a1->a2* and *b1->b2* intersect.
 * @param a1 Is an object like `{latitude: number, longitude: number}`
 * @param a2 Same as a1
 * @param b1 Same as a1
 * @param b2 Same as a1
 * @return boolean
 */
const isIntersect = (a1, a2, b1, b2) => {
    const bConstant = (x, y, k) => -k*x + y // y = kx + b <=> -b = kx - y <=> b = -kx + y

    /**
     * Define line segment using two points.
     *
     * `plotFunc` contained in the returned object gives y value on given x value.
     * @param p1 {latitude: number, longitude: number}, latitude being Y-component and longitude X-component.
     * @param p2
     * @returns {{b: number, plotFunc: ((function(*): (*|null))|*), k: number, xMax: number, xMin: number}}
     */
    const defineLineSegment = (p1, p2) => {
        const deltaY = p1.latitude - p2.latitude
        const deltaX = p1.longitude - p2.longitude
        const k = deltaY / deltaX
        const b = bConstant(p1.longitude, p1.latitude, k)
        const [xMin, xMax] = [Math.min(p1.longitude, p2.longitude), Math.max(p1.longitude, p2.longitude)]
        return {
            k, b, xMin, xMax,
            plotFunc: (x) => {
                if (x > xMin && x < xMax) {
                    return k*x + b
                }
                return null
            },
        }
    }

    /**
     * Companion function for defineLineSegment.
     * @param a line segment
     * @param b line segment
     * @returns {boolean}
     */
    const doesIntersect = (a, b) => {
        if (floatCmp(a.k, b.k, 0.0005) !== 0) {
            const x = -(b.b-a.b) / (b.k-a.k)
            if (x > Math.max(a.xMin, b.xMin) && x < Math.min(a.xMax, b.xMax)) {
                return true
            }
        }
        return false
    }

    // Define line segments.
    const seg0 = defineLineSegment(a1, a2)
    const seg1 = defineLineSegment(b1, b2)
    const retVal = doesIntersect(seg0, seg1)
    return retVal
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
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

const distanceBetween = (point1, point2) => {
    const R = 6371e3; // metres
    const phi1 = point1.latitude * Math.PI/180; // φ, λ in radians
    const phi2 = point2.latitude * Math.PI/180;
    const deltaPhi = (point2.latitude-point1.latitude) * Math.PI/180;
    const deltaLambda = (point2.longitude-point1.longitude) * Math.PI/180;

    const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    return d
}

export default useFieldPatchArea
export {
    calculateAreaOfTriangle as __internal_calculateAreaOfTriangle,
    distanceBetween as __internal_distanceBetween,
    isIntersect as __internal_isIntersect,
    areaIsContiguous as __internal_areaIsContiguous,
}