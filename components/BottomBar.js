import styles from "../styles/styles";
import {Text, View} from "react-native";
import React from "react";

export default ({text, isError}) => {
    return (
        <View style={styles.banner}>
            <Text style={isError ? styles.bannerTextError : styles.bannerText}>{text}</Text>
        </View>
    )
}