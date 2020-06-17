import React, { useEffect, useState } from 'react';
import { Image, View, StyleSheet, TouchableWithoutFeedback, Text, TouchableOpacity, NativeModules, Modal, TextInput, Linking } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import { setFileLuuDuLieu, getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import realmStore from '../../data/realm/RealmStore';
import I18n from '../../common/language/i18n'
import { Switch, Snackbar } from 'react-native-paper';
import dialogManager from '../../components/dialog/DialogManager';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import { CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import colors from '../../theme/Colors';
const { Print } = NativeModules;
const IP_DEFAULT = "192.168.99.";

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")

    const handlerToast = (text) => {
        setToastDescription(text)
        setShowToast(true)
    }

    return (
        <View style={{ flex: 1 }}>
            <HeaderComponent {...props} showToast={(text) => handlerToast(text)} />
            <ContentComponent {...props} />
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
            </View>
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
    );
};

const HeaderComponent = (props) => {

    const [Logo, setLogo] = useState("");
    const [Name, setName] = useState("");
    const [Branch, setBranch] = useState({});
    const [vendorSession, setVendorSession] = useState({});
    const [showModal, setShowModal] = useState(false);


    useEffect(() => {
        const getVendorSession = async () => {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('HeaderComponent data', JSON.parse(data));
            data = JSON.parse(data)
            setVendorSession(data);
            if (data.CurrentRetailer && data.CurrentRetailer.Logo) {
                setLogo(data.CurrentRetailer.Logo)
            }
            if (data.CurrentRetailer && data.CurrentRetailer.Name) {
                setName(data.CurrentRetailer.Name)
            }

            let branch = await getFileDuLieuString(Constant.CURRENT_BRANCH, true);
            if (branch) {
                console.log('HeaderComponent branch', JSON.parse(branch));
                setBranch(JSON.parse(branch))
            } else {
                setBranch(data.Branchs[0])
            }

            // let CurrentBranch = data.Branchs.filter(item => item.Id == data.CurrentBranchId)
            // console.log("CurrentBranch ", CurrentBranch);
            // if (CurrentBranch.length == 1) {
            //     CurrentBranch = CurrentBranch[0]
            //     setBranch(CurrentBranch)
            // } else if (CurrentBranch.length > 1) {

            // }
        }
        getVendorSession()
    }, [])

    useEffect(() => {

    }, [Logo])

    const onClickBranh = () => {
        console.log("onClickBranh ", vendorSession);

        if (vendorSession.Branchs.length > 1) {
            setShowModal(true)
        } else {
            props.showToast(I18n.t('ban_dang_co_it_hon_hai_chi_nhanh'))
        }
    }

    const onClickItemBranch = (item) => {
        console.log("onClickItemBranch ", item);
        setShowModal(false)
        let params = { branchId: item.Id }
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.CHANGE_BRANCH).POST(params).then((res) => {
            console.log("onClickItemBranch res ", res);
            setFileLuuDuLieu(Constant.CURRENT_BRANCH, JSON.stringify(item));
            setBranch(item)
            dialogManager.hiddenLoading()
        }).catch((e) => {
            console.log("onClickItemBranch err ", e);
            dialogManager.hiddenLoading()
        })
    }

    const onClickLogOut = () => {
        realmStore.deleteAll()
        setFileLuuDuLieu(Constant.CURRENT_ACCOUNT, "");
        setFileLuuDuLieu(Constant.CURRENT_BRANCH, "");
        // props.navigation.navigate('Login', { param: "logout" })
        // let rememberAccount = await getFileDuLieuString(Constant.REMEMBER_ACCOUNT, true);
        // console.log('rememberAccount = ', rememberAccount);
        props.navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    { name: 'Login', params: { param: "logout" } },
                ],
            })
        )
    }

    return (
        <View style={{ backgroundColor: Colors.colorchinh, justifyContent: "space-between", flexDirection: "row", alignItems: "center", padding: 20 }}>
            <View >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {
                        Logo != "" ?
                            <Image key="1" resizeMethod="scale"
                                source={{ uri: Logo }}
                                style={[{ width: 50, height: 50, marginRight: 20, borderRadius: 25, borderWidth: 2 }]} />
                            :
                            <Image key="2" source={Images.icon_person} style={[{ width: 50, height: 50, marginRight: 20 }]} />
                    }
                    <Text style={{ marginTop: 10, color: "#fff" }}>{Name}</Text>
                </View>
                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", marginTop: 15 }} onPress={() => onClickBranh()}>
                    <Icon name="location-on" size={20} color="#fff" />
                    {/* <Image source={Images.icon_placeholder} style={[{ width: 10, height: 17, marginRight: 5 }]} /> */}
                    <Text style={{ color: "#fff" }}>{Branch.Name && Branch.Name != "" ? Branch.Name : I18n.t('chi_nhanh')}</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => onClickLogOut()}>
                <Text style={{ textDecorationLine: "underline", color: "#fff" }}>{I18n.t('logout')}</Text>
            </TouchableOpacity>
            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setShowModal(false)
                        }}
                    >
                        <View style={[{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'
                        }]}></View>

                    </TouchableWithoutFeedback>
                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                        <View style={{
                            padding: 5,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                            width: Metrics.screenWidth * 0.8
                        }}>
                            <View style={{ padding: 10 }}>
                                <Text style={{ marginBottom: 15, fontSize: 18, fontWeight: 'bold' }}>{I18n.t('chon_chi_nhanh')}</Text>
                                {
                                    vendorSession.Branchs && vendorSession.Branchs.length > 0 ?
                                        vendorSession.Branchs.map(item => (
                                            <TouchableOpacity onPress={() => onClickItemBranch(item)}>
                                                <Text style={{ paddingVertical: 12 }}>{item.Name}</Text>
                                            </TouchableOpacity>
                                        ))
                                        : null
                                }
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>

    )
}

const ContentComponent = (props) => {

    const [showModal, setShowModal] = useState(false);
    const [ipInput, setIpInput] = useState(IP_DEFAULT);
    const [ip, setIp] = useState(IP_DEFAULT);
    const [isSwitchOn, setSwitchOn] = useState(false);
    const [paperSize, setPaperSize] = useState("");

    useEffect(() => {
        const getCurrentIP = async () => {
            let getCurrentIP = await getFileDuLieuString(Constant.IPPRINT, true);
            console.log('getCurrentIP ', getCurrentIP);
            if (getCurrentIP && getCurrentIP != "") {
                setIp(getCurrentIP)
            }
            let provisional = await getFileDuLieuString(Constant.PROVISIONAL_PRINT, true);
            console.log('provisional ', provisional);
            if (provisional && provisional != "" && provisional == Constant.PROVISIONAL_PRINT) {
                setSwitchOn(true);
            }
        }
        getCurrentIP()
    }, [])

    const onClickLogOut = () => {
        realmStore.deleteAll()
        setFileLuuDuLieu(Constant.CURRENT_ACCOUNT, "");
        setFileLuuDuLieu(Constant.CURRENT_BRANCH, "");
        // props.navigation.navigate('Login', { param: "logout" })
        props.navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    { name: 'Login', params: { param: "logout" } },
                ],
            })
        )
    }

    const onClickSaveIP = () => {
        if (ipInput.length > 11) {
            setIp(ipInput)
            setFileLuuDuLieu(Constant.IPPRINT, ipInput)
            Print.registerPrint(ipInput)
        }
        setShowModal(false)
    }

    const onClickHotLine = () => {
        let phone_number = "tel:" + Constant.HOTLINE;
        Linking.openURL(phone_number);
    }

    return (
        <View>
            <View style={{ padding: 20, borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
                <Text style={{ color: Colors.colorchinh, fontSize: 18 }}>{I18n.t('ket_noi_may_in')}</Text>
                <TouchableOpacity onPress={() => {
                    setShowModal(true)
                }}>
                    <Text style={{ marginTop: 20 }}>{I18n.t('may_in_tam_tinh')} ({I18n.t('qua_mang_lan')} {ip})</Text>
                </TouchableOpacity>
            </View>
            <View style={{ padding: 20, borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
                <Text style={{ color: Colors.colorchinh, fontSize: 18 }}>{I18n.t('cai_dat_may_in')}</Text>
                <TouchableOpacity onPress={() => { 
                    props.navigation.navigate("PrintHtml")
                    // props.navigation.navigate("PrintWebview")
                 }}>
                    <Text style={{ marginTop: 20 }}>HTML print</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: "row", marginTop: 15, alignItems: "center" }}>
                    <View style={{ flex: 1, flexDirection: "column", height: 40, justifyContent: "center" }}>
                        <Text style={{ textAlign: "left", }}>{I18n.t('in_tam_tinh')}</Text>
                    </View>
                    <Switch
                        color={Colors.colorchinh}
                        value={isSwitchOn}
                        onValueChange={() => {
                            if (isSwitchOn == false)
                                setFileLuuDuLieu(Constant.PROVISIONAL_PRINT, Constant.PROVISIONAL_PRINT)
                            else
                                setFileLuuDuLieu(Constant.PROVISIONAL_PRINT, "")
                            setSwitchOn(!isSwitchOn)
                        }
                        }
                    />
                </View>
            </View>
            <View style={{ padding: 20, borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
                <TouchableOpacity onPress={() => onClickHotLine()}>
                    <Text style={{ marginTop: 0 }}>{I18n.t('ho_tro')} <Text style={{ color: colors.colorLightBlue }}>{Constant.HOTLINE}</Text></Text>
                </TouchableOpacity>
            </View>
            <View style={{ padding: 20, borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
                <TouchableOpacity onPress={() => onClickLogOut()}>
                    <Text style={{ marginTop: 0 }}>{I18n.t('logout')}</Text>
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
                        onPress={() => {
                            setShowModal(false)
                        }}
                    >
                        <View style={[{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'
                        }]}></View>
                    </TouchableWithoutFeedback>
                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                        <View style={{
                            padding: 5,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                            width: Metrics.screenWidth * 0.8
                        }}>
                            <View style={{ padding: 10 }}>
                                <Text style={{ marginBottom: 15, fontSize: 18, fontWeight: 'bold' }}>IP connect</Text>
                                <TextInput style={{ padding: 10, borderRadius: 5, borderWidth: 1, borderColor: Colors.colorchinh }} onChangeText={(text) => setIpInput(text)} value={ipInput} placeholder="Địa chỉ ip" />
                                <TextInput style={{ padding: 10, borderRadius: 5, borderWidth: 1, borderColor: Colors.colorchinh, marginTop: 15 }} onChangeText={(text) => setPaperSize(text)} value={paperSize} placeholder="Khổ giấy 58..80" />
                                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                    <TouchableOpacity style={{ alignItems: "flex-end", marginTop: 15 }} onPress={() => {
                                        setShowModal(false)
                                    }}>
                                        <Text style={{ margin: 5, fontSize: 16, fontWeight: "500", marginRight: 15, color: "red" }}>{I18n.t('huy')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ alignItems: "flex-end", marginTop: 15 }} onPress={() => onClickSaveIP()}>
                                        <Text style={{ margin: 5, fontSize: 16, fontWeight: "500" }}>{I18n.t('dong_y')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}
