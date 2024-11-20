import useFieldPatchArea from "../useFieldPatchArea"
import * as mod from "../useFieldPatchArea"
import {renderHook, act} from "@testing-library/react-native";

describe("useFieldPatchArea", () => {
    test("Test pushing and popping points to useFieldPatchArea", async () => {
        const {result} = renderHook(() => useFieldPatchArea())
        const [p1, p2, p3, p4] = [
            {
                longitude: 25.1, latitude:  65.1
            }, {
                longitude: 25.2 , latitude: 65.2
            }, {
                longitude: 25.3, latitude:  65.3
            }, {
                longitude: 25.4, latitude: 65.4
            }
        ]
        act(() => result.current.pushPoint(p1))
        act(() =>    result.current.pushPoint(p2))
        act(() =>   result.current.pushPoint(p3))
        act(() =>    result.current.pushPoint(p4))

        act(() => expect(result.current.popPoint()).toEqual({longitude: 25.4, latitude: 65.4, ordinal: 4}))
        act(() => expect(result.current.popPoint()).toEqual({longitude: 25.3, latitude:  65.3, ordinal: 3}))
        act(() => expect(result.current.popPoint()).toEqual({longitude: 25.2, latitude:  65.2, ordinal: 2}))
        act(() => expect(result.current.popPoint()).toEqual({longitude: 25.1, latitude:  65.1, ordinal: 1}))

    });


    test("Test distanceBetween() inside the hook", () => {
        const [p1, p2, p3, p4] = [
            {
                longitude: 23.231302, latitude:  61.495466
            }, {
                longitude: 23.238570 , latitude: 61.495809
            }, {
                longitude: 25.417929700451506, latitude:  65.06344439716655
            }, {
                longitude: 25.430291262192128, latitude: 65.0669438971005
            }
        ]

        expect(mod.__internal_distanceBetween(p3, p4)).toBeCloseTo (697, 0.);
    })

    test("Test isIntersect()", () => {
        const [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12] = [
            {latitude:61.481094434555665, longitude:23.495311370637737}, // l1
            {latitude:61.48189587371329, longitude:23.497395796547806},

            {latitude:61.48096408865421, longitude:23.497606083763515}, // l2, **l1 and l2 should intersect**
            {latitude:61.482200092117274, longitude:23.4948504390831},

            {latitude:61.482200092117274, longitude:23.4948504390831}, // l3, **l1 and l3 should not intersect**
            {latitude:61.47969452699654, longitude:23.494732574090232},//     **l2 and l3 should not intersect**

            {latitude:61.480661940226476, longitude:23.497039359096625}, // l4
            {latitude:61.48212713346468, longitude:23.494558224718293},

            {latitude: -1, longitude: 1}, // l5
            {latitude: 1, longitude: -1},

            {latitude: -1, longitude: -1}, // l6
            {latitude: 1, longitude: 1},

        ]
        const [l1, l2, l3, l4, l5, l6] =(
            [[p1,p2],[p3,p4],[p5,p6], [p7,p8], [p9,p10], [p11,p12]]
        )

        // l1 and l2 should not intersect
        expect(mod.__internal_isIntersect(l1[0], l1[1], l2[0], l2[1])).toBe(true)

        // l1 and l3 should not intersect
        expect(mod.__internal_isIntersect(l1[0], l1[1], l3[0], l3[1])).toBe(false)

        // l2 and l3 should not intersect
        expect(mod.__internal_isIntersect(l2[0], l2[1], l3[0], l3[1])).toBe(false)

       // l1 and l4 should intersect
        expect(mod.__internal_isIntersect(l5[0], l5[1], l6[0], l6[1])).toBe(true)
    })
    
    test("Test calculateLocalEarthRadius() inside the hook", () => {
        const latitude = 65.1

        expect(mod.__internal_calculateLocalEarthRadius(latitude)).toBeCloseTo (6360569,0);
    })
})