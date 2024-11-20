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
        if (points.length >= 3 && addingSegmentKeepsAreaContiguous(points)) {
            let copy = [...points]
            const a = points[0]
            let accumulatedArea = 0
            while (copy.length >= 3) {
                const [b, c] = copy.slice(copy.length-2)
                copy.splice(copy.length-1, 1)
                accumulatedArea += calculateAreaOfTriangle(a,b,c)
            }
            return accumulatedArea
        } else if (!addingSegmentKeepsAreaContiguous(points)) {
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
 * Line segments intersect.
 *
 * See defineLineSegment() to see how to get one of those.
 *
 * @param a line segment
 * @param b line segment
 * @returns {boolean}
 */
const segmentsIntersect = (a, b) => {
    if (floatCmp(a.k, b.k, 0.0005) !== 0) {
        const x = -(b.b-a.b) / (b.k-a.k)
        if (x > Math.max(a.xMin, b.xMin) && x < Math.min(a.xMax, b.xMax)) {
            return true
        }
    }
    return false
}


/**
 * Return `true` if lines from **points** *a1->a2* and *b1->b2* intersect.
 *
 * @param a1 Is an object like `{latitude: number, longitude: number}`
 * @param a2 Same as a1
 * @param b1 Same as a1
 * @param b2 Same as a1
 * @return boolean
 */
const isIntersect = (a1, a2, b1, b2) => {
    // Define line segments.
    const seg0 = defineLineSegment(a1, a2)
    const seg1 = defineLineSegment(b1, b2)
    const retVal = segmentsIntersect(seg0, seg1)
    return retVal
}

/**
 * Define constant `b` for a line going through point `x` and `y`, and having slope `k`
 * @param x
 * @param y
 * @param k
 * @returns {*}
 */
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
 * Check that newest line segment doesn't intersect with other area line segments.
 *
 * @param area Is an array like `[{latitude: number, longitude: number}, ...]`
 * @returns {boolean}
 */
const addingSegmentKeepsAreaContiguous = (areaPoints) => {
    let copy = [...areaPoints]

    if (copy.length >= 3) {
        const newestLine = areaPoints.slice(areaPoints.length - 2)
        const [np1, np2] = newestLine

        for (let i = 0; i < copy.length - 3; i++) {
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
    const R = calculateLocalEarthRadius(point1.latitude) //about 6360000 metres
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

/**
 * Calculate local Earth radius at given latitude.  
 * @param latitude
 * @returns {number} in meters
 */
const calculateLocalEarthRadius = (latitude) => {
    const radiusEquator = 6378137.0 //  is the radius of Earth at the equator, approximately 6378137 m
    const radiusPolar = 6356752.3 // is the radius of Earth at the pole, approximately 6356752 m
    const phi = degreesToRadians(latitude) //latitude in degrees
    const numerator = (radiusEquator**2 * Math.cos(phi))**2 + (radiusPolar**2 * Math.sin(phi))**2
    const denominator = (radiusEquator * Math.cos(phi))**2 + (radiusPolar * Math.sin(phi))**2
    const localEarthRadius = Math.sqrt(numerator / denominator)
    return localEarthRadius //return localEarthRadius //6360000
}

/**
 * Return whether a triangle is inside of given area.
 *
 * **NOTE!!** Assumes area and triangle integrity and contiguity.
 *
 * @param trianglePoints
 * @param areaPoints
 * @returns {boolean} True if inside, false if outside.
 */
const triangleIsInsideArea = (trianglePoints, areaPoints) => {
    // Calculate triangle mean point
    const meanPoint = trianglePoints
        .map(point => ({
            latitude: point.latitude / trianglePoints.length,
            longitude: point.longitude / trianglePoints.length
        }))
        .reduce((acc, point) => ({
                latitude: acc.latitude + point.latitude,
                longitude: acc.longitude + point.longitude
        }), {latitude: 0, longitude: 0})

    // Draw containing rectangle aka. container.
    const container = generateContainer(areaPoints)

    // Define line segment right from mean point along the latitude axis.
    const ray = defineLineSegment(
        meanPoint,
        {...meanPoint, longitude: container[container.length - 1].longitude},
    )

    // Count intersecting area lines.
    let segments = []
    for (let i = 0; i < container.length; i++) {
        segments.push(
            defineLineSegment(areaPoints[i - 1], areaPoints[i])
        )
    }
    return segments.filter((a) => segmentsIntersect(ray, a)).length % 2 === 1
}

/**
 * Define a containing rectangle around specified area.
 *
 * @param areaPoints {[{latitude, longitude}]} List of points defining the area to be contained.
 * @returns {[{latitude, longitude}, {latitude, longitude}, {latitude, longitude}, {latitude, longitude}]}
 */
const generateContainer = (areaPoints) => {
    let minX = null
    let minY = null
    let maxX = null
    let maxY = null
    areaPoints.forEach((p) => {
        minX = minX ?? p.latitude <= p.latitude ? minX ?? p.latitude : p.latitude
        minY = minY ?? p.longitude <= p.longitude ? minY ?? p.longitude : p.longitude
        maxX = maxX ?? p.latitude >= p.latitude ? maxX ?? p.latitude : p.latitude
        maxY = maxY ?? p.longitude >= p.longitude ? maxY ?? p.longitude : p.longitude
    })
    const topLeft = {latitude: maxY, longitude: minX}
    const bottomLeft = {latitude: minY, longitude: minX}
    const bottomRight = {latitude: minY, longitude: maxX}
    const topRight = {latitude: maxY, longitude: maxX}
    return [topLeft, bottomLeft, bottomRight, topRight]
}


export default useFieldPatchArea
export {
    calculateAreaOfTriangle as __internal_calculateAreaOfTriangle,
    distanceBetween as __internal_distanceBetween,
    isIntersect as __internal_isIntersect,
    addingSegmentKeepsAreaContiguous as __internal_areaIsContiguous,
    calculateLocalEarthRadius as __internal_calculateLocalEarthRadius,
}