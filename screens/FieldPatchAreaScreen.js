import BottomBar from "../components/BottomBar";
import {Text, View} from "react-native";
import styles from "../styles/styles";
import MapView, {Marker} from "react-native-maps";
import useLocation from "../hooks/useLocation";
import useFieldPatchArea from "../hooks/useFieldPatchArea";
import React, {useState} from "react";
import {Button} from "react-native-paper";
import style from "../styles/styles";

export default () => {
    const {location, errorMsg} = useLocation();
    const {pushPoint, popPoint, area, error} = useFieldPatchArea();
    const [markers, setMarkers] = useState([]);
    return (
        <View style={styles.container}>

            {errorMsg ? <Text>{errorMsg}</Text>
                : <MapView initialRegion={location} region={
                    {latitude: location.latitude, longitude: location.longitude,
                        latitudeDelta: 0.003, longitudeDelta: 0.003}
                }
                           style={styles.map} >
                    <Marker coordinate={location} title={"Moon täs"} />
                    {markers.map((marker, i) => (<Marker key={i} coordinate={location}/>))}
                </MapView>}

            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                <Button style={style.navigationButton}
                        mode="contained"
                        onPress={() => {pushPoint(location)}}>
                    <Text style={style.buttonText}>Lisää paikannustieto</Text>
                </Button>
                <Button><Text>LaLa</Text></Button>
            </View>

            <BottomBar>
                <View style={styles.bottomBarWithChildren}>
                    <Text>{area.ha}</Text>
                    <Button style={styles.navigationButton}
                            onPress={() => {popPoint()}}><Text>Poista piste</Text></Button>
                </View>
            </BottomBar>

        </View>
    )
}
