import {useState, useEffect} from "react"
import * as Location from 'expo-location'

/**
 * Return and update current position.
 *
 * @returns {{location: {longitudeDelta: number, latitudeDelta: number, latitude: number, longitude: number}, errorMsg: string}}
 */
export default function useLocation() {
    const [location, setLocation] = useState({
        latitude: 65.1,
        longitude: 25.5,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    })
    const [errorMsg, setErrorMsg] = useState("awaiting location");

    useEffect(() => {
        async function getCurrentLocation() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Paikannusluvan pyytäminen epäonnistui!');
                return null;
            }

            setErrorMsg(null);
            const loc = await Location.getCurrentPositionAsync({
                accuracy: 5, // Most accurate
                mayShowUserSettingsDialog: false,
                timeInterval: 800,
                distanceInterval: null,
            })
            return loc
        }

        const intervalHandle = setInterval(() => {
            getCurrentLocation()
                .then((loc) => {
                    setLocation(loc.coords)
                    console.log(loc)
                })
        }, 3500)

        return () => clearInterval(intervalHandle)
    }, []);

    return {location, errorMsg};
}