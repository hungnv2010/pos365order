import React, { useEffect, useState, useRef, createRef } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import dataManager from '../../data/DataManager'
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import dialogManager from '../../components/dialog/DialogManager';
import I18n from '../../common/language/i18n';
import realmStore from '../../data/realm/RealmStore';
import MainToolBar from '../main/MainToolBar';
import { Metrics } from '../../theme';
import { useSelector, useDispatch } from 'react-redux';
import { Constant } from '../../common/Constant';
import colors from '../../theme/Colors';
import { NavigationEvents } from 'react-navigation';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// const numberColumn = 3;

// const listOrder = [
// //     {
// //     Id: 1,
// //     Name: "Bàn An"
// // },
// // {
// //     Id: 2,
// //     Name: "Bàn Huy"
// // },
// // {
// //     Id: 3,
// //     Name: "Bàn Hùng"
// // },
// // {
// //     Id: 4,
// //     Name: "Bàn Bắc"
// // },
// // {
// //     Id: 5,
// //     Name: "Bàn Tùng"
// // },
// // {
// //     Id: 6,
// //     Name: "Bàn Anh"
// // },
// // {
// //     Id: 7,
// //     Name: "Bàn An"
// // },
// // {
// //     Id: 8,
// //     Name: "Bàn Huy"
// // },
// // {
// //     Id: 9,
// //     Name: "Bàn Hùng"
// // },
// // {
// //     Id: 10,
// //     Name: "Bàn Bắc"
// // },
// // {
// //     Id: 11,
// //     Name: "Bàn Tùng"
// // },
// // {
// //     Id: 12,
// //     Name: "Bàn Anh"
// // }
// ]


export default (props) => {


    const [already, setAlready] = useState(false)
    const [listOrder, setListOrder] = useState([])
    const { deviceType } = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common
    });
    const dispatch = useDispatch();
    const numberColumn = useSelector(state => {
        console.log("useSelector state ", state);

        console.log("dataManager.dataChoosing ", dataManager.dataChoosing);
        let numberColumn = (state.Common.orientaition == Constant.LANDSCAPE) ? 5 : 3
        // if (state.Common.deviceType == Constant.TABLET) numberColumn++
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
        dialogManager.showLoading()
        await dataManager.syncAllDatas()
        dialogManager.hiddenLoading()
    }

    const removeItem = (item) => {
        console.log("removeItem ", item.Id);
        dialogManager.showPopupTwoButton("Bạn có chắc chắn muốn xoá bàn này?", I18n.t('thong_bao'), res => {
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

    const renderList = () => {
        return <FlatList
            style={{ padding: 5 }}
            data={listOrder}
            renderItem={({ item, index }) => (
                <TouchableOpacity
                    onPress={() => onClickOrder(item)}
                    key={item.Id}
                    style={{ borderRadius: 5, margin: numberColumn == 3 ? 5.8 : 6.4, padding: 15, width: widthRoom - 15, height: widthRoom - 15, backgroundColor: colors.colorLightBlue, justifyContent: "center", alignItems: "center" }}>
                    <Icon onPress={() => removeItem(item)} name="close-circle-outline" style={{ position: "absolute", top: 0, right: 0, paddingLeft: 5, paddingBottom: 5 }} size={30} color={"#fff"} />
                    <Text style={{ textAlign: "center", color: "#fff" }}>{item.Name}</Text>
                </TouchableOpacity>
            )}
            numColumns={numberColumn}
            keyExtractor={(item, index) => index.toString()}
            key={numberColumn}
        />
    }

    return (
        <View style={{ flex: 1 }}>
            <MainToolBar
                navigation={props.navigation}
                title={I18n.t('nhan_vien_order')}
                rightIcon="refresh"
                clickRightIcon={clickRightIcon} />
            {/* <Order {...props} already={already}></Order> */}
            {renderList()}
        </View>
    );
};