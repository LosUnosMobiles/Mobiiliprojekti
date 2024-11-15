import {StyleSheet} from 'react-native';
import MenuScreen from "./screens/MenuScreen";
import SpiritLevelScreen from "./screens/SpiritLevelScreen";
import {MD3LightTheme, PaperProvider} from "react-native-paper";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import colorScheme from './styles/colorScheme';
import FieldPatchAreaScreen from "./screens/FieldPatchAreaScreen";

const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        ...colorScheme,
    }
}

const Stack = createStackNavigator();

export default function App() {
    return (
        <PaperProvider theme={theme}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Menu" screenOptions={
                    {headerStyle: [{backgroundColor: colorScheme.primary}] }}>
                    <Stack.Screen name="Menu" component={MenuScreen} />
                    <Stack.Screen name="Vatupassi" component={SpiritLevelScreen} />
                    <Stack.Screen name="Sarkalaskuri" component={FieldPatchAreaScreen} />
                </Stack.Navigator>
            </NavigationContainer>
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
