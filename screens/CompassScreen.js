
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import colorScheme from "../styles/colorScheme";
import { Canvas, Circle, Group, Text as SkiaText, matchFont, Line } from "@shopify/react-native-skia";
import * as Location from 'expo-location';
import useCompass from "../hooks/useCompass";
import MapView, { Marker } from "react-native-maps";
import renderDegreeMarkers from "../utils/renderDegreeMarkers";
import CustomMapView from "../components/CustomMapView";

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
const canvasSize = windowDimensions.width * 0.9;

const CompassScreen = () => {
    const compassData = useCompass();
    const [heading, setHeading] = useState(0);
    const [location, setLocation] = useState(null);
    const [destination, setDestination] = useState(null);

    useEffect(() => {
        let locationSubscription;
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000,
                    distanceInterval: 1,
                },
                (newLocation) => {
                    setLocation(newLocation.coords);
                }
            );
        })();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, []);

    useEffect(() => {
        if (compassData.direction) {
            setHeading(parseFloat(compassData.direction));
        }
    }, [compassData.direction]);

    const getRadius = (size) => size / 2.5;

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

    const { x, y } = getCompassPosition(canvasSize, heading);

    const region = location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }
        : {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* TopBar */}
            <View style={styles.banner}>
                <Text style={styles.bannerText}>Compass</Text>
            </View>

            {/* Map and Compass Container */}
            <View style={styles.canvasContainer}>
                <CustomMapView
                    region={region}
                    destination={destination}
                    onMapPress={(e) => {
                        const { latitude, longitude } = e.nativeEvent.coordinate;
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
                        {/* Indicator point on the circumference */}
                        <Circle
                            cx={x}
                            cy={y}
                            r={canvasSize / 20}
                            color={colorScheme.primary}
                        />
                        {/* Degrees and lines */}
                        {renderDegreeMarkers(canvasSize)}
                    </Group>
                    {/*Text showing compass direction*/}
                    <SkiaText
                        x={canvasSize / 2 - textXOffset}
                        y={canvasSize / 2 + textYOffset}
                        text={`${Math.round(heading)}°`}
                        font={font}
                        color="black"
                    />
                </Canvas>
            </View>

            {/* BottomBar */}
            <View style={styles.footerBanner}>

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
