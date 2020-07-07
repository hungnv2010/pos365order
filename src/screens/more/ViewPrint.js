import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Image, View, StyleSheet, PixelRatio, Text, TouchableOpacity, ScrollView, NativeEventEmitter, NativeModules, Dimensions } from 'react-native';
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
const { Print } = NativeModules;
import HtmlDefault from '../../data/html/htmlDefault';
import ViewShot, { takeSnapshot, captureRef } from "react-native-view-shot";
import HTML from 'react-native-render-html';
import AutoHeightWebView from 'react-native-autoheight-webview'
const FOOTER_HEIGHT = 21;
const PADDING = 16;
const BOTTOM_MARGIN_FOR_WATERMARK = FOOTER_HEIGHT * PADDING;


const pixelRatio = PixelRatio.get();


export default forwardRef((props, ref) => {

    const [uriImg, setUriImg] = useState("")

    const deviceType = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common.deviceType
    });

    useEffect(() => {
        console.log("ViewPrint props ", props);

        // setTimeout(() => {
        //     captureRef(childRef, {
        //         // snapshotContentContainer: true,
        //     }).then(
        //         uri => {
        //             console.log('Snapshot uri', uri);
        //             // setUriImg(uri);
        //             // props.callback(uri)

        //         },
        //         error => console.error('Oops, snapshot failed', error)
        //     );
        // }, 2000);
    }, [])

    useImperativeHandle(ref, () => ({
        clickCaptureRef() {
            console.log('clickCaptureRef');
            clickCapture()
        }
    }));

    const clickCapture = () => {
        console.log('clickCapture');
        // props.callback("akb")
        captureRef(childRef, {
            // format: "png",
            // quality: 1.0
            width: 100,
            // snapshotContentContainer: true,
        }).then(
            uri => {
                console.log('Snapshot uri', uri);
                // setUriImg(uri);
                props.callback(uri)

            },
            error => console.error('Oops, snapshot failed', error)
        );
    }

    const childRef = useRef();
    return (
        <View style={{position: "absolute"}}>
            {/* <TouchableOpacity style={{ backgroundColor: "red", padding: 20, }} ><Text>{props.html}</Text></TouchableOpacity> */}
            <View style={{ opacity: 0 }}>
                <ScrollView>
                    <View
                        ref={childRef}
                        style={{
                            flex: 1, alignItems: "center"
                        }}>
                        <AutoHeightWebView
                            scrollEnabled={false}
                            style={{ width: deviceType == Constant.PHONE ?  Dimensions.get('window').width : Dimensions.get('window').width/2 }}
                            // style={{ width: Dimensions.get('window').width }}
                            // customScript={`document.body.style.background = 'red';`}

                            // onSizeUpdated={({size => console.log(size.height)})},
                            files={[{
                                href: 'cssfileaddress',
                                type: 'text/css',
                                rel: 'stylesheet'
                            }]}
                            source={{ html: props.html }}
                            scalesPageToFit={true}
                        />
                    </View>
                </ScrollView>
            </View>
            {/* <TouchableOpacity style={{backgroundColor:"red", padding: 20, flex: 1}} onPress={() => data.callback("ClickHung")}><Text>Click</Text></TouchableOpacity> */}
            {/* <Image source={{ uri: uriImg }} resizeMode="contain" style={{ position: "absolute", top: 50, width: 100, height: 100, flex: 1 }} /> */}
        </View>
    )

});

const styles = StyleSheet.create({

})
