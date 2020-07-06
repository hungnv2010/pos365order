import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, NativeModules, Modal, TouchableWithoutFeedback } from 'react-native';
import Images from '../../../../theme/Images';
import realmStore from '../../../../data/realm/RealmStore'
import Colors from '../../../../theme/Colors';
import Menu from 'react-native-material-menu';
import I18n from '../../../../common/language/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HtmlDefault from '../../../../data/html/htmlDefault';
import printService from '../../../../data/html/PrintService';
import { getFileDuLieuString } from '../../../../data/fileStore/FileStorage';
import { Constant } from '../../../../common/Constant';
import dialogManager from '../../../../components/dialog/DialogManager';
import { StackActions } from '@react-navigation/native';
import { Snackbar } from 'react-native-paper';
import ViewPrint from '../../../more/ViewPrint';
const { Print } = NativeModules;
import { dateToDate, DATE_FORMAT, currencyToString } from '../../../../common/Utils';
import { Metrics } from '../../../../theme';
import { ReturnProduct } from '../../ReturnProduct';


export default (props) => {

    const [showModal, setShowModal] = useState(false)
    const [itemProduct, setItemProduct] = useState("")
    const [data, setData] = useState("");
    const [jsonContent, setJsonContent] = useState({})
    const [expand, setExpand] = useState(false)
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [vendorSession, setVendorSession] = useState({});
    let provisional = useRef();
    let serverEvent = null;
    let listPos = [
        { name: "A", status: false },
        { name: "B", status: false },
        { name: "C", status: false },
        { name: "D", status: false },
    ]

    useLayoutEffect(() => {
        const init = async () => {
            serverEvent = await realmStore.queryServerEvents()
            listPos.forEach((item, index) => {
                const row_key = `${props.route.params.room.Id}_${item.name}`
                let serverEventPos = serverEvent.filtered(`RowKey == '${row_key}'`)
                if (JSON.stringify(serverEventPos) != "{}" && JSON.parse(serverEventPos[0].JsonContent).OrderDetails.length > 0) {
                    item.status = true
                    if (item.name == props.Position) {
                        serverEvent = serverEventPos
                        setJsonContent(JSON.parse(serverEvent[0].JsonContent))
                        serverEvent.addListener((collection, changes) => {
                            setJsonContent(JSON.parse(serverEvent[0].JsonContent))
                        })
                    }
                }
            })
            props.outputListPos(listPos)
            provisional.current = await getFileDuLieuString(Constant.PROVISIONAL_PRINT, true);
            console.log('provisional ', provisional.current);

            const getVendorSession = async () => {
                let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
                console.log('ReturnProduct data', JSON.parse(data));
                setVendorSession(JSON.parse(data))
            }
            getVendorSession();

        }
        init()
        return () => {
            if (serverEvent) serverEvent.removeAllListeners()
            setJsonContent({})
        }
    }, [props.Position])



    let _menu = null;

    const setMenuRef = ref => {
        _menu = ref;
    };

    const hideMenu = () => {
        _menu.hide();
    };

    const showMenu = () => {
        _menu.show();
    };


    const getPriceItem = (item) => {
        return item.Quantity * item.Price
    }



    const changTable = () => {
        if (jsonContent.OrderDetails && jsonContent.OrderDetails.length > 0) {
            const pushAction = StackActions.push('Main', {
                FromRoomId: props.route.params.room.Id,
                FromPos: props.Position,
                Name: props.route.params.room.Name
            });

            props.navigation.dispatch(pushAction);
        } else {
            dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
        }
    }

    const onClickProvisional = async () => {
        console.log("onClickProvisional provisional ", provisional.current);
        let getCurrentIP = await getFileDuLieuString(Constant.IPPRINT, true);
        console.log('getCurrentIP ', getCurrentIP);
        if (getCurrentIP && getCurrentIP != "") {
            if (provisional.current && provisional.current == Constant.PROVISIONAL_PRINT) {
                console.log("onClickProvisional ", jsonContent);
                if (jsonContent.OrderDetails && jsonContent.OrderDetails.length > 0) {
                    // printService.PrintHtmlService(HtmlDefault, jsonContent)
                    printService.GenHtml(HtmlDefault, jsonContent).then(res => {
                        if (res && res != "") {
                            setData(res)
                        }
                        setTimeout(() => {
                            viewPrintRef.current.clickCaptureRef();
                        }, 500);

                    })

                }
                else
                    dialogManager.showPopupOneButton(I18n.t("ban_hay_chon_mon_an_truoc"))
            } else {
                dialogManager.showPopupOneButton(I18n.t("ban_khong_co_quyen_su_dung_chuc_nang_nay"))
            }
        } else {
            dialogManager.showPopupOneButton(I18n.t('vui_long_kiem_tra_ket_noi_may_in'), I18n.t('thong_bao'))
        }

    }

    const sendNotidy = (type) => {
        console.log("sendNotidy type ", type);
        hideMenu();
        if (type == 1 && !(jsonContent.OrderDetails && jsonContent.OrderDetails.length > 0)) {
            setToastDescription(I18n.t("ban_hay_chon_mon_an_truoc"))
            setShowToast(true)
        } else
            props.outputSendNotify(type);
    }

    const viewPrintRef = useRef();
    const renderItem = (item, index) => {
        return (
            <TouchableOpacity onPress={() => {
                console.log("itemProduct ", itemProduct);
                setItemProduct(item)
                setTimeout(() => {
                    setShowModal(true);
                }, 500);

            }} key={index} style={[styles.item, { backgroundColor: (index % 2 == 0) ? Colors.backgroundYellow : Colors.backgroundWhite }]}>
                {
                    item.ProductType == 2 && item.IsTimer ?
                        <Icon style={{ margin: 5 }} name="clock-outline" size={30} color={Colors.colorchinh} />
                        :
                        <Image style={{ width: 22, height: 22, margin: 5 }} source={Images.icon_return} />
                }
                <View style={{ flexDirection: "column", flex: 1 }}>
                    <Text style={{ fontWeight: "bold", marginBottom: 7 }}>{item.Name}</Text>
                    <View style={{ flexDirection: "row" }}>
                        <Text style={{ fontStyle: "italic" }}>{currencyToString(item.BasePrice)} x</Text>
                        <Text style={{ color: Colors.colorPhu }}> {Math.round(item.Quantity * 1000) / 1000}</Text>
                    </View>
                    {item.Description != "" ?
                        <Text style={{ fontStyle: "italic", fontSize: 11, color: "gray" }}>
                            {item.Description}
                        </Text>
                        :
                        null}
                </View>
                <Text style={{ fontWeight: "bold", color: Colors.colorchinh }}>{currencyToString(getPriceItem(item))}</Text>
            </TouchableOpacity>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <ViewPrint
                ref={viewPrintRef}
                html={data}
                callback={(uri) => {
                    console.log("callback uri ", uri)

                    Print.printImageFromClient([uri + ""])
                }
                }
            />
            {!(jsonContent.OrderDetails && jsonContent.OrderDetails.length > 0) ?
                <View style={{ alignItems: "center", flex: 1 }}>
                    <ImageBackground resizeMode="contain" source={Images.logo_365_long_color} style={{ flex: 1, opacity: 0.7, margin: 20, width: Metrics.screenWidth / 2 }}>
                    </ImageBackground>
                </View>
                :
                <ScrollView style={{ flex: 1 }}>
                    {jsonContent.OrderDetails.map((item, index) => {
                        return (
                            renderItem(item, index)
                        )
                    })
                    }
                </ScrollView >
            }
            <TouchableOpacity
                onPress={() => { setExpand(!expand) }}
                style={{ borderTopWidth: .5, borderTopColor: "red", paddingVertical: 3, backgroundColor: "white" }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                    <Text style={{ fontWeight: "bold" }}>{I18n.t('tong_thanh_tien')}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                        <Text style={{ fontWeight: "bold", fontSize: 16, color: "#0072bc" }}>{currencyToString(jsonContent.Total)}đ</Text>
                        {expand ?
                            <Icon style={{}} name="chevron-down" size={30} color="black" />
                            :
                            <Icon style={{}} name="chevron-up" size={30} color="black" />
                        }
                    </View>
                </View>
                {expand ?
                    <>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                            <Text>{I18n.t('tong_chiet_khau')}</Text>
                            <Text style={{ fontSize: 16, color: "#0072bc", marginRight: 30 }}>- {currencyToString(jsonContent.Discount)}đ</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                            <Text>VAT ({jsonContent.VATRates} %)</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                <Text style={{ fontSize: 16, color: "#0072bc", marginRight: 30 }}>{jsonContent.VAT ? jsonContent.VAT : 0}đ</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                            <Text style={{ fontWeight: "bold" }}>{I18n.t('khach_phai_tra')}</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                <Text style={{ fontWeight: "bold", fontSize: 16, color: "#0072bc", marginRight: 30 }}>{currencyToString(jsonContent.TotalPayment)}đ</Text>
                            </View>
                        </View>
                    </>
                    :
                    null
                }
            </TouchableOpacity>
            <View style={{ height: 40, flexDirection: "row", backgroundColor: "#0072bc", alignItems: "center" }}>
                <TouchableOpacity
                    onPress={showMenu}>
                    <Menu
                        ref={setMenuRef}
                        button={<Icon style={{ paddingHorizontal: 10 }} name="menu" size={30} color="white" />}
                    >
                        <View style={{
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 5,
                        }}>
                            <TouchableOpacity onPress={() => sendNotidy(1)} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <MaterialIcons style={{ paddingHorizontal: 7 }} name="notifications" size={26} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('yeu_cau_thanh_toan')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => sendNotidy(2)} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <Icon style={{ paddingHorizontal: 10 }} name="message" size={22} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('gui_thong_bao_toi_thu_ngan')}</Text>
                            </TouchableOpacity>
                        </View>
                    </Menu>
                </TouchableOpacity>
                <TouchableOpacity onPress={changTable} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>{I18n.t('chuyen_ban')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { onClickProvisional() }} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>{I18n.t('tam_tinh')}</Text>
                </TouchableOpacity>
            </View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => { setShowModal(false) }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}>
                        <View style={[{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }, { backgroundColor: 'rgba(0,0,0,0.5)' }]}></View>

                    </TouchableWithoutFeedback>
                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                        <View style={{
                            padding: 0,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                            width: Metrics.screenWidth * 0.8,
                            marginBottom: Platform.OS == 'ios' ? Metrics.screenHeight / 10 : 0
                        }}>
                            <ReturnProduct
                                Name={itemProduct.Name}
                                Quantity={itemProduct.Quantity}
                                vendorSession={vendorSession}
                                getDataOnClick={(data) => {
                                    console.log("getDataOnClick ", data);
                                    mapDataToList(data)
                                }}
                                setShowModal={() => {
                                    setShowModal(false)
                                }
                                } />
                        </View>
                    </View>
                </View>
            </Modal>
            <Snackbar
                duration={5000}
                visible={showToast}
                onDismiss={() =>
                    setShowToast(false)
                }
            >
                {toastDescription}
            </Snackbar>
        </View>
    )

}

const styles = StyleSheet.create({
    item: { flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", padding: 5 },
})