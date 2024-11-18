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
    act(() => result.current.pushPoint(p1))
    act(() => result.current.pushPoint(p2))
    act(() => result.current.pushPoint(p3))
    act(() => result.current.pushPoint(p4))
    expect(result.current.popPoint()).toEqual({longitude: 61.494037, latitude: 23.230325, ordinal: 4})
    expect(result.current.popPoint()).toEqual({longitude: 61.493953, latitude: 23.238601, ordinal: 3})
});


test("Test distanceBetween() inside the hook", () => {
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
    console.log(mod.__internal_distanceBetween(p1, p2))

})