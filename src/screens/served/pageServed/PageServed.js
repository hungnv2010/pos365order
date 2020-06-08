import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TextInput, View, StyleSheet, Picker, Text, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Modal } from 'react-native';
import { Colors, Images, Metrics } from '../../../theme';
import MenuConfirm from './MenuConfirm';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import CustomerOrder from './CustomerOrder';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import dialogManager from '../../../components/dialog/DialogManager';
import I18n from "../../../common/language/i18n"
import signalRManager from '../../../common/SignalR';
import { getFileDuLieuString } from '../../../data/fileStore/FileStorage';
import { Constant } from '../../../common/Constant';
import { Snackbar } from 'react-native-paper';

export default (props) => {

    const [tab, setTab] = useState(1)
    const [textNotify, setTextNotify] = useState("")
    const [vendor, setVendor] = useState({})
    const [showModal, setShowModal] = useState(false)
    const [position, setPosition] = useState(props.position)
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")

    const selectPosition = (position) => {
        setPosition(position)
        setShowModal(false);
    }

    let _menu = null;

    const setMenuRef = ref => {
        _menu = ref;
    };

    const hideMenu = (position) => {
        _menu.hide();
        selectPosition(position)
        setShowModal(true)
    };

    const showMenu = () => {
        _menu.show();
    };

    const outputSendNotify = async (type) => {
        if (type == 1) {
            setTimeout(() => {
                signalRManager.sendMessageOrder(props.route.params.room.Name + ": " + I18n.t('yeu_cau_thanh_toan'))
            }, 100);
        } else {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('data', JSON.parse(data));
            setVendor(JSON.parse(data))
            setTimeout(() => {
                setTextNotify(props.route.params.room.Name + " <Từ: " + vendor.CurrentUser.Name + "> ")
                setShowModal(true)
            }, 100);
        }
    }

    const onClickSendNotify = () => {
        setShowModal(false)
        signalRManager.sendMessageOrder(textNotify)
    }

    return (
        <View style={{ flex: 1 }}>
            <Snackbar
                duration={5000}
                visible={showToast}
                onDismiss={() =>
                    setShowToast(false)
                }
            >
                {toastDescription}
            </Snackbar>
            <View style={{ backgroundColor: Colors.colorchinh, alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingBottom: 5 }}>
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <Text style={{ paddingLeft: 20, textTransform: "uppercase", color: "white", fontWeight: "bold" }}>{props.route && props.route.params && props.route.params.room && props.route.params.room.Name ? props.route.params.room.Name : ""}</Text>
                </View>
                <TouchableOpacity onPress={showMenu} style={{ flex: 1, paddingHorizontal: 20, flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
                    <Menu
                        style={{ width: 50 }}
                        ref={setMenuRef}
                        button={<Text style={{ color: "white", fontWeight: "bold" }} onPress={showMenu}>{position}</Text>}
                    >
                        <MenuItem onPress={() => hideMenu("A")}>A</MenuItem>
                        <MenuItem onPress={() => hideMenu("B")}>B</MenuItem>
                        <MenuItem onPress={() => hideMenu("C")}>C</MenuItem>
                        <MenuItem onPress={() => hideMenu("D")}>D</MenuItem>
                    </Menu>
                    <Icon style={{}} name="chevron-down" size={20} color="white" />
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2, borderColor: Colors.colorchinh, borderWidth: 0.5 }}>
                <TouchableOpacity onPress={() => setTab(1)} style={{ paddingVertical: 8, flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: tab == 1 ? Colors.colorchinh : "#fff", paddingHorizontal: 20, flexDirection: "row" }}>
                    <Text style={{ color: tab == 1 ? "white" : Colors.colorchinh, fontWeight: "bold" }}>Thực đơn đã gọi</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTab(2)} style={{ paddingVertical: 8, flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: tab == 2 ? Colors.colorchinh : "#fff", paddingHorizontal: 20, flexDirection: "row" }}>
                    <Text style={{ color: tab == 2 ? "white" : Colors.colorchinh, fontWeight: "bold" }}>Món đã xác nhận</Text>
                </TouchableOpacity>
            </View>
            {tab == 1 ?
                <CustomerOrder Position={position} {...props} outputSendNotify={(type) => outputSendNotify(type)} />
                :
                <MenuConfirm Position={position} {...props} outputSendNotify={(type) => outputSendNotify(type)} />
            }
            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => setShowModal(false)}
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
                            padding: 5,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                            width: Metrics.screenWidth * 0.8
                        }}>
                            <TouchableOpacity onPress={() => selectPosition("A")}>
                                <Text style={{ margin: 10, fontSize: 16, fontWeight: "bold" }}>Gửi tin nhắn</Text>
                            </TouchableOpacity>
                            <View style={{ padding: 5, height: 40, borderRadius: 3, borderColor: Colors.colorchinh, borderWidth: 1, backgroundColor: "#fff", flexDirection: "row", margin: 10 }}>
                                <TextInput value={textNotify} style={{ width: "100%", height: "100%" }}
                                    autoFocus={true}
                                    onChangeText={(text) => setTextNotify(text)}
                                />
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                <TouchableOpacity onPress={() => setShowModal(false)}>
                                    <Text style={{ margin: 10, fontSize: 16 }}>{I18n.t('huy')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => onClickSendNotify()}>
                                    <Text style={{ margin: 10, fontSize: 16 }}>{I18n.t('dong_y')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View >
    );
}
