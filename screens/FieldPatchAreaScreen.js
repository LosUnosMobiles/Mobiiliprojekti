import BottomBar from "../components/BottomBar";
import {View} from "react-native";
import styles from "../styles/styles";
import MapView from "react-native-maps";
import useLocation from "../hooks/useLocation";
import useFieldPatchArea from "../hooks/useFieldPatchArea";

export default () => {
    const [pos, setPos] = useLocation();
    const {} = useFieldPatchArea();
    return (
        <>
            <View style={styles.container}>
                    <MapView initialRegion={pos} style={styles.map} />
            </View>
            <BottomBar/>
        </>
    )
}
