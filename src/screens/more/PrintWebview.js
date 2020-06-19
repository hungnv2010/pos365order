// import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
// import { Image, View, StyleSheet, Button, Text, TouchableOpacity, ScrollView, NativeEventEmitter, NativeModules, Dimensions } from 'react-native';
// import { Images, Colors, Metrics } from '../../theme';
// import { WebView } from 'react-native-webview';
// import useDidMountEffect from '../../customHook/useDidMountEffect';
// import dialogManager from '../../components/dialog/DialogManager';
// import { HTTPService } from '../../data/services/HttpService';
// import { ApiPath } from '../../data/services/ApiPath';
// import ToolBarPreviewHtml from '../../components/toolbar/ToolBarPreviewHtml';
// import JsonContent1 from '../../data/json/data_print_demo'
// import { dateToDate, DATE_FORMAT, currencyToString } from '../../common/Utils';
// import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
// import { Constant } from '../../common/Constant';
// import { useSelector } from 'react-redux';
// import { Snackbar } from 'react-native-paper';
// import printService from '../../data/html/PrintService';
// const { Print } = NativeModules;
// import HtmlDefault from '../../data/html/htmlDefault';
// import ViewShot, { takeSnapshot, captureRef } from "react-native-view-shot";
// import HTML from 'react-native-render-html';
// import AutoHeightWebView from 'react-native-autoheight-webview'
// const FOOTER_HEIGHT = 21;
// const PADDING = 16;
// const BOTTOM_MARGIN_FOR_WATERMARK = FOOTER_HEIGHT * PADDING;



// export default forwardRef((props, ref) => {

//     const [showToast, setShowToast] = useState(false);
//     const [toastDescription, setToastDescription] = useState("")

//     const [data, setData] = useState("");
//     const [vendorSession, setVendorSession] = useState({});
//     const [uri, setUri] = useState("");
//     let isClick = useRef();

//     const deviceType = useSelector(state => {
//         console.log("useSelector state ", state);
//         return state.Common.deviceType
//     });

//     useEffect(() => {

//     }, [])

//     useEffect(() => {
//         console.log("Preview props", props);
//         const getVendorSession = async () => {
//             isClick.current = false;
//             let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
//             console.log('data', JSON.parse(data));
//             setVendorSession(JSON.parse(data))
//             let html = HtmlDefault;
//             // if (deviceType == Constant.PHONE) {
//             //     html = props.route.params.data;
//             // } else {
//             //     // if (props.data != "")
//             //     //     html = props.data

//             // }
//             printService.GenHtml(html, JsonContent1).then(res => {
//                 if (res && res != "")
//                     setData(res)
//             })
//         }
//         getVendorSession()
//     }, [])

//     function clickCheck() {
//         console.log("clickCheck vendorSession ", vendorSession)
//         // childRef.current.capture().then(uri => {
//         //     console.log("do something with ", uri);
//         //     setUri(uri);
//         // });
//         captureRef(childRef, {
//             // snapshotContentContainer: true,
//         }).then(
//             uri => {
//                 console.log('Snapshot uri', uri);
//                 setUri(uri);
//                 setTimeout(() => {
//                     Print.printImageFromClient([uri + ""])
//                 }, 100);

//             },
//             error => console.error('Oops, snapshot failed', error)
//         );
//     }

//     async function clickPrint() {
//         console.log("clickPrint data ", data)
//         let getCurrentIP = await getFileDuLieuString(Constant.IPPRINT, true);
//         console.log('getCurrentIP ', getCurrentIP);
//         if (getCurrentIP && getCurrentIP != "") {
//             if (isClick.current == false) {
//                 let html = data.replace("width: 76mm", "")
//                 Print.printImage(html)
//             }
//             isClick.current = true;
//             setTimeout(() => {
//                 isClick.current = false;
//             }, 2000);
//         } else {
//             dialogManager.showPopupOneButton(I18n.t('vui_long_kiem_tra_ket_noi_may_in'), I18n.t('thong_bao'))
//         }
//     }

//     onCapture = uri => {
//         console.log("do something with ", uri);
//         setUri(uri);
//     }

//     const childRef = useRef();

//     return (
//         <View style={{ backgroundColor: "#fff" }}>
//             {deviceType == Constant.PHONE ? <ToolBarPreviewHtml
//                 navigation={props.navigation} title="HTML"
//                 clickPrint={() => clickPrint()}
//                 clickCheck={() => clickCheck()}
//             /> : null}
//             <View style={{opacity: 0}}>
//             <ScrollView

//             // style={{
//             //     // marginBottom: -(BOTTOM_MARGIN_FOR_WATERMARK),
//             //     flex: 1,
//             //     // overflow: 'visible'
//             // }}
//             // contentContainerStyle={{
//             //     flexGrow: 1,
//             // }}
//             // scrollIndicatorInsets={{
//             //     bottom: BOTTOM_MARGIN_FOR_WATERMARK,
//             // }}
//             >
//                 <View
//                     ref={childRef}
//                     style={{
//                         flex: 1, alignItems: "center"
//                     }}>
//                     {/* <ViewShot options={{ snapshotContentContainer: true, height: 800, width: 100 }} style={{ marginTop: 0, height: 300 }} ref={childRef} options={{ format: "jpg", quality: 0.9 }}> */}
//                     {/* <WebView
//                         automaticallyAdjustContentInsets={false}
//                         source={{ html: data }}
//                         style={{ marginTop: 0, flex: 1 }}
//                         onError={syntheticEvent => {
//                             dialogManager.hiddenLoading();
//                         }}
//                         onLoadEnd={syntheticEvent => {
//                             dialogManager.hiddenLoading();
//                         }}
//                     /> */}
//                     {/* <Text>{data}</Text> */}
//                     {/* <HTML html={data} imagesMaxWidth={Dimensions.get('window').width} /> */}
//                     <AutoHeightWebView
//                         scrollEnabled={false}
//                         style={{ width: Dimensions.get('window').width }}
//                         // customScript={`document.body.style.background = 'red';`}

//                         // onSizeUpdated={({size => console.log(size.height)})},
//                         files={[{
//                             href: 'cssfileaddress',
//                             type: 'text/css',
//                             rel: 'stylesheet'
//                         }]}
//                         source={{ html: data }}
//                         scalesPageToFit={true}
//                     // viewportContent={'width=device-width, user-scalable=no'}
//                     /*
//                     other react-native-webview props
//                     */
//                     />
//                     {/* </ViewShot> */}
//                 </View>
//             </ScrollView>
//             </View>




//             <Image source={{ uri: uri }} resizeMode="contain" style={{ position: "absolute", top: 50, width: 100, height: 100, flex: 1 }} />
//         </View>
//     );
// });


import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, ScrollView, NativeEventEmitter, NativeModules, Dimensions } from 'react-native';
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
import AutoHeightWebView from 'react-native-autoheight-webview/autoHeightWebView'
import ModulePrint from './ModulePrint';
import printManager from './PrintManager';
import ViewPrint from './ViewPrint';
const FOOTER_HEIGHT = 21;
const PADDING = 16;
const BOTTOM_MARGIN_FOR_WATERMARK = FOOTER_HEIGHT * PADDING;



export default forwardRef((props, ref) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")

    const [data, setData] = useState("");
    const [vendorSession, setVendorSession] = useState({});
    const [uri, setUri] = useState("");
    let isClick = useRef();

    const deviceType = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common.deviceType
    });

    useEffect(() => {

    }, [])

    useEffect(() => {
        console.log("Preview props", props);
        const getVendorSession = async () => {
            isClick.current = false;
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('data', JSON.parse(data));
            setVendorSession(JSON.parse(data))
            let html = HtmlDefault;
            if (deviceType == Constant.PHONE) {
                html = props.route.params.data;
            } else {
                if (props.data != "")
                    html = props.data

            }
            printService.GenHtml(html, JsonContent1).then(res => {
                if (res && res != "") {
                    if (deviceType == Constant.TABLET)
                        res = res.replace("font-size:16.0px;", "font-size:22.0px;")
                    setData(res)
                }
            })
        }
        getVendorSession()
    }, [props.data])

    useImperativeHandle(ref, () => ({
        clickCheckInRef() {
            clickCheck()
        },
        clickPrintInRef() {
            clickPrint()
        }
    }));

    function clickCheck() {
        console.log("clickCheck vendorSession ", vendorSession)
        console.log("clickCheck vendorSession ", vendorSession)
        let params = {
            printTemplate: {
                Content: deviceType != Constant.PHONE ? props.data : props.route.params.data,
                Id: 0,
                RetailerId: vendorSession.CurrentRetailer.Id,
                Type: 10,
            }
        };
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.PRINT_TEMPLATES).POST(params).then((res) => {
            console.log("clickCheck res ", res);
            dialogManager.hiddenLoading()
            props.navigation.pop();
        }).catch((e) => {
            console.log("clickCheck err ", e);
            dialogManager.hiddenLoading()
        })
    }

    async function clickPrint() {
        console.log("clickPrint data ", data)
        let getCurrentIP = await getFileDuLieuString(Constant.IPPRINT, true);
        console.log('getCurrentIP ', getCurrentIP);
        if (getCurrentIP && getCurrentIP != "") {
            if (isClick.current == false) {
                let html = data.replace("width: 76mm", "")
                viewPrintRef.current.clickCaptureRef();
            }
            isClick.current = true;
            setTimeout(() => {
                isClick.current = false;
            }, 2000);
        } else {
            dialogManager.showPopupOneButton(I18n.t('vui_long_kiem_tra_ket_noi_may_in'), I18n.t('thong_bao'))
        }
    }

    onCapture = uri => {
        console.log("do something with ", uri);
        setUri(uri);
    }
    
    const viewPrintRef = useRef();

    return (
        <View style={{ backgroundColor: "#fff", flex: 1 }}>
            <ViewPrint
                ref={viewPrintRef}
                html={data}
                callback={(uri) => {
                    console.log("callback uri ", uri)
                    // setUri(uri);
                    Print.printImageFromClient([uri + ""])
                }
                }
            />
            {deviceType == Constant.PHONE ? <ToolBarPreviewHtml
                navigation={props.navigation} title="HTML"
                clickPrint={() => clickPrint()}
                clickCheck={() => clickCheck()}
            /> : null}
            <AutoHeightWebView
                // scrollEnabled={false}
                style={{ width: deviceType == Constant.PHONE ? Metrics.screenWidth : Metrics.screenWidth / 2 }}
                files={[{
                    href: 'cssfileaddress',
                    type: 'text/css',
                    rel: 'stylesheet'
                }]}
                source={{ html: data }}
            // scalesPageToFit={true}
            />
        </View>
    );
});
