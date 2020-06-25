import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
    Modal,
    TouchableWithoutFeedback
} from 'react-native';
import I18n from '../../../common/language/i18n';
import realmStore from '../../../data/realm/RealmStore'
import { useSelector, useDispatch } from 'react-redux';
import { currencyToString, dateUTCToMoment, momentToDateUTC } from '../../../common/Utils'
import moment from "moment";
import { Constant } from '../../../common/Constant';
import { Images, Metrics } from '../../../theme';
import colors from '../../../theme/Colors';
import TextTicker from 'react-native-text-ticker';
import { Checkbox } from 'react-native-paper';
import { HTTPService } from '../../../data/services/HttpService';
import dialogManager from '../../../components/dialog/DialogManager';
import { ApiPath } from '../../../data/services/ApiPath';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import dataManager from '../../../data/DataManager';
import { useFocusEffect } from '@react-navigation/native';

const _nodes = new Map();

export default (props) => {

    const [showModal, setShowModal] = useState(false)
    const [loadDone, setLoadDone] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [listPosition, setListPosition] = useState([
        { position: "A", checked: true },
        { position: "B", checked: false },
        { position: "C", checked: false },
        { position: "D", checked: false },
    ])
    const [listOrder, setListOrder] = useState([])
    const [indexRoom, setIndexRoom] = useState(0)
    const toRoomId = useRef()
    const dispatch = useDispatch();

    const { deviceType } = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common
    });

    const numberColumn = useSelector(state => {
        console.log("useSelector state ", state);
        let numberColumn = (state.Common.orientaition == Constant.LANDSCAPE) ? 8 : 4
        if (state.Common.deviceType == Constant.TABLET) numberColumn++
        return numberColumn
    });

    let rooms = []
    let roomGroups = []
    let serverEvents = null
    const [datas, setData] = useState([])
    const [valueAll, setValueAll] = useState({})
    const widthRoom = Dimensions.get('screen').width / numberColumn;
    const RoomAll = { Name: "Tất cả", Id: "All" }
    const [listRoom, setListRoom] = useState([])

    useEffect(() => {
        return () => {
            if (serverEvents) serverEvents.removeAllListeners()
        }
    }, [])

    useEffect(() => {
        if (props.already || (props.route.params && props.route.params.Name)) {
            init()
        }
    }, [props.already])

    useFocusEffect(
        React.useCallback(() => {
            console.log("useFocusEffect Main ", dataManager.dataChoosing);
            setListOrder(() => dataManager.dataChoosing.map(item => item.Id))
            dispatch({ type: 'NUMBER_ORDER', numberOrder: dataManager.dataChoosing.length })
        }, [])
    );


    const init = async () => {
        rooms = await realmStore.queryRooms()
        roomGroups = await realmStore.queryRoomGroups()
        serverEvents = await realmStore.queryServerEvents()
        console.log("init: ", JSON.parse(JSON.stringify(rooms, roomGroups, serverEvents)));

        let newDatas = insertServerEvent(getDatas(rooms, roomGroups), serverEvents)
        console.log("init: newDatas ", newDatas);

        setData(newDatas)

        let list = []
        list = [RoomAll].concat(newDatas.filter(item => item.isGroup))
        console.log("list  ======= ", list.length);

        setListRoom(list)

        serverEvents.addListener((collection, changes) => {
            if (changes.insertions.length || changes.modifications.length) {
                let newDatas = insertServerEvent(getDatas(rooms, roomGroups), serverEvents)
                setData(newDatas)
            }
        })

        setLoadDone(true)
    }

    const getDatas = (rooms, roomGroups) => {
        let newDatas = []
        if (rooms && rooms.length > 1) rooms.sorted('Position')
        if (roomGroups) {
            roomGroups.forEach(roomGroup => {
                let roomsInside = rooms.filtered(`RoomGroupId == ${roomGroup.Id}`)
                let lengthRoomsInside = roomsInside.length
                if (roomsInside && lengthRoomsInside > 0) {
                    roomGroup.isGroup = true
                    newDatas.push(roomGroup)
                    newDatas = newDatas.concat(roomsInside.slice())
                }
            })

            let otherGroup = { Id: 0, Name: 'Other', isGroup: true }
            let roomsInside = rooms.filtered(`RoomGroupId == ${otherGroup.Id}`)
            let lengthRoomsInside = roomsInside.length
            if (roomsInside && lengthRoomsInside > 0) {
                newDatas.push(otherGroup)
                newDatas = newDatas.concat(roomsInside.slice())
            }
        }
        else
            newDatas = rooms

        console.log("getDatas", newDatas);

        return newDatas
    }

    const insertServerEvent = (newDatas, serverEvents) => {
        let totalCash = 0
        let totalUse = 0
        newDatas.forEach(data => {
            if (data.Id != undefined) {
                let listFiters = serverEvents.filtered(`RoomId == ${data.Id}`)
                if (listFiters && listFiters.length > 0) {
                    let Total = 0
                    let RoomMoment = ""
                    let IsActive = false
                    listFiters.forEach(elm => {
                        let JsonContentJS = JSON.parse(elm.JsonContent)
                        Total += JsonContentJS.Total ? JsonContentJS.Total : 0
                        if (JsonContentJS.ActiveDate) {
                            let ActiveMoment = dateUTCToMoment(JsonContentJS.ActiveDate)
                            if (!RoomMoment) RoomMoment = ActiveMoment
                            else if (ActiveMoment.isBefore(RoomMoment)) RoomMoment = ActiveMoment
                        }
                        if (JsonContentJS.OrderDetails && JsonContentJS.OrderDetails.length) IsActive = true
                    })
                    data.Total = Total
                    totalCash += Total
                    data.RoomMoment = RoomMoment
                    data.IsActive = IsActive
                    if (IsActive) totalUse++
                }
            }
        })
        console.log("insertServerEvent: ", newDatas);

        setValueAll({ cash: totalCash, use: totalUse, room: rooms.length })

        return newDatas
    }


    const onChangeTable = () => {
        const { FromRoomId, FromPos } = props.route.params
        let params = { ServeChangeTableEntities: [] }
        let toPos = listPosition.filter(item => item.checked === true)[0].position
        console.log('params', { FromRoomId: FromRoomId, FromPos: FromPos, ToRoomId: toRoomId.current.Id, toPos: toPos });
        params.ServeChangeTableEntities.push({ FromRoomId: FromRoomId, FromPos: FromPos, ToRoomId: toRoomId.current.Id, toPos: toPos })
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.CHANGE_TABLE).POST(params).then((res) => {
            console.log("onChangeTable res ", res);
            setShowToast(!showToast)
            dialogManager.hiddenLoading()
        }).catch((e) => {
            console.log("onChangeTable err ", e);
            dialogManager.hiddenLoading()
        })
        // props.navigation.navigate('PageServed', { room: toRoomId.current, Position: toPos })
        props.navigation.goBack()
    }

    let refScroll = null;

    const scrollToInitialPosition = () => {
        refScroll.scrollTo({ y: 500 })
    }

    const onItemPress = ({ Id, Name, ProductId }) => {
        if (props.route.params && props.route.params.Name) {
            toRoomId.current = { Id: Id, Name: Name, ProductId: ProductId }
            setShowModal(!showModal)
        } else {
            deviceType == Constant.TABLET ?
                props.navigation.navigate('ServedForTablet', { room: { Id: Id, Name: Name, ProductId: ProductId } })
                :
                props.navigation.navigate('PageServed', { room: { Id: Id, Name: Name, ProductId: ProductId } })
        }
    }

    const renderRoom = (item, widthRoom) => {
        widthRoom = parseInt(widthRoom)
        return item.isEmpty ?
            (<View style={{ width: widthRoom - 5 }}></View>)
            :
            (<TouchableOpacity onPress={() => { onItemPress(item) }} key={item.Id}
                style={[styles.room, { width: widthRoom - 5, height: widthRoom, backgroundColor: item.IsActive ? colors.colorLightBlue : 'white', borderColor: listOrder.includes(item.Id) ? colors.colorchinh : "#fff", borderWidth: listOrder.includes(item.Id) ? 1 : 0 }]}>
                <View style={{ flex: 1, flexDirection: 'column', justifyContent: "center", alignItems: "center" }}>
                    <View style={{ alignItems: "center", padding: 0, flex: 1 }}>
                        <View style={{ justifyContent: "center", alignItems: "center", flex: 1, height: "90%" }}>
                            <TextTicker
                                style={{
                                    fontSize: 13, textAlign: "center", textAlignVertical: "center", textTransform: "uppercase", padding: 4, marginTop: 0, color: item.IsActive ? 'white' : 'black'
                                }}
                                duration={6000}
                                bounce={false}
                                marqueeDelay={1000}
                            >
                                {item.Name}
                            </TextTicker>
                        </View>

                    </View>
                    <View style={{ height: 0.5, width: "90%", backgroundColor: "#ddd", justifyContent: "center", alignItems: "center" }}></View>
                    <View style={{ justifyContent: "center", padding: 0, alignItems: "center", flex: 2 }}>
                        {item.IsActive ?
                            <Text style={{ paddingTop: 0, fontSize: 10, textAlign: "center", color: item.IsActive ? 'white' : 'black' }}>{item.RoomMoment && item.IsActive ? moment(item.RoomMoment._i).fromNow() : ""}</Text>
                            : null}
                        <Text style={{ paddingTop: item.IsActive ? 10 : 0, color: item.IsActive ? "#fff" : "#000", textAlign: "center", fontSize: 10 }}>{item.IsActive ? currencyToString(item.Total) : "Sắn sàng"}</Text>
                    </View>
                    {/* {
                        listOrder.includes(item.Id) ?
                            <Icon style={{ position: "absolute", right: 3, top: 3 }} name="pencil" size={20} color="black" />
                            :
                            null
                    } */}
                </View>
            </TouchableOpacity>
            );
    }

    const renderRoomGroup = (item) => {
        return (
            <View key={item.Id} style={styles.roomGroup}>
                <Text style={{ padding: 0, fontSize: 16, textTransform: "uppercase", color: colors.colorLightBlue, paddingLeft: 3 }}>{item.Name}</Text>
            </View>
        )
    }


    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 40 }}>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ backgroundColor: colors.colorchinh }}>
                    {listRoom ?
                        listRoom.map((data, index) =>
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    setIndexRoom(index)
                                    console.log("_nodes.size ", _nodes.size);
                                    const node = _nodes.get(data.Id);
                                    console.log("node ", node);
                                    refScroll.scrollTo({ y: node })
                                }} style={{ height: "100%", justifyContent: "center", alignItems: "center", paddingHorizontal: 15 }}>
                                <Text style={{ color: indexRoom == index ? "#444444" : "#fff", textTransform: 'uppercase' }}>{data.Name}</Text>
                            </TouchableOpacity>
                        )
                        : null}
                </ScrollView>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "red" }}>
                <View style={{ flexDirection: "row", flex: 1.2, justifyContent: "flex-start" }}>
                    <Image source={Images.icon_transfer_money} style={{ width: 20, height: 20 }}></Image>
                    <Text style={{ marginTop: 2 }}>{currencyToString(valueAll.cash)}</Text>
                </View>
                <View style={{ flexDirection: "row", flex: 1, justifyContent: "center" }}>
                    <View style={{ backgroundColor: colors.colorLightBlue, justifyContent: "center", borderRadius: 5, marginRight: 5 }}>
                        <Text style={{ color: "white", fontSize: 12, paddingHorizontal: 2 }}>{valueAll.use}/{valueAll.room}</Text>
                    </View>
                    <Text>{I18n.t('dang_dung')}</Text>
                </View>
                <View style={{ flexDirection: "row", flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
                    <View style={{ backgroundColor: "white", height: 20, width: 20, borderRadius: 5, marginRight: 5 }}></View>
                    <Text>{I18n.t('dang_trong')}</Text>
                </View>
            </View>
            <View style={{ flex: 1, padding: 2 }}>
                {
                    loadDone ?
                        <ScrollView scrollToOverflowEnabled={true} showsVerticalScrollIndicator={false} ref={(ref) => refScroll = ref} style={{ flex: 1 }}>
                            <View style={styles.containerRoom}>
                                {datas ?
                                    datas.map((data, idx) =>
                                        <View
                                            key={idx}
                                            onLayout={(e) => {
                                                let footerY = e.nativeEvent.layout.y;
                                                if (data.isGroup) {
                                                    console.log("footerY ", footerY);
                                                    _nodes.set(data.Id, footerY)
                                                }
                                            }}
                                            style={{ flexDirection: "row" }}>
                                            {data.isGroup ? renderRoomGroup(data) : renderRoom(data, widthRoom)}
                                        </View>
                                    ) : null
                                }
                            </View>
                        </ScrollView>
                        :
                        props.route.params && props.route.params.Name ?

                            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                <ActivityIndicator size="large" style={{}} color={colors.colorchinh} />
                            </View>
                            :
                            null
                }
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
                            <Text style={{ fontSize: 20, paddingHorizontal: 20, paddingVertical: 15, fontWeight: "bold" }}>{I18n.t('chon_vi_tri')}</Text>
                            {listPosition.map((item, index) => {
                                return (
                                    <View key={index} style={{ flexDirection: "row", alignItems: "center", }}>
                                        <Checkbox
                                            color="orange"
                                            status={item.checked ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                listPosition.forEach(lp => { lp.checked = false })
                                                listPosition[index].checked = !listPosition[index].checked;
                                                setListPosition([...listPosition])
                                            }}
                                        />
                                        <Text style={{ marginLeft: 20, fontSize: 20 }}>[{item.position}]</Text>
                                    </View>
                                )
                            })}
                            <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: 15, alignItems: "center" }}>
                                <TouchableOpacity style={{ paddingRight: 20 }} onPress={() => { setShowModal(!showModal) }}>
                                    <Text style={{ padding: 10 }}>{I18n.t('huy')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onChangeTable}>
                                    <Text style={{ paddingVertical: 10, backgroundColor: "#008CBA", borderRadius: 5, paddingHorizontal: 20, color: "white" }}>{I18n.t('dong_y')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 16,
    },
    containerRoom: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap', alignContent: 'flex-start',
        justifyContent: 'flex-start'
    },
    room: {
        justifyContent: "center",
        margin: 2,
        borderRadius: 4
    },
    roomGroup: {
        // backgroundColor: "white",
        marginVertical: 4,
        flexDirection: "row", alignItems: "center",
        width: "100%",
        borderBottomColor: "#ddd", borderBottomWidth: 0
    },
    header: {
        fontSize: 32,
        backgroundColor: "#fff"
    },
    title: {
        fontSize: 24
    }
});