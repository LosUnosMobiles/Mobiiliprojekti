import * as React from 'react';
import { View } from 'react-native';
import {Button, Divider, Icon, Menu} from 'react-native-paper';
import {useState} from "react";
import {showCompassRim} from "../signals/compassSignals";

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
            </Menu>
        </View>
    );
};

export default CompassMenu