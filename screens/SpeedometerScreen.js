import {View, Text, StyleSheet, Dimensions, Platform} from 'react-native';
import React, {useMemo, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import colorScheme from "../styles/colorScheme";
import {
    Skia,
    Canvas,
    Circle,
    Group,
    Text as SkiaText,
    matchFont,
    vec,
    TextPath,
    Fill,
    Path
} from "@shopify/react-native-skia";
import {useTheme} from "react-native-paper"
import useSpiritLevel from "../hooks/useSpiritLevel";
import styles from "../styles/styles";
import slStylesFactory from "../styles/spiritLevelStyles"
import BottomBar from "../components/BottomBar";
import renderSpeedMarkers from '../utils/renderSpeedMarkers';   
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const fontFamily = Platform.select({ios: "Helvetica", default: "sans-serif"});
const fontStyle = {
    fontFamily,
    fontSize: 60,
    fontStyle: "normal",
    fontWeight: "normal",
};
const fontBig = matchFont(fontStyle);
const fontSmall = matchFont({...fontStyle, fontSize: 30});

const windowDimensions = Dimensions.get('window');

const textXOffset = 9 * windowDimensions.width/100;
const textYOffsetSpeed = 1//6 * windowDimensions.width/100;

const textXOffsetkmh = 10 * windowDimensions.width/100;
const textYOffsetKmh = 30 * windowDimensions.width/100;

const slStyles = slStylesFactory(windowDimensions.width);

const SpeedometerScreen = () => {
    const [planeLocked, setPlaneLocked] = useState(false);
    const slopeAndDirection = useSpiritLevel(planeLocked);
    const speed = 0

    /**
     * Setting the centerpoint of circles to the middle of the screen.
     * @returns 
     */
    const getOrigo = () => {   
        return {x: windowDimensions.width/2 - 3*windowDimensions.width/100 / 2, y: windowDimensions.width/2 + 5*windowDimensions.width/100};
    }
    const getRadius = () => {
        return windowDimensions.width / 3;
    }

    const adjustTextPosition = (speed) => {
        const adjustX = 19*windowDimensions.width/400;
        const adjustY = 6*windowDimensions.width/100;
        const textPosition = {x: getOrigo().x - speed.toString().length*adjustX, y: getOrigo().y + adjustY};
        return textPosition

    }



    const path = Skia.Path.Make();
    path.moveTo(windowDimensions.width / 2 - textYOffsetSpeed, windowDimensions.width / 2 - textXOffset);
    path.lineTo(windowDimensions.width / 2 - textYOffsetSpeed, windowDimensions.width / 2 - textXOffset + 300);

    /**
     * Calculate small indicator circle coordinates from direction given by useSpiritLevel-hook.
     * @param width width of the canvas
     * @param height height of the canvas
     * @returns {{x: number, y: number}}
     */
    const getPositionUsingCurrentDirection = (width, height) => {

        const direction = speed/160*Math.PI - Math.PI ;
        const r = getRadius();
        const xVal = getOrigo().x + Math.cos(direction) * r;
        const yVal = getOrigo().y + Math.sin(direction) * r;
        return {x: xVal, y: yVal};
    }



    const {x, y} = getPositionUsingCurrentDirection(windowDimensions.width, windowDimensions.width);
    
    return (
        <>
            <View style={styles.padding}/>
            <Canvas style={slStyles.canvas}>
                <Group>
                    <Circle  // Rim
                        cx={getOrigo().x}
                        cy={getOrigo().y}
                        r={getRadius(windowDimensions.width, windowDimensions.width) + 15}
                        color={colorScheme.accent}
                    />
                    <Circle  // Inner circle
                        cx={getOrigo().x}
                        cy={getOrigo().y}
                        r={getRadius(windowDimensions.width, windowDimensions.width) - 15}
                        color={colorScheme.innerCircle}
                    />

                    {renderSpeedMarkers (getOrigo(),getRadius())}
                    
                    <Circle // Indicator circle
                        cx={x}
                        cy={y}
                        r={windowDimensions.width / 20}
                        color={colorScheme.primary}
                    />
                </Group>
                <SkiaText
                    x={adjustTextPosition(speed).x}
                    y={adjustTextPosition(speed).y}
                    color={colorScheme.text} text={speed.toString()} font={fontBig}
                />
                <SkiaText
                        x={windowDimensions.width / 2 - textXOffsetkmh}
                        y={windowDimensions.width / 2 + textYOffsetKmh}
                        text="km/h" font={fontSmall} color={colorScheme.text}
                    />

            </Canvas>
            <View style={styles.padding}/>
            <BottomBar
                text={slopeAndDirection.error ?? " "}
                isError={slopeAndDirection.error} />
        </>
    );
};

export default SpeedometerScreen;