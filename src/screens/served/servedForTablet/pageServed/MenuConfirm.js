import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import Images from '../../../../theme/Images';
import realmStore from '../../../../data/realm/RealmStore'
import Colors from '../../../../theme/Colors';
import Menu from 'react-native-material-menu';
import I18n from '../../../../common/language/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { currencyToString } from '../../../../common/Utils';
import HtmlDefault from '../../../../data/html/htmlDefault';
import printService from '../../../../data/html/PrintService';
import { getFileDuLieuString } from '../../../../data/fileStore/FileStorage';
import { Constant } from '../../../../common/Constant';
import dialogManager from '../../../../components/dialog/DialogManager';

export default (props) => {

    const [jsonContent, setJsonContent] = useState({})
    const [expand, setExpand] = useState(false)
    let provisional = useRef();


    useLayoutEffect(() => {
        const init = async () => {
            const row_key = `${props.route.params.room.Id}_${props.Position}`
            let serverEvent = await realmStore.queryServerEvents().then(res => res.filtered(`RowKey == '${row_key}'`))
            console.log('serverEvent', JSON.stringify(serverEvent) == "{}");

            if (JSON.stringify(serverEvent) != "{}") {
                console.log("init: ", JSON.stringify(serverEvent));
                setJsonContent(JSON.parse(serverEvent[0].JsonContent))
                serverEvent.addListener((collection, changes) => {
                    setJsonContent(JSON.parse(serverEvent[0].JsonContent))
                })
            }
            provisional.current = await getFileDuLieuString(Constant.PROVISIONAL_PRINT, true);
            console.log('provisional ', provisional.current);
        }
        init()
        return () => {
            realmStore.removeAllListener()
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

    const getTotalPrice = () => {
        let totalPrice = 0;
        let disCount = 0;
        console.log('getTotalPrice', jsonContent.OrderDetails);
        if (jsonContent.OrderDetails && jsonContent.OrderDetails.length > 0) {
            jsonContent.OrderDetails.forEach(element => {
                totalPrice += element.Price * element.Quantity
            });
        }
        return [totalPrice, disCount]
    }

    const changTable = () => {
        if (jsonContent.OrderDetails && jsonContent.OrderDetails.length > 0) {
            props.outputIsChangeTable({ FromRoomId: props.route.params.room.Id, FromPos: props.position, Name: props.route.params.room.Name })
        } else {
            dialogManager.showPopupOneButton("Bạn hãy chọn món ăn trước.")
        }
    }

    const onClickProvisional = () => {
        console.log("onClickProvisional provisional ", provisional.current);
        if (provisional.current && provisional.current == Constant.PROVISIONAL_PRINT) {
            console.log("onClickProvisional ", jsonContent);
            if (jsonContent.OrderDetails && jsonContent.OrderDetails.length > 0)
                printService.PrintHtmlService(HtmlDefault, jsonContent)
            else
                dialogManager.showPopupOneButton("Vui lòng chọn món để sử dụng chức năng này.")
        } else {
            dialogManager.showPopupOneButton("Bạn không có quyền sử dụng chức năng này.")
        }
    }

    return (
        <View style={{ flex: 1 }}>
            {!(jsonContent.OrderDetails && jsonContent.OrderDetails.length > 0) ?
                <ImageBackground resizeMode="contain" source={Images.logo_365} style={{ flex: 1, opacity: .2, margin: 20 }}>
                </ImageBackground>
                :
                <ScrollView style={{ flex: 1 }}>
                    {jsonContent.OrderDetails.map((item, index) => {
                        return (
                            <View key={index} style={[styles.item, { backgroundColor: (index % 2 == 0) ? Colors.backgroundYellow : Colors.backgroundWhite }]}>
                                <Image style={{ width: 20, height: 20, margin: 10 }} source={Images.icon_return} />
                                <View style={{ flexDirection: "column", flex: 1 }}>
                                    <Text style={{ fontWeight: "bold", marginBottom: 7 }}>{item.Name}</Text>
                                    <View style={{ flexDirection: "row" }}>
                                        <Text style={{ fontStyle: "italic" }}>{currencyToString(item.Price)} x</Text>
                                        <Text style={{ color: Colors.colorPhu }}> {item.Quantity} {}</Text>
                                    </View>
                                </View>
                                <View style={{ alignItems: "center", flexDirection: "row" }}>

                                    <Text style={{ padding: 10 }}>{item.Quantity}</Text>

                                </View>
                            </View>
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
                        <Text style={{ fontWeight: "bold", fontSize: 18, color: "#0072bc" }}>{currencyToString(getTotalPrice()[0])}đ</Text>
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
                            <Text style={{ fontSize: 18, color: "#0072bc", marginRight: 30 }}>- {currencyToString(getTotalPrice()[1])}đ</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                            <Text>VAT (%)</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                <Text style={{ fontSize: 18, color: "#0072bc", marginRight: 30 }}>0đ</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                            <Text style={{ fontWeight: "bold" }}>{I18n.t('khach_phai_tra')}</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                <Text style={{ fontWeight: "bold", fontSize: 18, color: "#0072bc", marginRight: 30 }}>{currencyToString(getTotalPrice()[0] - getTotalPrice()[1])}đ</Text>
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
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                        }}>
                            <Text style={{ padding: 10, fontSize: 16, textAlign: "center", borderBottomWidth: .5 }}>Giờ vào: 27/04/2020 08:00</Text>
                            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }} onPress={hideMenu}>
                                <Image style={{ width: 20, height: 20 }} source={Images.icon_notification} />
                                <Text style={{ padding: 10, fontSize: 16 }}>{I18n.t('yeu_cau_thanh_toan')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }} onPress={hideMenu}>
                                <Image style={{ width: 20, height: 20 }} source={Images.icon_notification} />
                                <Text style={{ padding: 10, fontSize: 16 }}>{I18n.t('gui_thong_bao_toi_thu_ngan')}</Text>
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

        </View>
    )

}

const styles = StyleSheet.create({
    item: { flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", padding: 10 },
})