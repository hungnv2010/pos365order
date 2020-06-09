import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, Linking, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import dialogManager from '../../components/dialog/DialogManager';
import I18n from '../../common/language/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import realmStore from '../../data/realm/RealmStore';

const FLASH_ON = "flash"
const FLASH_OFF = "flash-off"

export default (props) => {

    const [flash, setFlash] = useState(FLASH_ON)
    let refQRCodeScanner = null;

    useEffect(() => {
        console.log("props ", props);
    }, [])

    const onSuccess = async e => {
        console.log("e ", e);
        if (e.data) {
            try {
                let results = await realmStore.queryProducts()
                if (results) {
                    results = results.filtered(`Code = "${e.data}"`)
                    if (results && results.length > 0) {
                        results = JSON.parse(JSON.stringify(results))
                        props.navigation.pop();
                        props.route.params._onSelect([results["0"]]);
                    } else {
                        notifyErr()
                    }
                } else {
                    notifyErr()
                }
            } catch (e) {
                notifyErr()
            }
        }
    };

    const notifyErr = () => {
        dialogManager.showPopupOneButton(I18n.t('ma_khong_hop_le'), I18n.t('thong_bao'), (res) => {
            console.log("notifyErr res ", res);
            refQRCodeScanner.reactivate();
        })
    }

    return (
        <View style={styles.container}>
            <ToolBarDefault
                {...props}
                leftIcon="keyboard-backspace"
                title="QRCode"
                clickLeftIcon={() => { props.navigation.goBack() }}
                clickRightIcon={() => {
                    if (flash == FLASH_ON) {
                        setFlash(FLASH_OFF)
                    } else {
                        setFlash(FLASH_ON)
                    }
                }}
                rightIcon={flash}
            />
            <QRCodeScanner
                ref={(ref) => refQRCodeScanner = ref}
                reactivate={false}
                onRead={(e) => onSuccess(e)}
                showMarker={true}
                customMarker={
                    <View style={styles.viewCustom}>
                        <View style={styles.viewTopCustom}></View>
                        <View style={styles.viewCenterCustom}>
                            <View style={styles.viewCenterLeft}></View>
                            <View style={[styles.viewCenterContent, styles.rectangle]}>
                            </View>
                            <View style={styles.viewCenterRight}></View>
                        </View>
                        <View style={styles.viewBottomCustom}></View>
                    </View>
                }
                flashMode={flash != FLASH_ON ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
            />
            <Text style={styles.textQRCode}>{I18n.t('quet_barcode_hoac_qrcode')}</Text>
        </View>

    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    rectangle: {
        borderWidth: 0,
        borderColor: "#fff",
        alignItems: "center",
        justifyContent: "flex-start"
    },
    viewCustom: { backgroundColor: 'transparent' },
    viewCenterCustom: { flex: 4.4, flexDirection: 'row' },
    viewCenterContent: { backgroundColor: 'transparent', height: "100%", width: 8 * (Metrics.screenWidth / 10) },
    viewCenterLeft: { backgroundColor: 'rgba(1,1,1,0.5)', height: "100%", width: Metrics.screenWidth / 10 },
    viewCenterRight: { backgroundColor: 'rgba(1,1,1,0.5)', height: "100%", width: Metrics.screenWidth / 10 },
    viewBottomCustom: { flex: 3.5, backgroundColor: 'rgba(1,1,1,0.5)', height: Metrics.screenHeight / 3, width: Metrics.screenWidth },
    viewTopCustom: { backgroundColor: 'rgba(1,1,1,0.5)', flex: 2, width: Metrics.screenWidth },
    textQRCode: { position: "absolute", bottom: 20, color: "#fff", textAlign: "center", width: "100%" }
})