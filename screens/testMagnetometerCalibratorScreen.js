
import React, {useEffect, useState} from 'react';
import {View} from "react-native";
import useMagnetometerCalibrator from "../hooks/useMagnetometerCalibrator";
import {Magnetometer} from "expo-sensors";

const TestMagnetometerCalibratorScreen = () => {
    const teslas = useMagnetometerCalibrator();

    const [subscription, setSubscription] = useState(null);

    const _slow = () => Magnetometer.setUpdateInterval(1000);
    const _fast = () => Magnetometer.setUpdateInterval(16);

    const [data, setData] = useState(null)

    const _subscribe = () => {
        setSubscription(
            Magnetometer.addListener(result => {
                setData(result);
            })
        );
    };

    const _unsubscribe = () => {
        subscription && subscription.remove();
        setSubscription(null);
    };

    useEffect(() => {
        _subscribe();
        return () => _unsubscribe();
    }, []);


    return (
        <View style={styles.container}>
            <Text>x: {teslas.x}</Text>
            <Text>y: {teslas.y}</Text>
            <Text>z: {teslas.z}</Text>
        </View>
    )
}