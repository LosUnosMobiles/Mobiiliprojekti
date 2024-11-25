import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import colorScheme from "../styles/colorScheme";
import { Canvas, Circle, Group, Text as SkiaText, matchFont, Line } from "@shopify/react-native-skia";
import * as Location from 'expo-location';
import useCompass from "../hooks/useCompass";
import renderDegreeMarkers from "../utils/renderDegreeMarkers";
import CustomMapView from "../components/CustomMapView";
import BottomBar from "../components/BottomBar";


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

const CompassScreen = () => {
    const canvasSize = windowDimensions.width * 0.9;
    const styles = createStyles(canvasSize);

    const compassData = useCompass();
    const [heading, setHeading] = useState(0);
    const [location, setLocation] = useState(null);
    const [destination, setDestination] = useState(null);
    const [arrowPosition, setArrowPosition] = useState({ x: canvasSize / 2, y: canvasSize / 2 });

    useEffect(() => {
        let locationSubscription;
        (async () => {
            //let { status } = await Location.requestForegroundPermissionsAsync();
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 500,
                    distanceInterval: 0.5,
                },
                (newLocation) => {
                    console.log('New Location:', newLocation.coords);
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
            const newHeading = parseFloat(compassData.direction);
            const normalizedHeading = (newHeading + 360) % 360;
            console.log('CompassScreen - Heading:', normalizedHeading);
            setHeading(normalizedHeading);
        }
    }, [compassData.direction]);

    useEffect(() => {
        if (location && destination) {
            const destinationBearing = calculateBearing(
                location.latitude,
                location.longitude,
                destination.latitude,
                destination.longitude
            );
            //const relativeHeading = destinationBearing - heading;
            const relativeHeading = (destinationBearing - heading + 360) % 360;

            console.log('Destination Bearing:', destinationBearing);
            console.log('Current Heading:', heading);
            console.log('Relative Heading:', relativeHeading);
            const { x, y } = getCompassPosition(canvasSize, relativeHeading);
            setArrowPosition({ x, y });
        }
    }, [heading, location, destination]);

    const getRadius = (size) => size / 2.5;

    const getCompassPosition = (size, relativeHeading) => {
        if (typeof size !== 'number' || typeof relativeHeading !== 'number') {
            console.error('Invalid inputs to getCompassPosition:', { size, relativeHeading });
            return { x: size / 2, y: size / 2 }; // Default to center
        }

        const compassRadius = getRadius(size);
        const indicatorRadius = size / 20;
        const effectiveRadius = compassRadius + 10 - indicatorRadius;

        const adjustedHeading = (relativeHeading - 90 + 360) % 360;
        const radians = (adjustedHeading * Math.PI) / 180;

        const xVal = Math.cos(radians) * effectiveRadius;
        const yVal = Math.sin(radians) * effectiveRadius;

        return { x: size / 2 + xVal, y: size / 2 + yVal };
    };

    const calculateBearing = (startLat, startLng, destLat, destLng) => {
        const startLatRad = (startLat * Math.PI) / 180;
        const startLngRad = (startLng * Math.PI) / 180;
        const destLatRad = (destLat * Math.PI) / 180;
        const destLngRad = (destLng * Math.PI) / 180;

        const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
        const x =
            Math.cos(startLatRad) * Math.sin(destLatRad) -
            Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);

        const bearing = (Math.atan2(y, x) * 180) / Math.PI;

        return (bearing + 360) % 360;
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
            latitude: 65.0121,
            longitude: 25.4641,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        };

    const destinationBearing = location && destination
        ? calculateBearing(location.latitude, location.longitude, destination.latitude, destination.longitude)
        : 0;

    const { x: arrowX, y: arrowY } = getCompassPosition(canvasSize, destinationBearing);

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