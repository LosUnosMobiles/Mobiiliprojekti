import {View, Text, StyleSheet, Dimensions, Platform} from 'react-native';
import React, {useMemo, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import colorScheme from "../styles/colorScheme";
import {Canvas, Circle, Group, Text as SkiaText, matchFont} from "@shopify/react-native-skia";
import {Button, Icon, IconButton, useTheme} from "react-native-paper"
import useSpiritLevel from "../hooks/useSpiritLevel";

const fontFamily = Platform.select({ios: "Helvetica", default: "sans-serif"});
const fontStyle = {
    fontFamily,
    fontSize: 60,
    fontStyle: "normal",
    fontWeight: "normal",
};
const font = matchFont(fontStyle);

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

const textXOffset = 0.15 * windowDimensions.width;
const textYOffset = 20;

const SpiritLevelScreen = () => {
    const slopeAndDirection = useSpiritLevel();
    const dimensions = {
        window: windowDimensions,
        screen: screenDimensions,
    };
    const theme = useTheme();

    /**
     * Get radius for slope direction indicator.
     * @param width
     * @param height
     * @returns {number}
     */
    const getRadius = (width, height) => {
        return Math.min(width, height) / 2.5;
    }

    /**
     * Calculate small indicator circle coordinates from direction given by useSpiritLevel-hook.
     * @param width width of the canvas
     * @param height height of the canvas
     * @returns {{x: number, y: number}}
     */
    const getPositionUsingCurrentDirection = (width, height) => {
        if (slopeAndDirection.error === null) {
            const direction = slopeAndDirection.direction; //direction in radians
            const r = getRadius(width, height);
            const xVal = Math.cos(direction) * r;
            const yVal = Math.sin(direction) * r;
            return {x: width / 2 + xVal, y: height / 2 + yVal};
        }
        return {x: windowDimensions.width / 2, y: windowDimensions.width / 2};
    }

    const {x, y} = getPositionUsingCurrentDirection(windowDimensions.width, windowDimensions.width);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.banner}>
                <Text style={styles.bannerText}>Vatupassi</Text>
            </View>
            <View style={styles.padding}/>
            <Canvas style={{...styles.canvas}}>
                <Group>
                    <Circle  // Rim
                        cx={dimensions.window.width / 2}
                        cy={dimensions.window.width / 2}
                        r={getRadius(windowDimensions.width, windowDimensions.width) + 10}
                        color={colorScheme.accent}
                    />
                    <Circle  // Inner circle
                        cx={dimensions.window.width / 2}
                        cy={dimensions.window.width / 2}
                        r={getRadius(windowDimensions.width, windowDimensions.width) - 10}
                        color={colorScheme.innerCircle}
                    />
                    <Circle // Indicator circle
                        cx={x}
                        cy={y}
                        r={windowDimensions.width / 20}
                        color={colorScheme.primary}
                    />
                </Group>
                <SkiaText x={dimensions.window.width / 2 - textXOffset} y={dimensions.window.width / 2 + textYOffset}
                          text={(slopeAndDirection.slope ?? "unreadable") + "°"} font={font}/>
            </Canvas>
            <View style={styles.padding}/>
            <Button
                icon={() => <Icon
                    name="lock"
                    size={20}
                    color={theme.colors.text}
                    source={"lock"}/>}
                theme={theme}
                style={styles.button}
                buttonColor={theme.colors.innerCircle}
                textColor={theme.colors.text}
            >Lukitse tai vapauta taso</Button>
            <View style={styles.banner}>
                <Text
                    style={styles.bannerText}>{slopeAndDirection.error ?? ""}</Text>
            </View>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        padding: 16,
        margin: 0,
    },
    canvas: {
        marginTop: "auto",
        marginBottom: "auto",
        backgroundColor: colorScheme.background,
        width: windowDimensions.width,
        height: windowDimensions.width,
    },
    padding: {
        height: 20,
    },
    button: {
        marginBottom: 40,
        marginLeft: 40,
        marginRight: 40,
        paddingTop: 20,
        paddingBottom: 20,
        borderStyle: 'solid',
        color: colorScheme.text,
        borderWidth: 2,
        borderColor: colorScheme.accent,
    },
    banner: {
        backgroundColor: colorScheme.primary,
        width: "100%",
        alignItems: "center",
    },
    bannerText: {
        fontSize: 32, // Increase the font size
        color: colorScheme.lightText, // Set the text color
        padding: 16,
        width: "100%",
        textAlign: 'center',
    },
    blueBannerText: {
        fontSize: 32, // Increase the font size
        color: colorScheme.primary, // Set the text color
        padding: 16,
        width: "100%",
        textAlign: 'center',
    },
    safeArea: {
        height: '100%',
        backgroundColor: colorScheme.background
    }

});

export default SpiritLevelScreen;