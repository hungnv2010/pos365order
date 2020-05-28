import React, { useEffect, useState } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Images from '../../../theme/Images';
import realmStore from '../../../data/realm/RealmStore'
import Colors from '../../../theme/Colors';
import Menu from 'react-native-material-menu';


export default (props) => {

    const row_key = `${props.route.params.room.Id}_${props.route.params.room.Position}`
    const [test, setTest] = useState("")
    const [jsonContent, setJsonContent] = useState({})

    useEffect(() => {
        init()
        return () => {
            realmStore.removeAllListener()
        }
    }, [])

    init = async () => {
        let serverEvent = await realmStore.queryServerEvents().then(res => res.filtered(`RowKey == '${row_key}'`))
        console.log("init: ", JSON.stringify(serverEvent));

        setJsonContent(JSON.parse(serverEvent[0].JsonContent))
        serverEvent.addListener((collection, changes) => {
            setJsonContent(JSON.parse(serverEvent[0].JsonContent))
        })
    }

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

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {
                    !jsonContent.OrderDetails ? null
                        : jsonContent.OrderDetails.map((item, index) => {
                            return (
                                <View style={[styles.item, { backgroundColor: (index % 2 == 0) ? Colors.backgroundYellow : Colors.backgroundWhite }]}>
                                    <Image style={{ width: 20, height: 20, margin: 10 }} source={Images.icon_return} />
                                    <View style={{ flexDirection: "column", flex: 1 }}>
                                        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 7 }}>{item.Name}</Text>
                                        <View style={{ flexDirection: "row" }}>
                                            <Text>{item.Price}x</Text>
                                            <Text style={{ color: Colors.colorPhu }}> {item.Quantity} {}</Text>
                                        </View>
                                    </View>
                                    <View style={{ alignItems: "center", flexDirection: "row" }}>

                                        <Text style={{ padding: 20 }}>{item.Quantity}</Text>

                                    </View>
                                </View>
                            )
                        })
                }
            </View >
            <View style={{ height: 50, flexDirection: "row", backgroundColor: "#0072bc", alignItems: "center" }}>
                <TouchableOpacity
                    onPress={showMenu}>
                    <Menu
                        ref={setMenuRef}
                        button={<Image style={{ width: 24, height: 24, margin: 20 }} source={Images.icon_menu} />}
                    >
                        <View style={{
                            padding: 5,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                        }}>
                            <Text style={{ margin: 15, fontSize: 16 }}>Giờ vào: 27/04/2020 08:00</Text>
                            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={hideMenu}>
                                <Image style={{ width: 20, height: 20 }} source={Images.icon_notification} />
                                <Text style={{ margin: 15, fontSize: 16 }}>Yêu cầu thanh toán</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={hideMenu}>
                                <Image style={{ width: 20, height: 20 }} source={Images.icon_notification} />
                                <Text style={{ margin: 15, fontSize: 16 }}>Gửi thông báo tới thu ngân</Text>
                            </TouchableOpacity>
                        </View>
                    </Menu>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { }} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ fontSize: 18, color: "#fff", fontWeight: "bold" }}>Chuyển Bàn</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { }} style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 10, borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ fontSize: 18, color: "#fff", fontWeight: "bold" }}>Tạm Tính</Text>
                </TouchableOpacity>
            </View>
        </View>
    )

}

const styles = StyleSheet.create({
    item: { flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", padding: 10 },
})