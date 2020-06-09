import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Image, View, Text, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Modal, TextInput, ImageBackground } from 'react-native';
import { Colors, Images, Metrics } from '../../../../theme';
import Menu from 'react-native-material-menu';
import dataManager from '../../../../data/DataManager';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ApiPath } from '../../../../data/services/ApiPath';
import dialogManager from '../../../../components/dialog/DialogManager';
import { HTTPService } from '../../../../data/services/HttpService';
import { getFileDuLieuString } from '../../../../data/fileStore/FileStorage';
import { Constant } from '../../../../common/Constant';
import TextTicker from 'react-native-text-ticker';
import { currencyToString } from '../../../../common/Utils'
import I18n from "../../../../common/language/i18n"
import { Snackbar } from 'react-native-paper';


export default (props) => {

    const [listPosition, setListPosition] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [list, setListOrder] = useState(() => props.listProducts)
    const [vendorSession, setVendorSession] = useState({})
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [itemOrder, setItemOrder] = useState({})
    const [listTopping, setListTopping] = useState([])



    useEffect(() => {
        console.log("Customer props ", props);
        const getVendorSession = async () => {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('data', JSON.parse(data));
            setVendorSession(JSON.parse(data));
        }

        const init = () => {
            let tempListPosition = dataManager.dataChoosing.filter(item => item.Id == props.route.params.room.Id)
            if (tempListPosition && tempListPosition.length > 0) {
                console.log('from tempListPosition');
                setListPosition(tempListPosition[0].data)
            }
        }
        getVendorSession()
        init()
        return () => {
            console.log(dataManager.dataChoosing, 'dataManager.dataChoosing');
        }
    }, [])



    // useEffect(() => {
    //     props.outputPosition(props.Position)
    // }, [props.Position])

    useEffect(() => {
        if (props.listProducts.length > 0) {
            console.log('useEffect props.listProducts', props.listProducts);
            let exist = false
            listPosition.forEach(element => {
                if (element.key == props.Position) {
                    exist = true
                    element.list = props.listProducts
                }
            })
            if (!exist) {
                listPosition.push({ key: props.Position, list: props.listProducts })
            }
            console.log(listPosition, 'listPosition');

            setListOrder(props.listProducts)
            savePosition()
        }
    }, [props.listProducts])

    useEffect(() => {
        console.log('useEffect props.Position', props.Position);
        let exist = false
        listPosition.forEach(element => {
            if (element.key == props.Position) {
                exist = true
                syncListProducts([...element.list])
            }
        })
        if (!exist) {
            listPosition.push({ key: props.Position, list: [] })
            syncListProducts([])
        }
    }, [props.Position, listPosition])

    // useEffect(() => {
    //     setItemOrder(props.itemOrder)
    // }, [props.itemOrder])

    useEffect(() => {
        console.log(listTopping, 'listTopping');
        console.log(itemOrder, 'itemOrder');

        const getInfoTopping = (lt) => {
            let description = '';
            let totalPrice = 0;
            lt.forEach(item => {
                if (item.Quantity > 0) {
                    description += ` -- ${item.Name} x ${item.Quantity} = ${currencyToString(item.Quantity * item.Price)} ; `
                    totalPrice += item.Quantity * item.Price
                }
            })
            return [description, totalPrice]
        }
        let [description, totalPrice] = getInfoTopping(listTopping)
        list.forEach(element => {
            if (element.Sid == itemOrder.Sid) {
                element.Description = description
                element.Topping = JSON.stringify(listTopping)
                element.TotalTopping = totalPrice
            }
        });
        setListOrder([...list])
    }, [listTopping])

    const sendNotidy = (type) => {
        console.log("sendNotidy type ", type);
        hideMenu();
        if (type == 1 && !(list.length > 0)) {
            setToastDescription(I18n.t("ban_hay_chon_mon_an_truoc"))
            setShowToast(true)
        } else
            props.outputSendNotify(type);
    }


    const syncListProducts = (listProducts) => {
        console.log('syncListProducts');
        setListOrder(listProducts)
        props.outputListProducts(listProducts)
    }

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
                    Position: props.Position,
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
                item.data = item.data.filter(it => it.key != props.Position)
            }
        })
    }

    const onCallBack = (data) => {
        console.log('data', data);
        setListTopping(data)

    }

    const onClickTopping = (item) => {
        setItemOrder(item)
        props.navigation.navigate('Topping', { _onSelect: onCallBack, itemOrder: item, Position: props.Position, IdRoom: props.route.params.room.Id })
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


    const renderForPhone = (item, index) => {
        return (
            <TouchableOpacity key={index} onPress={() => {
                console.log("setItemOrder ", item);
                setItemOrder(item)
                setShowModal(!showModal)
            }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", paddingVertical: 10, borderBottomColor: "#ABB2B9", borderBottomWidth: 0.5, backgroundColor: item.Sid == itemOrder.Sid ? "#EED6A7" : null }}>
                    <TouchableOpacity onPress={() => {
                        console.log('delete ', props, item);
                        // let check = false;
                        // list.forEach(element => {
                        //     console.log('element  ', element);
                        //     if (element.Id == props.route.params.room.ProductId) {
                        //         console.log('element  true');
                        //         check = true;
                        //     }
                        // });
                        // if(check) props.outputCheckProductId();
                        list.splice(index, 1)
                        syncListProducts([...list])


                    }}>
                        <Icon name="trash-can-outline" size={40} color="gray" />
                    </TouchableOpacity>
                    <View style={{ flex: 1, }}>
                        <Text style={{ fontWeight: "bold" }}>{item.Name}</Text>
                        <Text style={{ fontSize: 12 }}>{currencyToString(item.Price)} x <Text style={{ color: "red", fontWeight: "bold" }}>{item.Quantity}</Text></Text>
                        {item.Description != "" ?
                            <TextTicker
                                style={{ fontStyle: "italic", fontSize: 11, color: "gray" }}
                                duration={10000}
                                bounce={false}
                                marqueeDelay={1000}>
                                {item.Description}
                            </TextTicker>
                            :
                            null}
                    </View>
                    <TouchableOpacity
                        style={{ marginLeft: 10 }}
                        onPress={() => onClickTopping(item)}>
                        <Icon name="access-point" size={40} color="orange" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {list.length > 0 ?
                    <ScrollView style={{ flex: 1 }}>
                        {
                            list.map((item, index) => {
                                return (
                                    renderForPhone(item, index)
                                )

                            })
                        }
                    </ScrollView>
                    :
                    <ImageBackground resizeMode="contain" source={Images.logo_365} style={{ flex: 1, opacity: .2, margin: 20 }}>
                    </ImageBackground>
                }
            </View>
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
                            {/* <Text style={{ padding: 10, fontSize: 16, textAlign: "center", borderBottomWidth: .5 }}>Giờ vào: 27/04/2020 08:00</Text> */}
                            <TouchableOpacity onPress={() => sendNotidy(1)} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <Image style={{ width: 20, height: 20 }} source={Images.icon_notification} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('yeu_cau_thanh_toan')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => sendNotidy(2)} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }} >
                                <Image style={{ width: 20, height: 20 }} source={Images.icon_notification} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('gui_thong_bao_toi_thu_ngan')}</Text>
                            </TouchableOpacity>
                        </View>
                    </Menu>
                </TouchableOpacity>
                <TouchableOpacity onPress={sendOrder} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>Gửi thực đơn</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={dellAll} style={{ justifyContent: "center", alignItems: "center", paddingHorizontal: 10, borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Icon name="delete-forever" size={30} color="white" />
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
                                onClickTopping={() => onClickTopping(itemOrder)}
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

const PopupDetail = (props) => {

    const [itemOrder, setItemOrder] = useState({ ...props.item })

    const onClickOk = () => {
        console.log("onClickOk itemOrder ", itemOrder);
        props.getDataOnClick(itemOrder)
        props.setShowModal(false)
    }

    const onClickTopping = () => {
        props.onClickTopping()
        props.setShowModal(false)
    }


    return (
        <View>
            <View style={{ backgroundColor: Colors.colorchinh, borderTopRightRadius: 4, borderTopLeftRadius: 4, }}>
                <Text style={{ margin: 10, textTransform: "uppercase", fontSize: 20, marginLeft: 20, color: "#fff" }}>{itemOrder.Name}</Text>
            </View>
            <View style={{ padding: 10 }}>
                <View style={{ padding: 0, flexDirection: "row", justifyContent: "center" }} onPress={() => setShowModal(false)}>
                    <Text style={{ fontSize: 16, flex: 3 }}>{I18n.t('don_gia')}}</Text>
                    <View style={{ alignItems: "center", flexDirection: "row", flex: 7 }}>
                        <Text style={{ paddingHorizontal: 20, paddingVertical: 20, flex: 1, fontSize: 16, borderWidth: 0.5, borderRadius: 4 }}>{itemOrder.Price}</Text>
                    </View>

                </View>
                <View style={{ padding: 0, flexDirection: "row", justifyContent: "center" }} >
                    <Text style={{ fontSize: 16, flex: 3 }}>{I18n.t('so_luong')}</Text>
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
                    <Text style={{ fontSize: 16, flex: 3 }}>{I18n.t('ghi_chu')}</Text>
                    <View style={{ alignItems: "center", flexDirection: "row", flex: 7 }}>
                        <TextInput onChangeText={text => {
                            itemOrder.Description = text
                            setItemOrder({ ...itemOrder })
                        }} numberOfLines={4} multiline={true} value={itemOrder.Description} style={{ height: 100, paddingHorizontal: 20, paddingVertical: 5, flex: 7, fontSize: 16, borderWidth: 0.5, borderRadius: 4 }} placeholder="Nhập ghi chú" />
                    </View>
                </View>
                <View style={{ alignItems: "center", justifyContent: "space-between", flexDirection: "row", marginTop: 10 }}>
                    <TouchableOpacity onPress={() => props.setShowModal(false)} style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, paddingHorizontal: 10, paddingVertical: 15, borderRadius: 4, backgroundColor: "#fff" }} >
                        <Text style={{ color: Colors.colorchinh, textTransform: "uppercase" }}>{I18n.t('huy')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onClickTopping()} style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, paddingHorizontal: 10, paddingVertical: 15, borderRadius: 4, backgroundColor: "#fff" }} >
                        <Text style={{ color: Colors.colorchinh, textTransform: "uppercase" }}>Topping</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onClickOk()} style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, paddingHorizontal: 10, paddingVertical: 15, borderRadius: 4, backgroundColor: Colors.colorchinh }} >
                        <Text style={{ color: "#fff", textTransform: "uppercase", }}>{I18n.t('dong_y')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

