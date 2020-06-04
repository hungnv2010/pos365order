import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, Linking, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import { WebView } from 'react-native-webview';
import useDidMountEffect from '../../customHook/useDidMountEffect';
import dialogManager from '../../components/dialog/DialogManager';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import ToolBarPreviewHtml from '../../components/toolbar/ToolBarPreviewHtml';
import JsonContent1 from '../../data/json/data_print_demo'
import { dateToDate, DATE_FORMAT, currencyToString } from '../../common/Utils';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import { Snackbar } from 'react-native-paper';
import printService from '../../data/html/PrintService';
import ToolBarNoteBook from '../../components/toolbar/ToolBarNoteBook';
import I18n from '../../common/language/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import realmStore from '../../data/realm/RealmStore';

export default (props) => {

    const [dataList, setDataList] = useState([]);
    const [title, setTitle] = useState("")
    const [flash, setFlash] = useState("flash")
    const [TotalPrice, setTotalPrice] = useState(0)
    let refQRCodeScanner = null;

    useEffect(() => {
        console.log("props ", props);
    }, [])

    const onSuccess = async e => {
        console.log("e ", e);
        if (e.data) {
            let results = await realmStore.queryProducts()
            results = results.filtered(`Code = "${e.data}"`)
            results = JSON.parse(JSON.stringify(results))
            console.log("onSuccess results ", results, [results["0"]]);
            props.navigation.pop();
            props.route.params._onSelect([results["0"]]);
        }
    };


    return (
        <View style={styles.container}>
            <ToolBarDefault
                {...props}
                leftIcon="keyboard-backspace"
                title="QRCode"
                clickLeftIcon={() => { props.navigation.goBack() }}
                clickRightIcon={() => {
                    if (flash == "flash") {
                        setFlash("flash-off")
                    } else {
                        setFlash("flash")
                    }
                }}
                rightIcon={flash}
            />
            <QRCodeScanner
                ref={(ref) => refQRCodeScanner = ref}
                reactivate={false}
                onRead={(e) => onSuccess(e)}
                cameraStyle={{
                    width: '100%',
                    height: '100%'
                }}
                showMarker={true}
                customMarker={
                    <View style={{ backgroundColor: 'transparent' }}>

                        <View style={{ backgroundColor: 'rgba(1,1,1,0.5)', flex: 2, width: Metrics.screenWidth }}></View>

                        <View style={{ flex: 4.4, flexDirection: 'row' }}>
                            <View style={{ backgroundColor: 'rgba(1,1,1,0.5)', height: "100%", width: Metrics.screenWidth / 10 }}></View>
                            <View style={[{ backgroundColor: 'transparent', height: "100%", width: 8 * (Metrics.screenWidth / 10) }, styles.rectangle]}>
                            </View>
                            <View style={{ backgroundColor: 'rgba(1,1,1,0.5)', height: "100%", width: Metrics.screenWidth / 10 }}></View>
                        </View>
                        <View style={{ flex: 4, backgroundColor: 'rgba(1,1,1,0.5)', height: Metrics.screenHeight / 3, width: Metrics.screenWidth }}></View>
                    </View>
                }
                flashMode={flash != "flash" ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
            // topContent={
            //     <Text style={styles.centerText}>
            //         <Text style={styles.textBold}>Di chuyển camerqa đến hình ảnh mã QR</Text>
            //     </Text>
            // }
            // bottomContent={
            //     <TouchableOpacity style={styles.buttonTouchable}>
            //         <Text style={styles.buttonText}>OK. Got it!</Text>
            //     </TouchableOpacity>
            // }
            />
            <Text style={{ position: "absolute", bottom: 20, color: "#fff", textAlign: "center", width: "100%" }}>Quét BarCode hoặc QRCode</Text>
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
})
