import * as React from 'react';
import { View } from 'react-native';
import {Button, Divider, Icon, Menu} from 'react-native-paper';
import {useState} from "react";
import {showCompassRim, zoomIn, zoomOut, mapLocked, calibrationDataVisible} from "../signals/compassSignals";
import title from "react-native-paper/src/components/Typography/v2/Title";

const CompassMenu = () => {
    const [visible, setVisible] = useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'center',
            }}>
            <Menu
                style={{position: visible ? "absolute" : "static", top: 100}}
                visible={visible}
                onDismiss={closeMenu}
                anchor={<Button onPress={openMenu}><Icon size={30} source="menu"/></Button>}>
                <Menu.Item onPress={() => {
                    showCompassRim.value = !showCompassRim.value;
                }} title="Näytä tai piilota kehä" />
                <Menu.Item onPress={() => {
                    mapLocked.value = !mapLocked.value
                }} title="Vapauta tai lukitse kartta" />
                <Menu.Item onPress={() => {
                    zoomIn()
                }} title="Zoomaa lähemmäs" />
                <Menu.Item onPress={() => {
                    zoomOut()
                }} title="Zoomaa kauemmas" />
                <Divider />
                <Menu.Item
                    onPress={() => {
                        calibrationDataVisible.value = !calibrationDataVisible.value
                    }}
                    title={calibrationDataVisible.value ? "Piilota kalibrointidata" : "Näytä kalibrointidata"} />
            </Menu>
        </View>
    );
};

export default CompassMenu