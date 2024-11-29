import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useTapeMeasure } from '../hooks/useTapeMeasure'; // Assuming you have a custom hook for tape measure

const TapeMeasureScreen = () => {
    const { place, distance } = useTapeMeasure();

    const haveStartPoint = distance > 0;

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Place: {place}</Text>
            <Text style={styles.text}>Length: {distance} </Text>
            <Button 
                style={styles.button}
                title={haveStartPoint ? "Reset" : "Start"}
                onPress={haveStartPoint ? () => setInitialPosition(place) : () => setInitialPosition(null)}
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
    },
    button: {
        marginTop: 16,
    },
});

export default TapeMeasureScreen;