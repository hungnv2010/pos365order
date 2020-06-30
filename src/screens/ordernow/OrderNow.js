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

export default (props) => {

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

    const widthRoom = Dimensions.get('screen').width / numberColumn;

    useEffect(() => {
        console.log("dataManager.dataChoosing ", dataManager.dataChoosing);
        setListOrder(dataManager.dataChoosing);
    }, [])

    useFocusEffect(
        React.useCallback(() => {
            console.log("useFocusEffect dataManager.dataChoosing ", dataManager.dataChoosing);
            setListOrder([...dataManager.dataChoosing]);
        }, [])
    );

    const clickRightIcon = async () => {
        dialogManager.showPopupOneButton(I18n.t("chuc_nang_dang_duoc_phat_trien"), I18n.t('thong_bao'))
    }

    const removeItem = (item) => {
        console.log("removeItem ", item.Id);
        dialogManager.showPopupTwoButton(I18n.t("ban_co_chac_chan_muon_xoa_ban_nay"), I18n.t('thong_bao'), res => {
            if (res == 1) {
                let tempListPosition = dataManager.dataChoosing.filter(el => el.Id != item.Id)
                dataManager.dataChoosing = tempListPosition;
                console.log("removeItem tempListPosition ", tempListPosition);
                setListOrder([...tempListPosition]);
                dispatch({ type: 'NUMBER_ORDER', numberOrder: dataManager.dataChoosing.length })
            }
        })
    }
    const onClickOrder = (item) => {
        deviceType == Constant.TABLET ?
            props.navigation.navigate('ServedForTablet', { room: { Id: item.Id, Name: item.Name, ProductId: item.ProductId } })
            :
            props.navigation.navigate('PageServed', { room: { Id: item.Id, Name: item.Name, ProductId: item.ProductId } })

    }

    const totalProduct = (data) => {
        let total = 0;
        data.forEach(element => {
            total += element.list.length;
        });
        return total;
    }

    // const totalPriceProduct = (data) => {
    //     let total = 0;
    //     data.forEach(element => {
    //         element.list.array.forEach(element => {

    //         });
    //     });
    //     return total;
    // }

    const getTotalPrice = (data) => {
        let total = 0;
        data.forEach(element => {
            element.list.forEach(item => {
                if (item.ProductType != 2) {
                    let price = item.IsLargeUnit ? item.PriceLargeUnit : item.Price
                    let totalTopping = item.TotalTopping ? item.TotalTopping : 0
                    total += (price + totalTopping) * item.Quantity
                }
            })
        })
        return total
    }

    const renderList = () => {
        return <FlatList
            style={{ padding: 5 }}
            data={listOrder}
            renderItem={({ item, index }) => (
                <TouchableOpacity
                    onPress={() => onClickOrder(item)}
                    key={item.Id}
                    style={{ borderRadius: 5, margin: numberColumn == 2 ? 5.8 : 6.4, padding: 15, width: widthRoom - 15, height: widthRoom - 15, borderColor: colors.colorchinh, borderWidth: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#EED6A7" }}>
                    <Icon onPress={() => removeItem(item)} name="close-circle-outline" style={{ position: "absolute", top: 0, right: 0, paddingLeft: 5, paddingBottom: 5 }} size={30} color={"#808080"} />
                    <Text style={{ textAlign: "center", textTransform: "uppercase", color: "#000", fontWeight: "bold" }}>{item.Name}</Text>
                    <Text style={{ textAlign: "center", color: "#000", marginTop: 10 }}>Số sản phẩm: {totalProduct(item.data)}</Text>
                    <Text style={{ textAlign: "center", color: "#000", marginTop: 10 }}>Tạm tính: {currencyToString(getTotalPrice(item.data))} đ</Text>
                </TouchableOpacity>
            )}
            numColumns={numberColumn}
            keyExtractor={(item, index) => index.toString()}
            key={numberColumn}
        />
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('nhan_vien_order')}
                rightIcon="plus"
                clickRightIcon={clickRightIcon}
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