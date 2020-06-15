import React, { useState, useEffect, useFocusEffect, useCallback } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    NativeModules,
    Dimensions, ToastAndroid, NativeEventEmitter
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigation from './navigator/stack/StackNavigation';
import { useDispatch } from 'react-redux';
import { Constant } from './common/Constant'
import { navigationRef } from './navigator/stack/StackNavigation';
import RNExitApp from "react-native-exit-app";
import I18n from './common/language/i18n'
import signalRManager from './common/SignalR';
import { getFileDuLieuString } from './data/fileStore/FileStorage';
import printService from './data/html/PrintService';
import { Snackbar } from 'react-native-paper';
const { Print } = NativeModules;
let time = 0;
const eventSwicthScreen = new NativeEventEmitter(Print);

export default () => {

    const [forceUpdate, setForceUpdate] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const dispatch = useDispatch();

    const isPortrait = () => {
        const dim = Dimensions.get("screen");
        return dim.height >= dim.width ? Constant.PORTRAIT : Constant.LANDSCAPE;
    }

    const msp = (dim, limit) => {
        return (dim.scale * dim.width) >= limit || (dim.scale * dim.height) >= limit;
    }

    const isTablet = () => {
        const dim = Dimensions.get("screen");
        return ((dim.scale < 2 && msp(dim, 1000) || (dim.scale >= 2 && msp(dim, 1900)))) ? Constant.TABLET : Constant.PHONE;
    }

    useEffect(() => {
        signalRManager.init()
        I18n.locale = "vi";
        setForceUpdate(!forceUpdate);
        dispatch({ type: 'TYPE_DEVICE', deviceType: isTablet() })
        dispatch({ type: 'ORIENTAITION', orientaition: isPortrait() })

        const getCurrentIP = async () => {
            let getCurrentIP = await getFileDuLieuString(Constant.IPPRINT, true);
            console.log('getCurrentIP ', getCurrentIP);
            if (getCurrentIP && getCurrentIP != "") {
                Print.registerPrint(getCurrentIP)
            }
        }
        let check = false;
        const printListenner = () => {
            eventSwicthScreen.addListener('sendSwicthScreen', (text) => {
                console.log("eventSwicthScreen ", text);
                if (check == false) {
                    check = true;
                    setToastDescription("Kiểm tra kết nối máy in. Địa chỉ IP " + text)
                    setShowToast(true)
                }
                setTimeout(() => {
                    check = false;
                }, 1000);
            });
        }
        getCurrentIP()
        printListenner()

    }, [])


    const clickBack = () => {
        if (time + 1000 > new Date().getTime()) {
            RNExitApp.exitApp();
        } else {
            time = new Date().getTime();
            let thongbao = "Nhấn back 2 lần nữa để thoát";
            ToastAndroid.show(thongbao, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        }
    }

    // const backButtonHandler = useCallback(() => {
    //     console.log(navigationRef.current, 'back buttom');
    //     if (navigationRef.current.getRootState().index == 1) {
    //         clickBack()
    //         return true
    //     }
    // }, [])



    // useEffect(() => {
    //     BackHandler.addEventListener("hardwareBackPress", backButtonHandler);

    //     return () => {
    //         BackHandler.removeEventListener("hardwareBackPress", backButtonHandler);
    //     };
    // }, [backButtonHandler]);

    const handleChange = () => {
        dispatch({ type: 'TYPE_DEVICE', deviceType: isTablet() })
        dispatch({ type: 'ORIENTAITION', orientaition: isPortrait() })
    }

    useEffect(() => {
        Dimensions.addEventListener('change', handleChange)
        return () => {
            Dimensions.removeEventListener('change', handleChange)
        }
    })

    return (

        <NavigationContainer ref={navigationRef}>
            <StackNavigation />
            <Snackbar
                duration={5000}
                visible={showToast}
                onDismiss={() =>
                    setShowToast(false)
                }
            >
                {toastDescription}
            </Snackbar>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({

});