import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import colorScheme from "../styles/colorScheme";
import { Canvas, Circle, Group, Text as SkiaText, matchFont, Line } from "@shopify/react-native-skia";
import useCompass from "../hooks/useCompass";
import renderDegreeMarkers from "../utils/renderDegreeMarkers";
import CustomMapView from "../components/CustomMapView";
import BottomBar from "../components/BottomBar";
import calculateBearing from "../utils/calculateBearing";
import useLocationForCompass from "../hooks/useLocationForCompass";
import getCompassPosition from "../utils/getCompassPosition";
import getRadius from "../utils/getRadiusForCompass";
import useHeadingForCompass from "../hooks/useHeadingForCompass";
import useArrowPosition from "../hooks/useArrowPositionForCompass";


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
//const canvasSize = windowDimensions.width * 0.9;
/**
 * CompassScreen component
 * @description
 * This component displays a compass that shows the current heading of the device.
 * The compass also shows the direction to a destination if one is set.
 * The user can set a destination by tapping on the map.
 * The compass will then show the direction to the destination.
 * The compass also shows the current location on the map.
 * The user's location is updated in real-time.
 * The compass is implemented using the react-native-skia library.
 * @returns {JSX.Element}
 * @constructor
 */
const CompassScreen = () => {
    const canvasSize = windowDimensions.width * 0.9;
    const styles = createStyles(canvasSize);

    const compassData = useCompass();
    const heading = useHeadingForCompass(compassData);
    const location = useLocationForCompass()

    const [destination, setDestination] = useState(null);
    const arrowPosition = useArrowPosition(location, destination, heading, canvasSize);

    // const destinationBearing = location && destination
    //     ? calculateBearing(location.latitude, location.longitude, destination.latitude, destination.longitude)
    //     : 0;

    const { x, y } = getCompassPosition(canvasSize, Number(heading));


    const region = location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }
        : {
            latitude: 65.0121,
            longitude: 25.4641,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Map and Compass Container */}
            <View style={styles.canvasContainer}>
                <CustomMapView
                    region={region}
                    destination={destination}
                    onMapPress={(e) => {
                        const { latitude, longitude } = e.nativeEvent.coordinate;
                        console.log('Destination set to:', { latitude, longitude });
                        setDestination({ latitude, longitude });
                    }}
                />

                <Canvas style={styles.canvas}>
                    <Group>
                        {/* Ring*/}
                        <Circle
                            cx={canvasSize / 2}
                            cy={canvasSize / 2}
                            r={getRadius(canvasSize) + 10}
                            color={colorScheme.accent}
                            style = "stroke"
                            strokeWidth={30}
                        />
                        {/* Indicator marker pointing to North*/}
                        <Circle
                            cx={x}
                            cy={y}
                            r={canvasSize / 20}
                            color={colorScheme.primary}
                        />
                        {/* Degrees and lines */}
                        {renderDegreeMarkers(canvasSize)}
                        {destination && (
                            <Line
                                p1={{ x: canvasSize / 2, y: canvasSize / 2 }}
                                p2={arrowPosition}
                                strokeWidth={4}
                                color="red"
                            />
                        )}
                    </Group>
                    {/*Text showing compass direction*/}
                    <SkiaText
                        x={canvasSize / 2 - 0.15 * canvasSize}
                        y={canvasSize / 2 + 20}
                        text={`${Math.round(heading)}°`}
                        font={font}
                        color="black"
                    />
                </Canvas>
            </View>

            {/* BottomBar */}
            {/*<View style={styles.footerBanner}>*/}

            {/*</View>*/}
            <BottomBar

            />
        </SafeAreaView>
    );
};

const createStyles = (canvasSize) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colorScheme.background,
        },
        banner: {
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
            position: 'relative',
        },
        map: {
            ...StyleSheet.absoluteFillObject,
        },
        canvas: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [
                { translateX: -canvasSize / 2 },
                { translateY: -canvasSize / 2 },
            ],
            width: canvasSize,
            height: canvasSize,
        },
        footerBanner: {
            backgroundColor: colorScheme.primary,
            width: "100%",
            alignItems: "center",
        },
    });

export default CompassScreen;