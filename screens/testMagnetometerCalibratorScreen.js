
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from "react-native";
import useMagnetometerCalibrator from "../hooks/useMagnetometerCalibrator";
import {Magnetometer} from "expo-sensors";


const TestMagnetometerCalibratorScreen = () => {

    const [subscription, setSubscription] = useState(null);

    const _slow = () => Magnetometer.setUpdateInterval(1000);
    //const _fast = () => Magnetometer.setUpdateInterval(16);

    const [data, setData] = useState({ x: 0, y: 0, z: 0 })
    const teslas = useMagnetometerCalibrator(data);


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
        if(data) {
            console.log("raw data", data)
            console.log("teslas: ", teslas)
        }
    }, [data]);

    useEffect(() => {
        _subscribe();
        return () => _unsubscribe();
    }, []);


    return (
        <View style={styles.container}>
            <Text style={styles.textStyle}>x: {teslas?.x}</Text>
            <Text style={styles.textStyle}>y: {teslas?.y}</Text>
            <Text style={styles.textStyle}>z: {teslas?.z}</Text>

            <Text style={styles.textStyle}>xMax: {teslas?.xMax}</Text>
            <Text style={styles.textStyle}>xMin: {teslas?.xMin}</Text>
            <Text style={styles.textStyle}>yMax: {teslas?.yMax}</Text>
            <Text style={styles.textStyle}>yMin: {teslas?.yMin}</Text>
            <Text style={styles.textStyle}>zMax: {teslas?.zMax}</Text>
            <Text style={styles.textStyle}>zMin: {teslas?.zMin}</Text>


        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    textStyle: {
        fontSize: 22,
    }
})

export default TestMagnetometerCalibratorScreen;