import useFieldPatchArea from "../useFieldPatchArea"
import * as mod from "../useFieldPatchArea"
import {renderHook, act} from "@testing-library/react-native";


test("Test pushing and popping points to useFieldPatchArea", () => {
    const {result} = renderHook(() => useFieldPatchArea())
    const [p1, p2, p3, p4] = [
        {
            longitude: 61.495466, latitude: 23.231302
        }, {
            longitude: 61.495809, latitude: 23.238570
        }, {
            longitude: 61.493953, latitude: 23.238601
        }, {
            longitude: 61.494037, latitude: 23.230325
        }
    ]
    act(() => {
        result.current.pushPoint(p1);
        result.current.pushPoint(p2);
        result.current.pushPoint(p3);
        result.current.pushPoint(p4);
    });
    expect(result.current.popPoint()).toEqual({longitude: 61.494037, latitude: 23.230325, ordinal: 4})
    expect(result.current.popPoint()).toEqual({longitude: 61.493953, latitude: 23.238601, ordinal: 3})
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
    console.log(mod.__internal_distanceBetween(p3, p4))
 
    expect(mod.__internal_distanceBetween(p3, p4)).toBeCloseTo (698, 0.);
})