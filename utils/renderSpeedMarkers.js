import React from 'react';
import { Line, Text as SkiaText, matchFont } from '@shopify/react-native-skia';
import { Platform } from 'react-native';
import colorScheme from '../styles/colorScheme'; // Adjust the import path as needed

const fontFamily = Platform.select({ ios: 'Helvetica', default: 'sans-serif' });

const renderSpeedMarkers = (size) => {
    const markers = [];
    const compassRadius = size / 2.5;
    const tickLength = 10;

    for (let speed = 0; speed <= 160; speed += 20) {
        const radians = ((speed - 160) * Math.PI) / 160;
        const isMajorTick = speed % 20 === 0;
        const currentTickLength = isMajorTick ? tickLength + 5 : tickLength;

        const outerX = size / 2 + (compassRadius + 20) * Math.cos(radians);
        const outerY = size / 2 + (compassRadius + 20) * Math.sin(radians);
        const innerX = size / 2 + (compassRadius + 0 - currentTickLength) * Math.cos(radians);
        const innerY = size / 2 + (compassRadius + 0 - currentTickLength) * Math.sin(radians);

        markers.push(
            <Line
                key={`tick-${speed}`}
                p1={{ x: innerX, y: innerY }}
                p2={{ x: outerX, y: outerY }}
                strokeWidth={2}
                color={colorScheme.lightText}
            />
        );

        if (isMajorTick && speed !== 360) {
            const textRadius = compassRadius + 20;
            const textX = size / 2 + textRadius * Math.cos(radians);
            const textY = size / 2 + textRadius * Math.sin(radians) + 10;

            markers.push(
                <SkiaText
                    key={`label-${speed}`}
                    x={textX - 20}
                    y={textY-20} 
                    text={`${speed}`}
                    font={matchFont({
                        fontFamily,
                        fontSize: 20,
                        fontStyle: 'normal',
                        fontWeight: 'bold',
                    })}
                    //>={colorScheme.lightText}
                    color="black"
                />
            );
        }
    }

    return markers;
};

export default renderSpeedMarkers;