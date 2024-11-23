import BottomBar from "../components/BottomBar";
import {Text, View} from "react-native";
import styles from "../styles/styles";
import MapView, {MapPolygon, Marker, Polyline} from "react-native-maps";
import useLocation from "../hooks/useLocation";
import useFieldPatchArea from "../hooks/useFieldPatchArea";
import React, {useState} from "react";
import {Button, Icon} from "react-native-paper";
import style from "../styles/styles";
import colorScheme from "../styles/colorScheme";

export default () => {
    const {location, errorMsg} = useLocation();
    const {pushPoint, popPoint, points, area, error} = useFieldPatchArea()
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [markers, setMarkers] = useState([])
    return (
        <View style={styles.container}>
            <MapView initialRegion={location}
                     region={
                            {latitude: location.latitude, longitude: location.longitude,
                             latitudeDelta: 0.003, longitudeDelta: 0.003}}
                     onLongPress={(ev) => setSelectedPoint(ev.nativeEvent.coordinate)}
                     style={styles.map} >
                    <Marker
                        coordinate={location}
                        title="Moon täs"
                    />
                    {selectedPoint !== null && <Marker
                        pinColor="green"
                        coordinate={selectedPoint}
                        title="Mun valittema piste"
                        onPress={() => setSelectedPoint(null)}
                    />}
                    {points.length >= 3 && <MapPolygon
                        coordinates={points}
                        strokeColor={colorScheme.accent}
                    />}
                    {markers.map((marker, i) => (<Marker key={i} coordinate={location}/>))}
                </MapView>
            <View style={{flex: 1, position: "absolute", bottom: 60, flexDirection: 'row', justifyContent: 'space-between'}}>
                <Button style={style.navigationButton}
                        disabled={selectedPoint === null}
                        onPress={() => selectedPoint && pushPoint(selectedPoint)}
                >
                    <Icon size={22} source="map-outline" color={ selectedPoint ? colorScheme.text : "#aaa"} />
                    <Text style={selectedPoint ? style.buttonText : {...style.buttonText, color: "#aaa"}}>Karttapiste</Text>
                </Button>
                <Button style={style.navigationButton}
                        mode="contained"
                        onPress={() => {pushPoint(location)}}>
                    <Icon size={22} source="crosshairs-gps"/>
                    <Text style={style.buttonText}>GPS piste</Text>
                </Button>
            </View>

            <BottomBar text={errorMsg ? errorMsg : error} isError={error} >
                <View style={{...styles.bottomBarWithChildren, textAlign: "center"}}>
                    {area.ha > 0 && <Text style={style.buttonText}>
                        Pinta-ala: {area.ha.toFixed(2)}ha, eli {area.sqm.toFixed(0)}m²
                    </Text>}
                </View>
            </BottomBar>

        </View>
    )
}
