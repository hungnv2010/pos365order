import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import {
    View, Text, Image,
    StyleSheet, TouchableOpacity, TextInput,
} from "react-native";
import { Snackbar, } from "react-native-paper";
import I18n from '../../common/language/i18n';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Images, Colors, Metrics } from "../../theme";
import { Constant } from "../../common/Constant";
import { ApiPath } from "../../data/services/ApiPath";
import { HTTPService, getHeaders, URL } from "../../data/services/HttpService";
import { useSelector, useDispatch } from 'react-redux';
import { saveDeviceInfoToStore, updateStatusLogin, saveCurrentBranch, saveNotificationCount } from "../../actions/Common";
import useDidMountEffect from '../../customHook/useDidMountEffect';
import { getFileDuLieuString, setFileLuuDuLieu } from "../../data/fileStore/FileStorage";
import dialogManager from '../../components/dialog/DialogManager';


let error = "";

const LoginScreen = (props) => {
    const [extraHeight, setExtraHeight] = useState(0);
    const [shop, setShop] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [logIn, setLogIn] = useState(false);
    const [hasLogin, setHasLogin] = useState(true);
    const dispatch = useDispatch();



    useEffect(() => {
        const getCurrentAccount = async () => {
            let currentAccount = await getFileDuLieuString(Constant.CURRENT_ACCOUNT, true);
            console.log('currentAccount', typeof currentAccount);
            if (currentAccount && currentAccount != "") {
                currentAccount = JSON.parse(currentAccount);
                URL.link = "https://" + currentAccount.Link + ".pos365.vn/";
                dispatch(saveDeviceInfoToStore({ SessionId: currentAccount.SessionId }))
                getRetailerInfoAndNavigate();
            } else {
                setTimeout(() => {
                    setHasLogin(false)
                }, 2000);
            }
        }
        getCurrentAccount()
    }, [])

    useLayoutEffect(() => {
        if (props.route.params && props.route.params.param == "logout") {
            console.log("LOGOUT");
            setHasLogin(false)
        }
    }, [(props) => props.route.params])

    const onClickLogin = useCallback(() => {
        if (logIn) {
            if (!checkDataLogin()) {
                return
            } else {
                dialogManager.showLoading();
                URL.link = "https://" + shop + ".pos365.vn/";
                console.log("onClickLogin URL ", URL, shop);
                let params = { UserName: userName, Password: password };
                new HTTPService().setPath(ApiPath.LOGIN).POST(params, getHeaders({}, true)).then((res) => {
                    console.log("onClickLogin res ", res);
                    if (res.SessionId && res.SessionId != "") {
                        dispatch(saveDeviceInfoToStore({ SessionId: res.SessionId }))
                        handlerLoginSuccess(params, res);
                    }
                    if (res.status == 401) {
                        dialogManager.hiddenLoading();
                        error = I18n.t('loi_dang_nhap');
                        setShowToast(true)
                    }
                }).catch((e) => {
                    dialogManager.hiddenLoading();
                    error = I18n.t('loi_server');
                    setShowToast(true);
                    console.log("onClickLogin err ", e);
                })
            }
        }
        else {
            return
        }
    }, [logIn])

    useEffect(() => {
        onClickLogin()
        return () => {
            setLogIn(false)
        }
    }, [onClickLogin])

    const handlerLoginSuccess = (params, res) => {
        let account = { SessionId: res.SessionId, UserName: params.UserName, Link: shop };
        setFileLuuDuLieu(Constant.CURRENT_ACCOUNT, JSON.stringify(account));
        getRetailerInfoAndNavigate();
    }

    const getRetailerInfoAndNavigate = () => {
        let inforParams = {};
        new HTTPService().setPath(ApiPath.VENDOR_SESSION).GET(inforParams, getHeaders()).then((res) => {
            console.log("getDataRetailerInfo res ", res);
            setFileLuuDuLieu(Constant.VENDOR_SESSION, JSON.stringify(res))

            if (res.CurrentUser && res.CurrentUser.IsAdmin == true) {
                props.navigation.navigate("Home")
            } else {
                error = I18n.t('ban_khong_co_quyen_truy_cap');
                setShowToast(true)
            }
            dialogManager.hiddenLoading();
        }).catch((e) => {
            dialogManager.hiddenLoading();
            console.log("getDataRetailerInfo err ", e);
        })
    }


    const onChangeText = (text, type) => {
        if (type == 1) {
            setShop(text)
        } else if (type == 2) {
            setUserName(text)
        } else if (type == 3) {
            setPassword(text)
        }
    }


    const checkDataLogin = () => {
        if (shop == '') {
            error = I18n.t('quy_khach_vui_long_nhap_ten_cua_hang');
            setShowToast(true)
            return false;
        } else if (userName == '') {
            error = I18n.t('quy_khach_vui_long_nhap_ten_tai_khoan');
            setShowToast(true)
            return false;
        } else if (password == '') {
            error = I18n.t('quy_khach_vui_long_nhap_mat_khau');
            setShowToast(true)
            return false;
        }
        return true;
    }

    if (hasLogin) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", }}>
                <Text>INTRO</Text>
            </View>
        );
    }

    return (
        <LinearGradient
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            colors={['#FFAB40', '#FF5722']}
            style={{ flex: 1 }}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>

                <KeyboardAwareScrollView style={{}} enableOnAndroid={true} extraHeight={extraHeight}
                    showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={{ flex: 1, height: Metrics.screenHeight - 60, justifyContent: 'center', alignItems: 'center' }}>
                        <Image style={{ height: 70, width: 225, marginBottom: 50 }} resizeMethod="scale" source={Images.logo_365_boss_white} />
                        <View style={[styles.inputtext, { flexDirection: "row", alignItems: "center" }]}>
                            <Image style={{ height: 24, width: 24, margin: 10 }} resizeMethod="auto" source={Images.icon_shop} />
                            <TextInput
                                onChangeText={text => onChangeText(text, 1)}
                                value={shop}
                                onFocus={() => { setExtraHeight(270) }}
                                keyboardType={"default"}
                                style={{ height: 40, flex: 1, marginRight: 5 }}
                                placeholder={I18n.t('ten_cua_hang')} />
                            <Text style={{ opacity: 0.5 }}>.pos365.vn</Text>
                        </View>
                        <View style={[styles.inputtext, { flexDirection: "row", alignItems: "center" }]}>
                            <Image style={{ height: 24, width: 24, margin: 10 }} resizeMethod="auto" source={Images.icon_user_name} />
                            <TextInput
                                onChangeText={text => onChangeText(text, 2)}
                                value={userName}
                                onFocus={() => { setExtraHeight(200) }}
                                keyboardType={"default"}
                                style={{ height: 40, flex: 1 }}
                                placeholder={I18n.t('ten_dang_nhap')} />
                        </View>
                        <View style={[styles.inputtext, { flexDirection: "row", alignItems: "center" }]}>
                            <Image style={{ height: 24, width: 24, margin: 10 }} resizeMethod="auto" source={Images.icon_password} />
                            <TextInput
                                onChangeText={text => onChangeText(text, 3)}
                                value={password}
                                onFocus={() => { setExtraHeight(130) }}
                                keyboardType={"default"}
                                style={{ height: 40, margin: 0, flex: 1 }}
                                placeholder={I18n.t('mat_khau')}
                                secureTextEntry={true} />
                        </View>
                        <View style={{}}>
                            <TouchableOpacity style={{ height: 50, width: Metrics.screenWidth - 50, marginTop: 30, borderColor: "#fff", borderWidth: 1, borderRadius: 5, justifyContent: "center", alignItems: "center" }}
                                onPress={() => { setLogIn(!logIn) }}>
                                <Text style={{ color: "#fff", fontWeight: 'bold' }}>{I18n.t("man_hinh_thu_ngan").toUpperCase()}</Text>
                            </TouchableOpacity><TouchableOpacity style={{ height: 50, width: Metrics.screenWidth - 50, marginTop: 15, borderColor: "#fff", borderWidth: 1, borderRadius: 5, justifyContent: "center", alignItems: "center" }}
                                onPress={() => { }}>
                                <Text style={{ color: "#fff", fontWeight: 'bold' }}>{I18n.t("nhan_vien_order").toUpperCase()}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 0 }}>
                        <Text style={{ color: "#fff" }}>{I18n.t("tong_dai_ho_tro")} 24/7</Text>
                        <TouchableOpacity onPress={() => { }} style={{ flexDirection: "row", marginTop: 7, marginBottom: 10 }}>
                            <Image source={Images.icon_phone_header} style={{ width: 20, height: 20, marginRight: 7 }} />
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>{Constant.HOTLINE}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>

                <Snackbar
                    duration={5000}
                    visible={showToast}
                    onDismiss={() => setShowToast(false)}
                >
                    {error}
                </Snackbar>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    inputtext: {
        backgroundColor: "#FFA951",
        margin: 10, padding: 10, borderColor: Colors.colorchinh, borderRadius: 5, borderWidth: 1, height: 50, width: Metrics.screenWidth - 50
    }
});

export default React.memo(LoginScreen)