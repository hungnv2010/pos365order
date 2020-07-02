import React, { useEffect, useState, useRef, createRef } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, ImageBackground } from 'react-native';
import dataManager from '../../data/DataManager'
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import dialogManager from '../../components/dialog/DialogManager';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import MainToolBar from '../main/MainToolBar';
import { Metrics, Images } from '../../theme';
import { useSelector, useDispatch } from 'react-redux';
import { Constant } from '../../common/Constant';
import colors from '../../theme/Colors';
import { NavigationEvents } from 'react-navigation';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { currencyToString } from '../../common/Utils';
import { getFileDuLieuString, setFileLuuDuLieu } from '../../data/fileStore/FileStorage';
import DetailHistory from './DetailHistory';
import moment from 'moment';
import 'moment/min/locales'

export default (props) => {

    const [dataItem, setDataItem] = useState("")
    const [listOrder, setListOrder] = useState([])
    const { deviceType } = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common
    });
    const dispatch = useDispatch();
    const numberColumn = useSelector(state => {
        console.log("useSelector state ", state);
        console.log("dataManager.dataChoosing ", dataManager.dataChoosing);
        let numberColumn = (state.Common.orientaition == Constant.LANDSCAPE) ? 5 : 2
        if (state.Common.deviceType == Constant.TABLET) numberColumn++
        return numberColumn
    });

    useEffect(() => {
        moment.locale('vi');
    }, [])

    useFocusEffect(
        React.useCallback(() => {
            const getHistory = async () => {
                let history = await getFileDuLieuString(Constant.HISTORY_ORDER, true);
                if (history && history != "") {
                    history = JSON.parse(history)
                    console.log("useFocusEffect history ", history);
                    setListOrder([...history.reverse()]);
                }
            }
            getHistory();
            return;
        }, [])
    );

    const onClickOrder = (item) => {
        deviceType == Constant.TABLET ?
            setDataItem(item)
            :
            props.navigation.navigate('DetailHistory', item)
    }

    const totalProduct = (data) => {
        return data.length;
    }

    const getTotalPrice = (data) => {
        let total = 0;
        data.forEach(item => {
            if (item.ProductType != 2) {
                let price = item.IsLargeUnit ? item.PriceLargeUnit : item.Price
                let totalTopping = item.TotalTopping ? item.TotalTopping : 0
                total += (price + totalTopping) * item.Quantity
            }
        })
        return total
    }

    const renderItem = (item) => {
        return (
            <TouchableOpacity
                onPress={() => onClickOrder(item)}
                key={item.Id}
                style={{flexDirection: "row", borderRadius: 5, marginVertical: 4, padding: 20, width: "100%", borderColor: colors.colorchinh, borderWidth: 1, justifyContent: "center", alignItems: "center", backgroundColor: deviceType != Constant.PHONE && dataItem.time == item.time ? "#FFCC66" :  "#EED6A7" }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ textTransform: "uppercase", color: "#000", fontWeight: "bold" }}>{item.RoomName}</Text>
                    <Text style={{ color: "#000", marginTop: 10 }}>{I18n.t('so_san_pham')}: {totalProduct(item.list)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ textAlign: "right", color: "#000", marginTop: 10 }}>{I18n.t('tam_tinh')}: {currencyToString(getTotalPrice(item.list))} đ</Text>
                    {item.time && item.time != "" ? <Text style={{ color: "#0072bc", textAlign: "right", marginTop: 10 }}>{moment(item.time).fromNow()}</Text> : null}
                </View>
            </TouchableOpacity>
        )
    }

    const renderList = () => {
        if (deviceType == Constant.PHONE) {
            return <FlatList
                showsVerticalScrollIndicator={false}
                style={{ padding: 5 }}
                data={listOrder}
                renderItem={({ item, index }) => (
                    renderItem(item)
                )}
                numColumns={1}
                keyExtractor={(item, index) => index.toString()}
                key={1}
            />
        } else {
            return (
                <View style={{ flexDirection: "row", flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            style={{ padding: 5, flex: 1 }}
                            data={listOrder}
                            renderItem={({ item, index }) => (
                                renderItem(item)
                            )}
                            numColumns={1}
                            keyExtractor={(item, index) => index.toString()}
                            key={1}
                        />
                    </View>
                    <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: colors.colorchinh }}>
                        <DetailHistory data={dataItem} />
                    </View>
                </View>)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('nhan_vien_order')}
            />
            {listOrder.length > 0 ?
                renderList()
                :
                <View style={{ alignItems: "center", flex: 1 }}>
                    <ImageBackground resizeMode="contain" source={Images.logo_365_long_color} style={{ flex: 1, opacity: 0.7, margin: 20, width: Metrics.screenWidth / 2 }}>
                    </ImageBackground>
                </View>
            }
        </View>
    );
};