import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Image, View, Text, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Modal, TextInput, ImageBackground, FlatList } from 'react-native';
import { Colors, Images, Metrics } from '../../../../theme';
import Menu from 'react-native-material-menu';
import dataManager from '../../../../data/DataManager';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ApiPath } from '../../../../data/services/ApiPath';
import dialogManager from '../../../../components/dialog/DialogManager';
import { HTTPService } from '../../../../data/services/HttpService';
import { getFileDuLieuString, setFileLuuDuLieu } from '../../../../data/fileStore/FileStorage';
import { Constant } from '../../../../common/Constant';
import TextTicker from 'react-native-text-ticker';
import { currencyToString } from '../../../../common/Utils';
import I18n from "../../../../common/language/i18n";
import { Snackbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';




export default (props) => {

    const [listPosition, setListPosition] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [list, setListOrder] = useState([])
    const [vendorSession, setVendorSession] = useState({})
    const [itemOrder, setItemOrder] = useState({})
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")

    const dispatch = useDispatch();

    const orientaition = useSelector(state => {
        console.log("orientaition", state);
        return state.Common.orientaition
    });


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


    useEffect(() => {
        setItemOrder(props.itemOrder)
    }, [props.itemOrder])


    useEffect(() => {
        props.outputPosition(props.Position)
    }, [props.Position])

    useEffect(() => {
        if (props.listProducts.length == 0) return
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

        setListOrder([...props.listProducts])
        savePosition()
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
            syncListProducts([])
        }
    }, [props.Position, listPosition])


    useEffect(() => {
        console.log(props.listTopping, 'props.listTopping');
        console.log(props.itemOrder, 'props.itemOrder');
        console.log(itemOrder, 'itemOrder');

        const getInfoTopping = (listTopping) => {
            let description = '';
            let totalPrice = 0;
            let topping = []
            listTopping.forEach(item => {
                if (item.Quantity > 0) {
                    description += ` -${item.Name} x${item.Quantity} = ${currencyToString(item.Quantity * item.Price)}\n `
                    totalPrice += item.Quantity * item.Price
                    topping.push({ ExtraId: item.ExtraId, QuantityExtra: item.Quantity, Price: item.Price, Quantity: item.Quantity })
                }
            })
            return [description, totalPrice, topping]
        }
        let [description, totalPrice, topping] = getInfoTopping(props.listTopping)
        list.forEach(element => {
            if (element.Sid == props.itemOrder.Sid) {
                element.Description = description
                element.Topping = JSON.stringify(topping)
                element.TotalTopping = totalPrice
            }
        });
        setListOrder([...list])
    }, [props.listTopping])


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
            dataManager.dataChoosing.push({ Id: props.route.params.room.Id, ProductId: props.route.params.room.ProductId, Name: props.route.params.room.Name, data: listPosition })
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


            // BasePrice: 20000
            // Code: "HH-0002"
            // Description: " -Cà phê chago x1=5,000↵"
            // DiscountRatio: 0
            // Name: "Trà bí đao "
            // OrderQuickNotes: []
            // Position: "A"
            // Price: 25000
            // Printer: "KitchenA"
            // Printer3: null
            // Printer4: null
            // Printer5: null
            // ProductId: 8069056
            // Quantity: 2
            // RoomId: 156169
            // RoomName: "Bàn 28"
            // SecondPrinter: null
            // Serveby: 39207
            // Topping: "[{"ExtraId":8069091,"QuantityExtra":1,"Price":5000,"Quantity":1}]"
            // TotalTopping: 5000

            ls.forEach(element => {
                let obj = {
                    BasePrice: element.Price,
                    Code: element.Code,
                    Description: element.Description,
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
                    Serveby: vendorSession.CurrentUser && vendorSession.CurrentUser.Id ? vendorSession.CurrentUser.Id : "",
                    Topping: element.Topping,
                    TotalTopping: element.TotalTopping,
                }
                params.ServeEntities.push(obj)
            });
            dialogManager.showLoading();
            new HTTPService().setPath(ApiPath.SAVE_ORDER).POST(params).then(async (res) => {
                console.log("sendOrder res ", res);
                syncListProducts([])
                let tempListPosition = dataManager.dataChoosing.filter(item => item.Id != props.route.params.room.Id)
                dataManager.dataChoosing = tempListPosition;

                let historyTemp = [];
                let history = await getFileDuLieuString(Constant.HISTORY_ORDER, true);
                console.log("history ", history);
                if (history && history != "") {
                    history = JSON.parse(history)
                    history.push({
                        time: new Date(),
                        Position: props.Position,
                        list: ls, RoomId: props.route.params.room.Id,
                        RoomName: props.route.params.room.Name,
                    })
                    if (history.length >= 100) {
                        history = history.slice(1, 99);
                    }
                    historyTemp = history;
                } else {
                    historyTemp.push({
                        time: new Date(),
                        Position: props.Position,
                        list: ls, RoomId: props.route.params.room.Id,
                        RoomName: props.route.params.room.Name,
                    })
                }

                setFileLuuDuLieu(Constant.HISTORY_ORDER, JSON.stringify(historyTemp))

                dialogManager.hiddenLoading()
            }).catch((e) => {
                console.log("sendOrder err ", e);
                dialogManager.hiddenLoading()
            })
        } else {
            setToastDescription(I18n.t("ban_hay_chon_mon_an_truoc"))
            setShowToast(true)
        }
    }

    const dellAll = () => {
        if (list.length > 0) {
            dialogManager.showPopupTwoButton(I18n.t('ban_co_chac_muon_xoa_toan_bo_mat_hang_da_chon'), 'Thông báo', (value) => {
                if (value == 1) {
                    syncListProducts([])
                    let hasData = true
                    dataManager.dataChoosing.forEach(item => {
                        if (item.Id == props.route.params.room.Id) {
                            item.data = item.data.filter(it => it.key != props.Position)
                        }
                        if (item.data.length == 0) {
                            hasData = false
                        }
                    })
                    if (!hasData) {
                        dataManager.dataChoosing = dataManager.dataChoosing.filter(item => item.data.length > 0)
                        dispatch({ type: 'NUMBER_ORDER', numberOrder: dataManager.dataChoosing.length })
                    }
                }
            })
        }

    }

    const removeItem = (item, index) => {
        console.log('delete');
        let hasData = true
        list.splice(index, 1)
        dataManager.dataChoosing.forEach(item => {
            if (item.Id == props.route.params.room.Id) {
                if (list.length == 0) {
                    item.data = item.data.filter(it => it.key != props.Position)
                }
            }
            if (item.data.length == 0) {
                hasData = false
            }
        })
        if (!hasData) {
            dataManager.dataChoosing = dataManager.dataChoosing.filter(item => item.data.length > 0)
            dispatch({ type: 'NUMBER_ORDER', numberOrder: dataManager.dataChoosing.length })
        }
        syncListProducts([...list])
    }

    const getTotalPrice = () => {
        let total = 0;
        list.forEach(item => {
            if (item.ProductType != 2) {
                let price = item.IsLargeUnit ? item.PriceLargeUnit : item.Price
                total += price * item.Quantity + item.TotalTopping
            }
        })
        return total
    }

    const onClickTopping = (item) => {
        props.outputItemOrder(item)
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

    const sendNotidy = (type) => {
        console.log("sendNotidy type ", type);
        hideMenu();
        if (type == 1 && !(list.length > 0)) {
            setToastDescription(I18n.t("ban_hay_chon_mon_an_truoc"))
            setShowToast(true)
        } else
            props.outputSendNotify(type);
    }

    const renderForTablet = (item, index) => {
        return (
            <TouchableOpacity key={index} onPress={() => {
                if (item.ProductType == 2) {
                    setToastDescription(I18n.t("ban_khong_co_quyen_dieu_chinh_mat_hang_thoi_gian"))
                    setShowToast(true)
                    return
                }
                console.log("setItemOrder ", item);
                setItemOrder(item)
                setShowModal(!showModal)
            }}>
                <View style={{
                    flexDirection: "row", flex: 1, alignItems: "center", justifyContent: "space-evenly", padding: 5, backgroundColor: item.Sid == props.itemOrder.Sid ? "#EED6A7" : 'white', borderRadius: 10, marginBottom: 2
                }}>
                    <TouchableOpacity
                        style={{ marginRight: 5 }}
                        onPress={removeItem}>
                        <Icon name="trash-can-outline" size={40} color="black" />
                    </TouchableOpacity>
                    <View style={{ flexDirection: "column", flex: 1, }}>
                        <TextTicker
                            style={{ fontWeight: "bold", marginBottom: 7 }}
                            duration={6000}
                            marqueeDelay={1000}>
                            {item.Name}
                        </TextTicker>
                        <Text>{currencyToString(item.Price)} x {orientaition == Constant.PORTRAIT ? <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{Math.round(item.Quantity * 1000) / 1000}</Text> : null}</Text>
                        <TextTicker
                            style={{ fontStyle: "italic", fontSize: 11, color: "gray" }}
                            duration={6000}
                            marqueeDelay={1000}>
                            {item.Description}
                        </TextTicker>
                    </View>
                    {
                        orientaition == Constant.PORTRAIT ?
                            null
                            :
                            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                                {
                                    item.ProductType == 2 ?
                                        <View style={{
                                            flex: 1 / 2, alignItems: "center", paddingVertical: 10,
                                            shadowColor: "#000",
                                            shadowOffset: {
                                                width: 0,
                                                height: 1,
                                            },
                                            shadowOpacity: 0.18,
                                            shadowRadius: 1.00,
                                            elevation: 2,
                                            borderRadius: 2
                                        }}>
                                            <Text style={{}}>{Math.round(item.Quantity * 1000) / 1000}</Text>
                                        </View>
                                        :
                                        <View style={{ alignItems: "center", flexDirection: "row", }}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    if (item.Quantity == 1) {
                                                        list.splice(index, 1)
                                                    } else {
                                                        item.Quantity--
                                                    }
                                                    syncListProducts([...list])
                                                }}>
                                                <Icon name="minus-box" size={40} color={Colors.colorchinh} />
                                            </TouchableOpacity>
                                            <TextInput
                                                placeholder="1"
                                                onChangeText={numb => {
                                                    if (numb == '') item.Quantity = 1
                                                    else {
                                                        item.Quantity = numb;
                                                        syncListProducts([...list])
                                                    }
                                                }}
                                                keyboardType="numeric"
                                                textAlign="center"
                                                style={{
                                                    width: 40, fontSize: 16,
                                                    fontWeight: "bold",
                                                    shadowColor: "#000",
                                                    shadowOffset: {
                                                        width: 0,
                                                        height: 1,
                                                    },
                                                    shadowOpacity: 0.18,
                                                    shadowRadius: 1.00,
                                                    elevation: 2,
                                                    borderRadius: 2,
                                                    height: 35
                                                }}>{item.Quantity}</TextInput>
                                            <TouchableOpacity onPress={() => {
                                                item.Quantity++
                                                syncListProducts([...list])
                                            }}>
                                                <Icon name="plus-box" size={40} color={Colors.colorchinh} />
                                            </TouchableOpacity>
                                        </View>
                                }
                            </View>
                    }
                    {
                        item.ProductType == 2 ?
                            null
                            :
                            <TouchableOpacity
                                style={{ borderWidth: 1, borderRadius: 50, borderColor: Colors.colorchinh, }}
                                onPress={() => {
                                    props.outputItemOrder(item)
                                }}>
                                <Icon name="puzzle" size={25} color={Colors.colorchinh} style={{ padding: 5 }} />
                            </TouchableOpacity>
                    }
                </View>
            </TouchableOpacity>
        )
    }



    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {list.length > 0 ?
                    <FlatList
                        data={list}
                        extraData={list}
                        renderItem={({ item, index }) => renderForTablet(item, index)}
                        keyExtractor={(item, index) => '' + index}
                    />
                    :
                    <View style={{ alignItems: "center", flex: 1 }}>
                        <ImageBackground resizeMode="contain" source={Images.logo_365_long_color} style={{ flex: 1, opacity: 0.7, margin: 20, width: Metrics.screenWidth / 3 }}>
                        </ImageBackground>
                    </View>
                }
            </View>
            <View
                style={{ borderTopWidth: .5, borderTopColor: "red", paddingVertical: 3, backgroundColor: "white" }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 5 }}>
                    <Text style={{ fontWeight: "bold" }}>{I18n.t('tam_tinh')}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                        <Text style={{ fontWeight: "bold", fontSize: 18, color: "#0072bc" }}>{currencyToString(getTotalPrice())}đ</Text>
                    </View>
                </View>
            </View>
            <View style={{ height: 40, flexDirection: "row", backgroundColor: "#0072bc", alignItems: "center" }}>
                <TouchableOpacity
                    onPress={showMenu}>
                    <Menu
                        ref={setMenuRef}
                        button={<Icon style={{ paddingHorizontal: 10 }} name="menu" size={30} color="white" />}
                    >
                        <View style={{
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 5,
                        }}>
                            <TouchableOpacity onPress={() => sendNotidy(1)} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <MaterialIcons style={{ paddingHorizontal: 7 }} name="notifications" size={26} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('yeu_cau_thanh_toan')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => sendNotidy(2)} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: .5 }}>
                                <Icon style={{ paddingHorizontal: 10 }} name="message" size={22} color={Colors.colorchinh} />
                                <Text style={{ padding: 15, fontSize: 16 }}>{I18n.t('gui_thong_bao_toi_thu_ngan')}</Text>
                            </TouchableOpacity>
                        </View>
                    </Menu>
                </TouchableOpacity>
                <TouchableOpacity onPress={sendOrder} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase" }}>{I18n.t('gui_thuc_don')}</Text>
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
                <Text style={{ margin: 5, textTransform: "uppercase", fontSize: 15, fontWeight: "bold", marginLeft: 20, color: "#fff" }}>{itemOrder.Name}</Text>
            </View>
            <View style={{ padding: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "center", }} onPress={() => setShowModal(false)}>
                    <Text style={{ fontSize: 14, flex: 3 }}>{I18n.t('don_gia')}</Text>
                    <View style={{ alignItems: "center", flexDirection: "row", flex: 7, backgroundColor: "#D5D8DC" }}>
                        <Text style={{ padding: 7, flex: 1, fontSize: 14, borderWidth: 0.5, borderRadius: 4 }}>{currencyToString(itemOrder.Price)}</Text>
                    </View>

                </View>
                <View style={{ padding: 0, flexDirection: "row", justifyContent: "center" }} >
                    <Text style={{ fontSize: 14, flex: 3 }}>{I18n.t('so_luong')}</Text>
                    <View style={{ alignItems: "center", flexDirection: "row", flex: 7 }}>
                        <TouchableOpacity onPress={() => {
                            if (itemOrder.Quantity > 1) {
                                itemOrder.Quantity--
                                setItemOrder({ ...itemOrder })
                            }
                        }}>
                            <Text style={{ borderColor: Colors.colorchinh, borderWidth: 1, color: Colors.colorchinh, fontWeight: "bold", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5 }}>-</Text>
                        </TouchableOpacity>
                        <TextInput style={{ padding: 6, textAlign: "center", margin: 10, flex: 1, borderRadius: 4, borderWidth: 0.5, backgroundColor: "#D5D8DC" }} value={"" + itemOrder.Quantity} />
                        <TouchableOpacity onPress={() => {
                            itemOrder.Quantity++
                            setItemOrder({ ...itemOrder })
                        }}>
                            <Text style={{ borderColor: Colors.colorchinh, borderWidth: 1, color: Colors.colorchinh, fontWeight: "bold", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5 }}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ padding: 0, flexDirection: "row", justifyContent: "center" }} onPress={() => setShowModal(false)}>
                    <Text style={{ fontSize: 14, flex: 3 }}>{I18n.t('ghi_chu')}</Text>
                    <View style={{ flexDirection: "row", flex: 7 }}>
                        <TextInput
                            onChangeText={text => {
                                itemOrder.Description = text
                                setItemOrder({ ...itemOrder })
                            }}
                            numberOfLines={3}
                            multiline={true}
                            value={itemOrder.Description}

                            style={{ height: 50, paddingLeft: 5, flex: 7, fontStyle: "italic", fontSize: 12, borderWidth: 0.5, borderRadius: 4, backgroundColor: "#D5D8DC" }}
                            placeholder={I18n.t('nhap_ghi_chu')} />
                    </View>
                </View>
                <View style={{ alignItems: "center", justifyContent: "space-between", flexDirection: "row", marginTop: 10 }}>
                    <TouchableOpacity onPress={() => props.setShowModal(false)} style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, padding: 5, borderRadius: 4, backgroundColor: "#fff" }} >
                        <Text style={{ color: Colors.colorchinh, textTransform: "uppercase" }}>{I18n.t('huy')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onClickTopping()} style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, padding: 5, borderRadius: 4, backgroundColor: "#fff" }} >
                        <Text style={{ color: Colors.colorchinh, textTransform: "uppercase" }}>Topping</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onClickOk()} style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, padding: 5, borderRadius: 4, backgroundColor: Colors.colorchinh }} >
                        <Text style={{ color: "#fff", textTransform: "uppercase", }}>{I18n.t('dong_y')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

