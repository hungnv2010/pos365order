import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { ActivityIndicator, Image, View, StyleSheet, Picker, Text, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Colors, Images, Metrics } from '../../../theme';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import dataManager from '../../../data/DataManager';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ApiPath } from '../../../data/services/ApiPath';
import dialogManager from '../../../components/dialog/DialogManager';
import { HTTPService } from '../../../data/services/HttpService';
import { getFileDuLieuString } from '../../../data/fileStore/FileStorage';
import { Constant } from '../../../common/Constant';
import useDebounce from '../../../customHook/useDebounce';
import { useSelector } from 'react-redux';



export default (props) => {

    const [listPosition, setListPosition] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [list, setListOrder] = useState(() => props.listProducts)
    const [vendorSession, setVendorSession] = useState({})
    const [itemOrder, setItemOrder] = useState({})
    // const listToppingDeb = useDebounce(props.listTopping)
    const { deviceType } = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common
    });


    useEffect(() => {
        console.log("Customer props ", props);
        const getVendorSession = async () => {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('data', JSON.parse(data));
            setVendorSession(JSON.parse(data));
        }
        getVendorSession()

        init()
        return () => {
            console.log(dataManager.dataChoosing, 'dataManager.dataChoosing');
        }
    }, [])

    const init = () => {
        let tempListPosition = dataManager.dataChoosing.filter(item => item.Id == props.route.params.room.Id)
        if (tempListPosition && tempListPosition.length > 0) {
            console.log('from tempListPosition');
            setListPosition(tempListPosition[0].data)
        }
    }


    const syncListProducts = (listProducts) => {
        console.log('syncListProducts');
        setListOrder(listProducts)
        props.outputListProducts(listProducts)
    }

    useEffect(() => {
        console.log('useEffect props.position', props.position);
        let exist = false
        listPosition.forEach(element => {
            if (element.key == props.position) {
                exist = true
                syncListProducts([...element.list])
            }
        })
        if (!exist) {
            listPosition.push({ key: props.position, list: [] })
            syncListProducts([])
        }
    }, [props.position, listPosition])

    useEffect(() => {
        props.outputPosition(props.position)
    }, [props.position])

    useEffect(() => {
        if (props.listProducts.length > 0) {
            console.log('useEffect props.listProducts', props.listProducts);
            let exist = false
            listPosition.forEach(element => {
                if (element.key == props.position) {
                    exist = true
                    element.list = props.listProducts
                }
            })
            if (!exist) {
                listPosition.push({ key: props.position, list: props.listProducts })
            }
            setListOrder(props.listProducts)
            savePosition()
        }
    }, [props.listProducts])

    useEffect(() => {
        setItemOrder(props.itemOrder)
    }, [props.itemOrder])

    useEffect(() => {
        const getDescription = (listTopping) => {
            let description = '';
            listTopping.forEach(item => {
                if (item.Quantity > 0) {
                    description += `* ${item.Name}x${item.Quantity};\n`
                }
            })
            return description
        }
        let description = getDescription(props.listTopping)
        list.forEach(element => {
            if (element.Sid == props.itemOrder.Sid) {
                element.Description = description
            }
        });
        setListOrder([...list])
    }, [props.listTopping])




    const savePosition = () => {
        let exist = false
        dataManager.dataChoosing.forEach(element => {
            if (element.Id == props.route.params.room.Id) {
                exist = true
                element.data = listPosition
            }
        })
        if (!exist) {
            dataManager.dataChoosing.push({ Id: props.route.params.room.Id, data: listPosition })
        }
        console.log(dataManager.dataChoosing, 'savePosition');
    }

    const sendOrder = () => {
        if (list.length > 0) {
            let ls = [];
            ls = JSON.parse(JSON.stringify(list))
            console.log("sendOrder", ls, vendorSession);
            let params = {
                ServeEntities: []
            };
            ls.forEach(element => {
                let obj = {
                    BasePrice: element.Price,
                    Code: element.Code,
                    Name: element.Name,
                    OrderQuickNotes: [],
                    Position: props.position,
                    Price: element.Price,
                    Printer: element.Printer,
                    Printer3: null,
                    Printer4: null,
                    Printer5: null,
                    ProductId: element.Id,
                    Quantity: element.Quantity,
                    RoomId: props.route.params.room.Id,
                    RoomName: props.route.params.room.Name,
                    SecondPrinter: null,
                    Serveby: vendorSession.CurrentUser && vendorSession.CurrentUser.Id ? vendorSession.CurrentUser.Id : ""
                }
                params.ServeEntities.push(obj)
            });
            dialogManager.showLoading();
            new HTTPService().setPath(ApiPath.SAVE_ORDER).POST(params).then((res) => {
                console.log("sendOrder res ", res);
                syncListProducts([])
                let tempListPosition = dataManager.dataChoosing.filter(item => item.Id != props.route.params.room.Id)
                dataManager.dataChoosing = tempListPosition;
                dialogManager.hiddenLoading()
            }).catch((e) => {
                console.log("sendOrder err ", e);
                dialogManager.hiddenLoading()
            })
        }
    }

    const dellAll = () => {
        syncListProducts([])
        dataManager.dataChoosing.forEach(item => {
            if (item.Id == props.route.params.room.Id) {
                item.data = item.data.filter(it => it.key != props.position)
            }
        })
    }

    const mapDataToList = (data) => {
        console.log("mapDataToList(data) ", data);
        list.forEach(element => {
            if (element.Id == data.Id) {
                element.Description = data.Description
                element.Quantity = data.Quantity
            }
        });
        console.log("mapDataToList(ls) ", list);
        setListOrder([...list])
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

    const renderForTablet = (item, index) => {
        return (
            <TouchableOpacity key={index} onPress={() => {
                console.log("setItemOrder ", item);
                setItemOrder(item)
                setShowModal(!showModal)
            }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", padding: 10, borderBottomColor: "#ABB2B9", borderBottomWidth: 0.5, backgroundColor: item.Sid == props.itemOrder.Sid ? "#EED6A7" : null }}>
                    <TouchableOpacity onPress={() => {
                        console.log('delete');
                        item.Quantity = 0
                        syncListProducts([...list])
                    }}>
                        <Icon name="trash-can-outline" size={50} color="gray" />
                    </TouchableOpacity>
                    <View style={{ flexDirection: "column", flex: 1 }}>
                        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 7 }}>{item.Name}</Text>
                        <Text>{item.Price}x</Text>
                        <Text>{item.Description}</Text>
                    </View>
                    <View style={{ alignItems: "center", flexDirection: "row" }}>
                        <TouchableOpacity onPress={() => {
                            item.Quantity++
                            props.outputListProducts([...list])
                        }}>
                            <Text style={{ borderWidth: 1, padding: 20, borderRadius: 10 }}>+</Text>
                        </TouchableOpacity>
                        <Text style={{ padding: 20 }}>{item.Quantity}</Text>
                        <TouchableOpacity onPress={() => {
                            item.Quantity--
                            setListOrder([...list])
                            props.outputListProducts([...list])
                        }}>
                            <Text style={{ borderWidth: 1, padding: 20, borderRadius: 10 }}>-</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={{ marginLeft: 10 }}
                        onPress={() => {
                            props.outputItemOrder(item)
                        }}>
                        <Icon name="access-point" size={50} color="orange" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        )
    }

    const renderForPhone = (item, index) => {
        return (
            <TouchableOpacity key={index} onPress={() => {
                console.log("setItemOrder ", item);
                setItemOrder(item)
                setShowModal(!showModal)
            }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", padding: 10, borderBottomColor: "#ABB2B9", borderBottomWidth: 0.5, backgroundColor: item.Id == props.itemOrder.Id ? "#EED6A7" : null }}>
                    <TouchableOpacity onPress={() => {
                        console.log('delete');
                        item.Quantity = 0
                        syncListProducts([...list])

                    }}>
                        <Icon name="trash-can-outline" size={50} color="gray" />
                    </TouchableOpacity>
                    <View style={{ flexDirection: "column", flex: 1 }}>
                        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 7 }}>{item.Name}</Text>
                        <Text>{item.Price}x</Text>
                        <Text>{item.Description}</Text>
                    </View>
                    <View style={{ alignItems: "center", flexDirection: "row" }}>
                        <TouchableOpacity onPress={() => {
                            item.Quantity++
                            props.outputListProducts([...list])
                        }}>
                            <Text style={{ borderWidth: 1, padding: 20, borderRadius: 10 }}>+</Text>
                        </TouchableOpacity>
                        <Text style={{ padding: 20 }}>{item.Quantity}</Text>
                        <TouchableOpacity onPress={() => {
                            item.Quantity--
                            setListOrder([...list])
                            props.outputListProducts([...list])
                        }}>
                            <Text style={{ borderWidth: 1, padding: 20, borderRadius: 10 }}>-</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={{ marginLeft: 10 }}
                        onPress={() => {
                            props.outputItemOrder(item)
                            props.outputIsTopping()
                        }}>
                        <Icon name="access-point" size={50} color="orange" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {deviceType == Constant.TABLET ?
                    null
                    :
                    <TouchableOpacity
                        style={{ alignItems: "center", backgroundColor: "brown", borderRadius: 10, paddingVertical: 5, marginTop: 2 }}
                        onPress={() => {
                            props.outputIsSelectFood()
                        }}>
                        <Text>Chon mon</Text>
                    </TouchableOpacity>}
                <ScrollView style={{ flex: 1 }}>
                    {
                        list.map((item, index) => {
                            return item.Quantity > 0 ? (
                                deviceType == Constant.TABLET ?
                                    renderForTablet(item, index)
                                    :
                                    renderForPhone(item, index)
                            ) :
                                null
                        })
                    }
                </ScrollView>
            </View>
            <View style={{ height: 50, flexDirection: "row", backgroundColor: "#0072bc", alignItems: "center" }}>
                <TouchableOpacity onPress={showMenu}>
                    <Menu
                        ref={setMenuRef}
                        button={<Image style={{ width: 24, height: 24, margin: 20 }} source={Images.icon_menu} />}
                    >
                        <View style={{
                            padding: 5,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                        }}>
                            <Text style={{ margin: 15, fontSize: 16 }}>Giờ vào: 27/04/2020 08:00</Text>
                            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => _menu.hide()}>
                                <Image style={{ width: 20, height: 20 }} source={Images.icon_notification} />
                                <Text style={{ margin: 15, fontSize: 16 }}>Yêu cầu thanh toán</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => _menu.hide()}>
                                <Image style={{ width: 20, height: 20 }} source={Images.icon_notification} />
                                <Text style={{ margin: 15, fontSize: 16 }}>Gửi thông báo tới thu ngân</Text>
                            </TouchableOpacity>
                        </View>
                    </Menu>
                </TouchableOpacity>
                <TouchableOpacity onPress={sendOrder} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ fontSize: 18, color: "#fff", fontWeight: "bold" }}>Gửi thực đơn</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={dellAll} style={{ justifyContent: "center", alignItems: "center", paddingHorizontal: 10, borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Icon name="delete-forever" size={40} color="black" />
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
                        }}>
                            <PopupDetail
                                setIsTopping={() => { props.setIsTopping() }}
                                item={itemOrder}
                                getDataOnClick={(data) => {
                                    console.log("getDataOnClick ", data);
                                    mapDataToList(data)
                                }}
                                setShowModal={() => {
                                    console.log("getDataOnClick list ", list);
                                    setShowModal(false)
                                }
                                } />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const PopupDetail = (props) => {

    const [itemOrder, setItemOrder] = useState({ ...props.item })

    const onClickOk = () => {
        console.log("onClickOk itemOrder ", itemOrder);
        props.getDataOnClick(itemOrder)
        props.setShowModal(false)
    }

    const onClickTopping = () => {
        props.setIsTopping()
        props.setShowModal(false)
    }


    return (
        <View>
            <View style={{ backgroundColor: Colors.colorchinh, borderTopRightRadius: 4, borderTopLeftRadius: 4, }}>
                <Text style={{ margin: 10, textTransform: "uppercase", fontSize: 20, marginLeft: 20, color: "#fff" }}>{itemOrder.Name}</Text>
            </View>
            <View style={{ padding: 10 }}>
                <View style={{ padding: 0, flexDirection: "row", justifyContent: "center" }} onPress={() => setShowModal(false)}>
                    <Text style={{ fontSize: 16, flex: 3 }}>Đơn giá</Text>
                    <View style={{ alignItems: "center", flexDirection: "row", flex: 7 }}>
                        <Text style={{ paddingHorizontal: 20, paddingVertical: 20, flex: 1, fontSize: 16, borderWidth: 0.5, borderRadius: 4 }}>{itemOrder.Price}</Text>
                    </View>

                </View>
                <View style={{ padding: 0, flexDirection: "row", justifyContent: "center" }} >
                    <Text style={{ fontSize: 16, flex: 3 }}>Số lượng</Text>
                    <View style={{ alignItems: "center", flexDirection: "row", flex: 7 }}>
                        <TouchableOpacity onPress={() => {
                            itemOrder.Quantity++
                            setItemOrder({ ...itemOrder })
                        }}>
                            <Text style={{ borderWidth: 1, padding: 20, borderRadius: 10 }}>+</Text>
                        </TouchableOpacity>
                        <TextInput style={{ padding: 20, textAlign: "center", margin: 10, flex: 1, borderRadius: 4, borderWidth: 0.5 }} value={"" + itemOrder.Quantity} />
                        <TouchableOpacity onPress={() => {
                            if (itemOrder.Quantity > 0) {
                                itemOrder.Quantity--
                                setItemOrder({ ...itemOrder })
                            }
                        }}>
                            <Text style={{ borderWidth: 1, padding: 20, borderRadius: 10 }}>-</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ padding: 0, flexDirection: "row", justifyContent: "center" }} onPress={() => setShowModal(false)}>
                    <Text style={{ fontSize: 16, flex: 3 }}>Ghi chú</Text>
                    <View style={{ alignItems: "center", flexDirection: "row", flex: 7 }}>
                        <TextInput onChangeText={text => {
                            itemOrder.Description = text
                            setItemOrder({ ...itemOrder })
                        }} numberOfLines={4} multiline={true} value={itemOrder.Description} style={{ height: 100, paddingHorizontal: 20, paddingVertical: 5, flex: 7, fontSize: 16, borderWidth: 0.5, borderRadius: 4 }} placeholder="Nhập ghi chú" />
                    </View>
                </View>
                <View style={{ alignItems: "center", justifyContent: "space-between", flexDirection: "row", marginTop: 10 }}>
                    <TouchableOpacity onPress={() => props.setShowModal(false)} style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, paddingHorizontal: 10, paddingVertical: 15, borderRadius: 4, backgroundColor: "#fff" }} >
                        <Text style={{ color: Colors.colorchinh, textTransform: "uppercase" }}>Huỷ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onClickTopping()} style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, paddingHorizontal: 10, paddingVertical: 15, borderRadius: 4, backgroundColor: "#fff" }} >
                        <Text style={{ color: Colors.colorchinh, textTransform: "uppercase" }}>Topping</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onClickOk()} style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, paddingHorizontal: 10, paddingVertical: 15, borderRadius: 4, backgroundColor: Colors.colorchinh }} >
                        <Text style={{ color: "#fff", textTransform: "uppercase", }}>Xong</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

