import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import colorScheme from "../styles/colorScheme";
import { Canvas, Circle, Group, Text as SkiaText, matchFont, Line } from "@shopify/react-native-skia";
import { Button, Icon, useTheme } from "react-native-paper";
import * as Location from 'expo-location';

const fontFamily = Platform.select({ ios: "Helvetica", default: "sans-serif" });
const fontStyle = {
    fontFamily,
    fontSize: 60,
    fontStyle: "normal",
    fontWeight: "normal",
};
const font = matchFont(fontStyle);

const windowDimensions = Dimensions.get('window');

const textXOffset = 0.15 * windowDimensions.width;
const textYOffset = 20;

const CompassScreen = () => {
    const [heading, setHeading] = useState(0);
    const theme = useTheme();

    useEffect(() => {
        const getHeading = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }

            const subscription = Location.watchHeadingAsync((headingData) => {
                setHeading(headingData.magHeading);
            });

            return () => {
                subscription.remove();
            };
        };

        getHeading();
    }, []);

    const getRadius = (size) => size / 2.5;

    /*
    * A temporary compass that shows what is hurts
    * @param size size of the canvas
    * @param heading heading in degrees
    *
    * */

    const getCompassPosition = (size, heading) => {
        const compassRadius = getRadius(size);
        const indicatorRadius = size / 20;
        const effectiveRadius = compassRadius + 10 - indicatorRadius;

        const adjustedHeading = heading - 90;
        const radians = (adjustedHeading * Math.PI) / 180;
        const xVal = Math.cos(radians) * effectiveRadius;
        const yVal = Math.sin(radians) * effectiveRadius;
        return { x: size / 2 + xVal, y: size / 2 + yVal };
    };

    const canvasSize = windowDimensions.width * 0.9;

    const { x, y } = getCompassPosition(canvasSize, heading);

    /*
    * @param size size of the canvas
    * @returns {JSX.Element[]}
    * */

    const renderDegreeMarkers = (size) => {
        const markers = [];
        const compassRadius = getRadius(size);
        const indicatorRadius = size / 20;
        const tickLength = 10;

        for (let degree = 0; degree <= 360; degree += 10) {
            const radians = (degree - 90) * (Math.PI / 180);
            const isMajorTick = degree % 20 === 0;
            const currentTickLength = isMajorTick ? tickLength + 5 : tickLength;

            const outerX = size / 2 + (compassRadius + 10) * Math.cos(radians);
            const outerY = size / 2 + (compassRadius + 10) * Math.sin(radians);
            const innerX = size / 2 + (compassRadius + 10 - currentTickLength) * Math.cos(radians);
            const innerY = size / 2 + (compassRadius + 10 - currentTickLength) * Math.sin(radians);

            // Draw tick lines
            markers.push(
                <Line
                    key={`tick-${degree}`}
                    p1={{ x: innerX, y: innerY }}
                    p2={{ x: outerX, y: outerY }}
                    strokeWidth={2}
                    color={colorScheme.lightText}
                />
            );

            // Increase the number of degrees in increments of 20 degrees
            if (isMajorTick && degree !== 360) {
                const textRadius = compassRadius + 20;
                const textX = size / 2 + textRadius * Math.cos(radians);
                const textY = size / 2 + textRadius * Math.sin(radians) + 10;

                markers.push(
                    <SkiaText
                        key={`label-${degree}`}
                        x={textX - 10}
                        y={textY}
                        text={`${degree}°`}
                        font={matchFont({
                            fontFamily,
                            fontSize: 20,
                            fontStyle: "normal",
                            fontWeight: "bold",
                        })}
                        color={colorScheme.lightText}
                    />
                );
            }
        }

        return markers;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* TopBar */}
            <View style={styles.banner}>
                <Text style={styles.bannerText}>Compass</Text>
            </View>

            {/* Canvas component*/}
            <View style={styles.canvasContainer}>
                <Canvas style={styles.canvas}>
                    <Group>
                        {/* Rim*/}
                        <Circle
                            cx={canvasSize / 2}
                            cy={canvasSize / 2}
                            r={getRadius(canvasSize) + 10}
                            color={colorScheme.accent}
                        />
                        {/* Inner ciccle*/}
                        <Circle
                            cx={canvasSize / 2}
                            cy={canvasSize / 2}
                            r={getRadius(canvasSize) - 10}
                            color={colorScheme.innerCircle}
                        />
                        {/* Indicator circle*/}
                        <Circle
                            cx={x}
                            cy={y}
                            r={canvasSize / 20}
                            color={colorScheme.primary}
                        />
                        {/* Degrees and lines */}
                        {renderDegreeMarkers(canvasSize)}
                    </Group>
                    {/* Text showing compass direction */}
                    {/*<SkiaText*/}
                    {/*    x={canvasSize / 2 - textXOffset}*/}
                    {/*    y={canvasSize / 2 + textYOffset}*/}
                    {/*    text={`${Math.round(heading)}°`}*/}
                    {/*    font={font}*/}
                    {/*    color={colorScheme.lightText}*/}
                    {/*/>*/}
                </Canvas>
            </View>

            {/* Button component */}
            {/*
            <Button
                icon={() => <Icon name="compass-outline" size={30} color={theme.colors.text} />}
                theme={theme}
                style={styles.button}
                buttonColor={colorScheme.innerCircle}
                textColor={theme.colors.text}
                onPress={() => {}}
            >
                Päivitä suunta
            </Button>
            */}

            {/* BottomBar */}
            <View style={styles.footerBanner}>
                {/*<Text style={styles.bannerText}>/!* Slope error message *!/</Text>*/}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colorScheme.background,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    banner: {
        backgroundColor: colorScheme.primary,
        width: "100%",
        alignItems: "center",
    },
    footerBanner: {
        backgroundColor: colorScheme.primary,
        width: "100%",
        alignItems: "center",
    },
    bannerText: {
        fontSize: 32,
        color: colorScheme.lightText,
        padding: 16,
        textAlign: 'center',
    },
    canvasContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    canvas: {
        backgroundColor: colorScheme.background,
        width: windowDimensions.width * 0.9,
        height: windowDimensions.width * 0.9,
    },
    button: {
        marginBottom: 40,
        marginHorizontal: 40,
        paddingVertical: 20,
        borderWidth: 2,
        borderColor: colorScheme.accent,
    },
});

export default CompassScreen;