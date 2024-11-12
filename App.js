import {StyleSheet} from 'react-native';
import SpiritLevelScreen from "./screens/SpiritLevelScreen";
import {MD3LightTheme, PaperProvider} from "react-native-paper";
import colorScheme from "./styles/colorScheme";
import CompassScreen from "./screens/CompassScreen";

const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        ...colorScheme,
    }
}

export default function App() {
    return (
        <PaperProvider theme={theme}>
            {/*<SpiritLevelScreen/>*/}
            <CompassScreen/>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
