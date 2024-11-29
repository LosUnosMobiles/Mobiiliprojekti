import {useEffect, useState} from "react";

const useHeadingForCompass = (compassData) => {
    const [heading, setHeading] = useState(0);


    useEffect(() => {
        if (compassData.direction) {
            //const newHeading = parseFloat(compassData.direction);
            //const normalizedHeading = (newHeading + 360) % 360;
            //console.log('CompassScreen - Heading:', compassData.direction);
            setHeading(compassData.direction);
        }
    }, [compassData.direction]);
    return heading;
}

export default useHeadingForCompass;