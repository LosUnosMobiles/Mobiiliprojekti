import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';

const CustomMapView = ({
                           region,
                           destination,
                           onMapPress,
                       }) => {
    return (
        <MapView
            style={styles.map}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onPress={onMapPress}
        >
            {destination && (
                <Marker
                    coordinate={{
                        latitude: destination.latitude,
                        longitude: destination.longitude,
                    }}
                    title="Destination"
                    description="This is the marker location"
                />
            )}
        </MapView>
    );
};

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default CustomMapView;
