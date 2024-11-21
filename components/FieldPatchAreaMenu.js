import * as React from 'react';
import { View } from 'react-native';
import {Button, Icon, Menu} from 'react-native-paper';
import {useState} from "react";

const FieldPatchAreaMenu = () => {
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
                <Menu.Item onPress={() => {}} title="Poista viimeisin piste" />
            </Menu>
        </View>
    );
};

export default FieldPatchAreaMenu