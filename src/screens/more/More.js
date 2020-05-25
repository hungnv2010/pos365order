import React, { useEffect, useState } from 'react';
import { Image, View, StyleSheet, TouchableWithoutFeedback, Text, TouchableOpacity, NativeModules, Modal, TextInput } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import { setFileLuuDuLieu, getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import realmStore from '../../data/realm/RealmStore';
const { Print } = NativeModules;
const IP_DEFAULT = "192.168.99.";

export default (props) => {

    return (
        <View style={{ flex: 1 }}>
            <HeaderComponent />
            <ContentComponent {...props} />
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
            </View>
        </View>
    );
};

const HeaderComponent = () => {

    const [Logo, setLogo] = useState("");
    const [Name, setName] = useState("");
    const [Branch, setBranch] = useState({});

    useEffect(() => {
        const getVendorSession = async () => {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('data', JSON.parse(data));
            data = JSON.parse(data)
            if (data.CurrentRetailer && data.CurrentRetailer.Logo) {
                setLogo(data.CurrentRetailer.Logo)
            }
            if (data.CurrentRetailer && data.CurrentRetailer.Name) {
                setName(data.CurrentRetailer.Name)
            }

            let CurrentBranch = data.Branchs.filter(item => item.Id == data.CurrentBranchId)
            console.log("CurrentBranch ", CurrentBranch);
            if (CurrentBranch.length == 1) {
                CurrentBranch = CurrentBranch[0]
                setBranch(CurrentBranch)
            }
        }
        getVendorSession()
    }, [])

    useEffect(() => {

    }, [Logo])

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

                    <Text style={{ marginTop: 10 }}>{Name}</Text>
                </View>
                <Text style={{ marginTop: 15 }}>{Branch.Name && Branch.Name != "" ? Branch.Name : 'Chi nhánh'}</Text>
            </View>
            <Text style={{ textDecorationLine: "underline" }}>Đăng xuất</Text>
        </View>

    )
}

const ContentComponent = (props) => {

    const [showModal, setShowModal] = useState(false);
    const [ip, setIp] = useState(IP_DEFAULT);

    useEffect(() => {
        const getCurrentIP = async () => {
            let getCurrentIP = await getFileDuLieuString(Constant.IPPRINT, true);
            console.log('getCurrentIP ', getCurrentIP);
            if (getCurrentIP && getCurrentIP != "") {
                setIp(getCurrentIP)
            }
        }
        getCurrentIP()
    }, [])

    const onClickLogOut = () => {
        realmStore.deleteAll()
        setFileLuuDuLieu(Constant.CURRENT_ACCOUNT, "");
        props.navigation.navigate('Login', { param: "logout" })
    }

    const onClickSaveIP = () => {
        if (ip.length > 11) {
            setFileLuuDuLieu(Constant.IPPRINT, ip)
            Print.registerPrint(ip)
        }
        setShowModal(false)
    }

    return (
        <View>
            <View style={{ padding: 20, borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
                <Text style={{ color: Colors.colorchinh, fontSize: 18 }}>Print connect</Text>
                <TouchableOpacity onPress={() => {
                    setShowModal(true)
                }}>
                    <Text style={{ marginTop: 20 }}>Máy in tạm tính (qua mạng LAN {ip})</Text>
                </TouchableOpacity>
            </View>
            <View style={{ padding: 20, borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
                <Text style={{ color: Colors.colorchinh, fontSize: 18 }}>Print setup</Text>
                <TouchableOpacity onPress={() => { props.navigation.navigate("PrintHtml") }}>
                    <Text style={{ marginTop: 20 }}>HTML print</Text>
                </TouchableOpacity>
            </View>
            <View style={{ padding: 20, borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}>
                <TouchableOpacity onPress={() => onClickLogOut()}>
                    <Text style={{ marginTop: 20 }}>Logout</Text>
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
                            if (ip.length < 12) {
                                setIp(IP_DEFAULT)
                            }
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
                                <TextInput style={{ padding: 10, borderRadius: 5, borderWidth: 1, borderColor: Colors.colorchinh }} onChangeText={(text) => setIp(text)} value={ip} placeholder="Địa chỉ ip" />
                                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                    <TouchableOpacity style={{ alignItems: "flex-end", marginTop: 15 }} onPress={() => {
                                        setShowModal(false)
                                        if (ip.length < 12) {
                                            setIp(IP_DEFAULT)
                                        }
                                    }}>
                                        <Text style={{ margin: 5, fontSize: 16, fontWeight: "500", marginRight: 15, color: "red" }}>Huỷ</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ alignItems: "flex-end", marginTop: 15 }} onPress={() => onClickSaveIP()}>
                                        <Text style={{ margin: 5, fontSize: 16, fontWeight: "500" }}>Đồng ý</Text>
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
