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
    const { start, stop, reset, state, speed, position, calAcc, calculateDistance, distance, 
        acceleration, initialPosition, error, permission} = useTapeMeasure();

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Time: {position.time} </Text>
            <Text style={styles.text}>ax: {acceleration.x} </Text>
            <Text style={styles.text}>ay: {acceleration.y} </Text>
            <Text style={styles.text}>az: {acceleration.z} </Text>
            
            <Text style={styles.text}>xSpeed: {speed.x} </Text>
            <Text style={styles.text}>ySpeed: {speed.y} </Text>
            <Text style={styles.text}>zSpeed: {speed.z} </Text>
            <Text style={styles.text}>Current Speed: {Math.sqrt(speed.x**2 + speed.y**2 + speed.z**2)} </Text>
            <Text style={styles.text}>Length: {distance} </Text>
            <Text style={styles.text}>Length: {distance.toFixed(2)} </Text>
            <Button 
                style={styles.button}
                title={state === 'idle' ? "Start" : state === 'measuring' ? "Stop" : "Reset"}
                onPress={state === 'idle'? start : state === 'measuring' ? stop : reset}
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