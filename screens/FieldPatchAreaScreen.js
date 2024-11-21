import BottomBar from "../components/BottomBar";
import {Text, TextComponent, View} from "react-native";
import styles from "../styles/styles";
import MapView, {Marker} from "react-native-maps";
import useLocation from "../hooks/useLocation";
import useFieldPatchArea from "../hooks/useFieldPatchArea";
import {useState} from "react";

export default () => {
    const {location, errorMsg} = useLocation();
    const {pushPoint, popPoint, area, error} = useFieldPatchArea();
    const [markers, setMarkers] = useState([]);
    return (
        <>
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
            </View>
            <BottomBar/>
        </>
    )
}
