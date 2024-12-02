import {useEffect, useState} from "react";

/**
 * useHeadingForCompass hook
 * @param compassData
 * @returns {number}
 */

const useHeadingForCompass = (compassData) => {
    const [heading, setHeading] = useState(0);


    useEffect(() => {
        if (compassData.direction) {
            setHeading(compassData.direction);
        }
    }, [compassData.direction]);
    return heading;
}

export default useHeadingForCompass;