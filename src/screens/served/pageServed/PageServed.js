import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, View, StyleSheet, Picker, Text, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Modal } from 'react-native';
import { Colors, Images, Metrics } from '../../../theme';
import MenuConfirm from './MenuConfirm';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import CustomerOrder from './CustomerOrder';

export default (props) => {

    const [tab, setTab] = useState(1)
    const [showModal, setShowModal] = useState(false)
    const [position, setPosition] = useState("A")


    const selectPosition = (position) => {
        setPosition(position)
        setShowModal(false);
    }

    const outputListProducts = (listProducts) => {
        props.outputListProducts(listProducts)
    }
    
    let _menu = null;

    const setMenuRef = ref => {
        _menu = ref;
    };

    const hideMenu = (position) => {
        _menu.hide();
        selectPosition(position)
    };

    const showMenu = () => {
        _menu.show();
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: Colors.colorchinh, alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 0 }}>
                <View style={{ flex: 1, height: 45, justifyContent: "center" }}>
                    <Text style={{ paddingHorizontal: 20 }}>{props.route && props.route.params && props.route.params.room && props.route.params.room.Name ? props.route.params.room.Name : ""}</Text>
                </View>
                <TouchableOpacity onPress={showMenu} style={{ flex: 1, height: 45, paddingHorizontal: 20, flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
                    <Menu
                        ref={setMenuRef}
                        button={<Text onPress={showMenu}>{position}</Text>}
                    >
                        <MenuItem onPress={() => hideMenu("A")}>A</MenuItem>
                        <MenuItem onPress={() => hideMenu("B")}>B</MenuItem>
                        <MenuItem onPress={() => hideMenu("C")}>C</MenuItem>
                        <MenuItem onPress={() => hideMenu("D")}>D</MenuItem>
                    </Menu>
                    <Image source={Images.arrow_down} style={{ width: 16, height: 16, marginLeft: 5 }} />
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 0, marginTop: 2 }}>
                <TouchableOpacity onPress={() => setTab(1)} style={{ flex: 1, justifyContent: "center", alignItems: "center", height: 45, backgroundColor: tab == 1 ? Colors.colorchinh : "#fff", paddingHorizontal: 20, flexDirection: "row" }}>
                    <Text>Thực đơn đã gọi</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTab(2)} style={{ flex: 1, justifyContent: "center", alignItems: "center", height: 45, backgroundColor: tab == 2 ? Colors.colorchinh : "#fff", paddingHorizontal: 20, flexDirection: "row" }}>
                    <Text>Món đã xác nhận</Text>
                </TouchableOpacity>
            </View>
            {tab == 1 ?
                <CustomerOrder position={position} {...props} outputListProducts={outputListProducts} />
                :
                <MenuConfirm position={position} {...props} />
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
                                <Text style={{ margin: 10, fontSize: 16 }}>A</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => selectPosition("B")}>
                                <Text style={{ margin: 10, fontSize: 16 }}>B</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => selectPosition("C")}>
                                <Text style={{ margin: 10, fontSize: 16 }}>C</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => selectPosition("D")}>
                                <Text style={{ margin: 10, fontSize: 16 }}>D</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View >
    );
}
