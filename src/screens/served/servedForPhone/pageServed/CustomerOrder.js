import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableWithoutFeedback, TouchableOpacity, Modal, TextInput, ImageBackground, Platform } from 'react-native';
import { Colors, Images, Metrics } from '../../../../theme';
import Menu from 'react-native-material-menu';
import dataManager from '../../../../data/DataManager';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ApiPath } from '../../../../data/services/ApiPath';
import dialogManager from '../../../../components/dialog/DialogManager';
import { HTTPService } from '../../../../data/services/HttpService';
import { getFileDuLieuString } from '../../../../data/fileStore/FileStorage';
import { Constant } from '../../../../common/Constant';
import TextTicker from 'react-native-text-ticker';
import { currencyToString } from '../../../../common/Utils'
import I18n from "../../../../common/language/i18n"
import { Snackbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';


export default (props) => {

    const [listPosition, setListPosition] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [list, setListOrder] = useState(() => props.listProducts)
    const [vendorSession, setVendorSession] = useState({})
    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [itemOrder, setItemOrder] = useState({})
    const [listTopping, setListTopping] = useState([])

    const dispatch = useDispatch();


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
            syncListProducts([])
        }
    }, [props.Position, listPosition])


    useEffect(() => {
        console.log(listTopping, 'listTopping');
        console.log(itemOrder, 'itemOrder');

        const getInfoTopping = (lt) => {
            let description = '';
            let totalPrice = 0;
            lt.forEach(item => {
                if (item.Quantity > 0) {
                    description += ` -- ${item.Name} x ${item.Quantity} = ${currencyToString(item.Quantity * item.Price)} ; \n`
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
                if (element.Description != '') {
                    obj.Description = element.Description
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
                            console.log("dellAll ok == ", item.data.length, props.Position);
                            item.data = item.data.filter(it => it.key != props.Position)
                            console.log("dellAll ok ", item.data.length, props.Position);
                            if (item.data.length == 0) {
                                hasData = false
                            }
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

    const getTotalPrice = () => {
        let total = 0;
        list.forEach(item => {
            if (item.ProductType != 2) {
                let price = item.IsLargeUnit ? item.PriceLargeUnit : item.Price
                let totalTopping = item.TotalTopping ? item.TotalTopping : 0
                total += (price + totalTopping) * item.Quantity
            }
        })
        return total
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
                if (item.ProductType == 2) {
                    setToastDescription(I18n.t("ban_khong_co_quyen_dieu_chinh_mat_hang_thoi_gian"))
                    setShowToast(true)
                    return
                }
                console.log("setItemOrder ", item);
                setItemOrder(item)
                setShowModal(!showModal)
            }}>
                <View style={styles.mainItem}>
                    <TouchableOpacity
                        style={{ paddingHorizontal: 5 }}
                        onPress={removeItem}>
                        <Icon name="trash-can-outline" size={40} color="black" />
                    </TouchableOpacity>
                    <View style={{ flex: 1, }}>
                        <TextTicker
                            style={{ fontWeight: "bold", marginBottom: 7 }}
                            duration={6000}
                            marqueeDelay={1000}>
                            {item.Name}
                        </TextTicker>
                        <Text style={{ fontSize: 12 }}>{currencyToString(item.Price)} x <Text style={{ color: "red", fontWeight: "bold" }}>{Math.round(item.Quantity * 1000) / 1000}</Text></Text>
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
                    {item.ProductType == 2 ?
                        null
                        :
                        <TouchableOpacity
                            style={{ marginRight: 5, borderWidth: 1, borderRadius: 50, padding: 3, borderColor: Colors.colorchinh }}
                            onPress={() => onClickTopping(item)}>
                            <Icon name="puzzle" size={25} color={Colors.colorchinh} />
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
                        renderItem={({ item, index }) => renderForPhone(item, index)}
                        keyExtractor={(item, index) => '' + index}
                    />
                    :
                    <ImageBackground resizeMode="contain" source={Images.logo_365} style={{ flex: 1, opacity: .2, margin: 20 }}>
                    </ImageBackground>
                }
            </View>
            <View style={styles.wrapTamTinh}>
                <View style={styles.tamTinh}>
                    <Text style={styles.textTamTinh}>{I18n.t('tam_tinh')}</Text>
                    <View style={styles.totalPrice}>
                        <Text style={{ fontWeight: "bold", fontSize: 18, color: "#0072bc" }}>{currencyToString(getTotalPrice())} đ</Text>
                    </View>
                </View>
            </View>
            <View style={styles.footerMenu}>
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
                            marginBottom: Platform.OS == 'ios' ? Metrics.screenHeight / 10 : 0
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
        <View >
            <View style={styles.headerModal}>
                <Text style={styles.headerModalText}>{itemOrder.Name}</Text>
            </View>
            <View style={{ padding: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "center", }} onPress={() => setShowModal(false)}>
                    <Text style={{ fontSize: 14, flex: 3 }}>{I18n.t('don_gia')}</Text>
                    <View style={styles.wrapTextPriceModal}>
                        <Text style={styles.textPriceModal}>{currencyToString(itemOrder.Price)}</Text>
                    </View>

                </View>
                <View style={{ padding: 0, flexDirection: "row", justifyContent: "center" }} >
                    <Text style={{ fontSize: 14, flex: 3 }}>{I18n.t('so_luong')}</Text>
                    <View style={{ alignItems: "center", flexDirection: "row", flex: 7 }}>
                        <TouchableOpacity onPress={() => {
                            if (itemOrder.Quantity > 0) {
                                itemOrder.Quantity--
                                setItemOrder({ ...itemOrder })
                            }
                        }}>
                            <Text style={styles.button}>-</Text>
                        </TouchableOpacity>
                        <TextInput style={styles.textQuantityModal} value={"" + itemOrder.Quantity} />
                        <TouchableOpacity onPress={() => {
                            itemOrder.Quantity++
                            setItemOrder({ ...itemOrder })
                        }}>
                            <Text style={styles.button}>+</Text>
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
                            style={styles.descModal}
                            placeholder={I18n.t('nhap_ghi_chu')} />
                    </View>
                </View>
                <View style={styles.wrapAllButtonModal}>
                    <TouchableOpacity onPress={() => props.setShowModal(false)} style={styles.wrapButtonModal} >
                        <Text style={styles.buttonModal}>{I18n.t('huy')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onClickTopping()} style={styles.wrapButtonModal} >
                        <Text style={styles.buttonModal}>Topping</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onClickOk()} style={[styles.wrapButtonModal, { backgroundColor: Colors.colorchinh }]} >
                        <Text style={{ color: "#fff", textTransform: "uppercase", }}>{I18n.t('dong_y')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    mainItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        paddingVertical: 10,
        borderBottomColor: "#ABB2B9",
        borderBottomWidth: 0.5,
    },
    wrapTamTinh: {
        borderTopWidth: .5, borderTopColor: "red", paddingVertical: 3, backgroundColor: "white"
    },
    tamTinh: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 5
    },
    textTamTinh: {
        fontWeight: "bold"
    },
    totalPrice: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-around"
    },
    footerMenu: {
        height: 40, flexDirection: "row", backgroundColor: "#0072bc", alignItems: "center"
    },
    headerModal: {
        backgroundColor: Colors.colorchinh, borderTopRightRadius: 4, borderTopLeftRadius: 4,
    },
    headerModalText: {
        margin: 5, textTransform: "uppercase", fontSize: 15, fontWeight: "bold", marginLeft: 20, color: "#fff"
    },
    button: {
        borderColor: Colors.colorchinh,
        borderWidth: 1,
        color: Colors.colorchinh,
        fontWeight: "bold",
        paddingHorizontal: 17,
        paddingVertical: 10,
        borderRadius: 5
    },
    textPriceModal: {
        padding: 7, flex: 1, fontSize: 14, borderWidth: 0.5, borderRadius: 4
    },
    wrapTextPriceModal: {
        alignItems: "center", flexDirection: "row", flex: 7, backgroundColor: "#D5D8DC"
    },
    wrapAllButtonModal: {
        alignItems: "center", justifyContent: "space-between", flexDirection: "row", marginTop: 10
    },
    wrapButtonModal: {
        alignItems: "center",
        margin: 2,
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.colorchinh,
        padding: 5,
        borderRadius: 4,
        backgroundColor: "#fff"
    },
    buttonModal: {
        color: Colors.colorchinh, textTransform: "uppercase"
    },
    descModal: {
        height: 50,
        flex: 7,
        fontStyle: "italic",
        fontSize: 12,
        borderWidth: 0.5,
        borderRadius: 4,
        backgroundColor: "#D5D8DC",
        padding: 5
    },
    textQuantityModal: {
        padding: 6,
        textAlign: "center",
        margin: 10,
        flex: 1,
        borderRadius: 4,
        borderWidth: 0.5,
        backgroundColor: "#D5D8DC"
    },
});

