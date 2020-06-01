import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    findNodeHandle
} from 'react-native';
import Images from '../../../theme/Images';
import I18n from '../../../common/language/i18n';
import realmStore from '../../../data/realm/RealmStore'
import { useSelector, useDispatch } from 'react-redux';
import { currencyToString, dateUTCToMoment, momentToDateUTC } from '../../../common/Utils'
import moment from "moment";
import { Constant } from '../../../common/Constant'
import { Colors } from 'react-native/Libraries/NewAppScreen';
import colors from '../../../theme/Colors';
import TextTicker from 'react-native-text-ticker';

const _nodes = new Map();

export default (props) => {


    useEffect(() => {
        // _nodes = new Map();
    }, [])

    const onItemPress = (item) => {
        console.log(item, 'item', props);
        props.navigation.navigate('Served', { room: { Id: item.Id, Name: item.Name, Position: 'A' } })
    }

    const renderRoom = (item, widthRoom) => {
        widthRoom = parseInt(widthRoom)
        return item.isEmpty ?
            (<View style={{ width: widthRoom - 5 }}></View>)
            :
            (<TouchableOpacity onPress={() => { onItemPress(item) }} key={item.Id}
                style={[styles.room, { width: widthRoom - 5, height: widthRoom, backgroundColor: item.IsActive ? colors.colorLightBlue : 'white' }]}>
                <View style={{ flex: 1, flexDirection: 'column', justifyContent: "center", alignItems: "center" }}>
                    <View style={{ alignItems: "center", padding: 0, flex: 1 }}>
                        {/* <Text style={{ fontSize: 13, textAlign: "center", textTransform: "uppercase", margin: 10, marginTop: 18, color: item.IsActive ? 'white' : 'black' }}>{item.Name}</Text> */}
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

    const numberColumn = useSelector(state => {
        console.log("useSelector state ", state);
        let numberColumn = (state.Common.orientaition == Constant.LANDSCAPE) ? 8 : 4
        if (state.Common.deviceType == Constant.TABLET) numberColumn++
        return numberColumn
    });

    let rooms = []
    let roomGroups = []
    let serverEvents = []
    const [datas, setData] = useState([])
    const [valueAll, setValueAll] = useState({})
    const widthRoom = Dimensions.get('screen').width / numberColumn;

    const [indexRoom, setIndexRoom] = useState(0)

    const RoomAll = { Name: "Tất cả", Id: "All" }
    const [listRoom, setListRoom] = useState([])

    useEffect(() => {
        init()
        return () => {
            realmStore.removeAllListener()
        }
    }, [props.forceUpdate])



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

    let refScroll = null;

    const scrollToInitialPosition = () => {
        refScroll.scrollTo({ y: 500 })
    }

    let indexGroup = 0;
    let listNode = [];


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
                                    console.log("listNode ", listNode);
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
                <View style={{ flexDirection: "row", flex: 1 }}>
                    <Image source={Images.icon_transfer_money} style={{ width: 20, height: 20 }}></Image>
                    <Text>{currencyToString(valueAll.cash)}</Text>
                </View>
                <View style={{ flexDirection: "row", flex: 1, justifyContent: "space-around" }}>
                    <View style={{ backgroundColor: colors.colorLightBlue, justifyContent: "center", borderRadius: 5 }}>
                        <Text style={{ color: "white", fontSize: 12, paddingHorizontal: 2 }}>{valueAll.use}/{valueAll.room}</Text>
                    </View>
                    <Text>{I18n.t('dang_dung')}</Text>
                </View>
                <View style={{ flexDirection: "row", flex: 1, justifyContent: "space-around" }}>
                    <View style={{ backgroundColor: "white", height: 20, width: 20, borderRadius: 5 }}></View>
                    <Text>{I18n.t('dang_trong')}</Text>
                </View>
            </View>
            <View style={{ flex: 1, padding: 3}}>
                <ScrollView scrollToOverflowEnabled={true} showsVerticalScrollIndicator={false} ref={(ref) => refScroll = ref} style={{ flex: 1 }}>
                    <View style={styles.containerRoom}>
                        {datas ?
                            datas.map((data, idx) =>
                                <View
                                    key={idx}
                                    onLayout={(e) => {
                                        footerY = e.nativeEvent.layout.y;
                                        if (data.isGroup) {
                                            console.log("footerY ", footerY);
                                            _nodes.set(data.Id, footerY)
                                            listNode.push({ Id: data.Id, footerY: footerY })
                                        }
                                    }}
                                    // ref={ref => {
                                    //     if (data.isGroup)
                                    //         _nodes.set(idx, ref)
                                    // }} 
                                    style={{ flexDirection: "row" }}>
                                    {data.isGroup ? renderRoomGroup(data) : renderRoom(data, widthRoom)}
                                </View>
                            ) : null
                        }
                    </View>
                </ScrollView>
            </View>
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