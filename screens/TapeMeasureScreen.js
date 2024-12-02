import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import useTapeMeasure from '../hooks/useTapeMeasure'; // Assuming you have a custom hook for tape measure

// useTapeMeasure returns the following:
// { 
// start: Function, 
// stop: Function, 
// reset: Function, 
// calculateDistance: Function, 
// distance: number, 
// acceleration: Object, 
// initialPosition: Object, 
// position: Object, 
// error: string, 
// permission: string 
// }

const TapeMeasureScreen = () => {
    const { start, stop, calculateDistance, distance, acceleration, initialPosition, error, permission } = useTapeMeasure();

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Start Time: {initialPosition.timestamp} </Text>
            <Text style={styles.text}>Length: {distance} </Text>
            <Button 
                style={styles.button}
                title={initialPosition.timestamp == 0 ? "Stop" : distance != 0 ? "Reset" : "Start"}
                onPress={initialPosition.timestamp == 0 ? stop() : distance != 0 ? reset() : start()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        marginTop: 30,
    },
});

export default TapeMeasureScreen;