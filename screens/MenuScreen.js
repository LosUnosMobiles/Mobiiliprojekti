import 'react-native-gesture-handler';
import React from 'react';
import {View, Text} from 'react-native';

import style from '../styles/styles';
import SpiritLevelScreen from './SpiritLevelScreen';
import { Button } from 'react-native-paper';


export default function MenuScreen() {
  return (
    <View style={style.container}>

      <Button style={style.navigationButton}
        mode="outlined"
        onPress={() => console.log('Button Pressed')}
      >
        <Text style={style.buttonText}>Vatupassi</Text>
      </Button>
      <Button style={style.navigationButton}
        mode="outlined"
        onPress={() => console.log('Button Pressed')}
      >
        <Text style={style.buttonText}>Kompassi</Text>
      </Button>
      <Button style={style.navigationButton}
        mode="outlined"
        onPress={() => console.log('Button Pressed')}
      >
        <Text style={style.buttonText}>Metrimitta</Text>
        
      </Button>
      <Button style={style.navigationButton}
        mode="outlined"
        onPress={() => console.log('Button Pressed')}
      >
        <Text style={style.buttonText}>Sarkamittari</Text>
       
      </Button>
    </View>
  );
}