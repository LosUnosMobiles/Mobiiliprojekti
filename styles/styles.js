import {StyleSheet} from "react-native";
import colorScheme from "./colorScheme";

/**
 * Common styles among the various screens.
 */
export default StyleSheet.create({
    padding: {
        height: 20,
    },
    banner: {
        backgroundColor: colorScheme.primary,
        width: "100%",
        alignItems: "center",
    },
    bannerText: {
        fontSize: 32, // Increase the font size
        color: colorScheme.lightText, // Set the text color
        padding: 16,
        width: "100%",
        textAlign: 'center',
    },
    bannerTextError: {
        fontSize: 32, // Increase the font size
        color: colorScheme.error, // Set the text color
        padding: 16,
        width: "100%",
        textAlign: 'center',
    },
    safeArea: {
        height: '100%',
        backgroundColor: colorScheme.background
    }
});
