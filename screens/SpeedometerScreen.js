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
const screenDimensions = Dimensions.get('screen');

const textXOffset = 9 * windowDimensions.width/100;
const textYOffsetSpeed = [1,2,3]//6 * windowDimensions.width/100;

const textXOffsetkmh = 10 * windowDimensions.width/100;
const textYOffsetKmh = 30 * windowDimensions.width/100;

const slStyles = slStylesFactory(windowDimensions.width);

const SpeedometerScreen = () => {
    const [planeLocked, setPlaneLocked] = useState(false);
    const slopeAndDirection = useSpiritLevel(planeLocked);
    const speed = 0


    const getRadius = (width, height) => {
        return Math.min(width, height) / 2.7;
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
        const r = getRadius(width, height);
        const xVal = Math.cos(direction) * r;
        const yVal = Math.sin(direction) * r;
        return {x: width / 2 + xVal, y: height / 2 + yVal};
    }

    const adjustTextPosition = (speed) => {
        const adjustX = 5*windowDimensions.width/100;
        const adjustY = 5*windowDimensions.width/100;
        const textPosition = {x: windowDimensions.width / 2 - speed.toString().length*adjustX, y: windowDimensions.width / 2 + adjustY};
        return textPosition

    }

    const {x, y} = getPositionUsingCurrentDirection(windowDimensions.width, windowDimensions.width);
    return (
        <>
            <View style={styles.padding}/>
            <Canvas style={slStyles.canvas}>
                <Group>
                    <Circle  // Rim
                        cx={windowDimensions.width / 2}
                        cy={windowDimensions.width / 2 +20}
                        r={getRadius(windowDimensions.width, windowDimensions.width) + 15}
                        color={colorScheme.accent}
                    />
                    <Circle  // Inner circle
                        cx={windowDimensions.width / 2}
                        cy={windowDimensions.width / 2+20}
                        r={getRadius(windowDimensions.width, windowDimensions.width) - 15}
                        color={colorScheme.innerCircle}
                    />

                    {renderSpeedMarkers(windowDimensions.width)}
                    
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
                    color={colorScheme.text} text={"" + speed} font={fontBig}
                />
                <SkiaText
                        x={windowDimensions.width / 2 - textXOffsetkmh}
                        y={windowDimensions.width / 2 + textYOffsetKmh}
                        text="km/h" font={fontSmall} color={colorScheme.text}
                    />
                     

            </Canvas>
            <View style={styles.padding}/>
            <BottomBar
                text={slopeAndDirection.error ?? slopeAndDirection.useCase}
                isError={slopeAndDirection.error} />
        </>
    );
};

export default SpeedometerScreen;