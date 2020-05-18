import React, { useEffect, useState } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity } from 'react-native';
import { Images, Colors } from '../../theme';
import { setFileLuuDuLieu, getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import realmStore from '../../data/realm/RealmStore';

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
                {/* <Text >More</Text> */}
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

    const onClickLogOut = () => {
        realmStore.deleteAll()
        setFileLuuDuLieu(Constant.CURRENT_ACCOUNT, "");
        props.navigation.navigate('Login', { param: "logout" })
    }

    return (
        <View>
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

        </View>
    )
}
