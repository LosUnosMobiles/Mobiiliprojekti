
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import colorScheme from "../styles/colorScheme";
import { Canvas, Circle, Group, Text as SkiaText, matchFont, Line } from "@shopify/react-native-skia";
import * as Location from 'expo-location';
import useCompass from "../hooks/useCompass";
import MapView, { Marker } from "react-native-maps";

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

    const renderDegreeMarkers = (size) => {
        const markers = [];
        const compassRadius = getRadius(size);
        const tickLength = 10;

        for (let degree = 0; degree <= 360; degree += 10) {
            const radians = (degree - 90) * (Math.PI / 180);
            const isMajorTick = degree % 20 === 0;
            const currentTickLength = isMajorTick ? tickLength + 5 : tickLength;

            const outerX = size / 2 + (compassRadius + 10) * Math.cos(radians);
            const outerY = size / 2 + (compassRadius + 10) * Math.sin(radians);
            const innerX = size / 2 + (compassRadius + 10 - currentTickLength) * Math.cos(radians);
            const innerY = size / 2 + (compassRadius + 10 - currentTickLength) * Math.sin(radians);

            markers.push(
                <Line
                    key={`tick-${degree}`}
                    p1={{ x: innerX, y: innerY }}
                    p2={{ x: outerX, y: outerY }}
                    strokeWidth={2}
                    color={colorScheme.lightText}
                />
            );

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
                        color="black"
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

            {/* Map and Compass Container */}
            <View style={styles.canvasContainer}>
                <MapView
                    style={styles.map}
                    region={
                        location
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
                            }
                    }
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    onPress={(e) => {
                        const { latitude, longitude } = e.nativeEvent.coordinate;
                        setDestination({ latitude, longitude }); // Updating the destination state
                    }}
                >
                    {/* Add a marker to the map if the destination is defined */}
                    {destination && (
                        <Marker
                            coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
                            title="Kohde"
                            description="Tämä on merkin sijainti"
                        />
                    )}
                </MapView>

                <Canvas style={styles.canvas}>
                    <Group>
                        {/* Rim*/}
                        <Circle
                            cx={canvasSize / 2}
                            cy={canvasSize / 2}
                            r={getRadius(canvasSize) + 10}
                            color={colorScheme.accent}
                            //color= 'black'
                            //color={colorScheme.transparentBackground}
                        />
                        {/* Inner circle*/}
                        <Circle
                            cx={canvasSize / 2}
                            cy={canvasSize / 2}
                            r={getRadius(canvasSize) - 10}
                            color={colorScheme.transparentBackground}
                        />
                        {/* Indicator circle*/}
                        <Circle
                            cx={x}
                            cy={y}
                            r={canvasSize / 20}
                            color={colorScheme.primary}
                            //color= 'black'
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
