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

        expect(mod.__internal_distanceBetween(p3, p4)).toBeCloseTo (698, 0.);
    })
})