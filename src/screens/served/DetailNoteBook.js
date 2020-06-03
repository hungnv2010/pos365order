import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, RefreshControl, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import { WebView } from 'react-native-webview';
import useDidMountEffect from '../../customHook/useDidMountEffect';
import dialogManager from '../../components/dialog/DialogManager';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import ToolBarPreviewHtml from '../../components/toolbar/ToolBarPreviewHtml';
import JsonContent1 from '../../data/json/data_print_demo'
import { dateToDate, DATE_FORMAT, currencyToString } from '../../common/Utils';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import { Snackbar } from 'react-native-paper';
import printService from '../../data/html/PrintService';
import ToolBarNoteBook from '../../components/toolbar/ToolBarNoteBook';
import I18n from '../../common/language/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';

export default (props) => {

    const [dataList, setDataList] = useState([]);
    const [listRefreshing, setListRefreshing] = useState(false)
    const [TotalPrice, setTotalPrice] = useState(0)

    useEffect(() => {
        console.log("props ", props);

        // setDataList(props.route.params)
        getData(props.route.params)
    }, [])

    const getData = (Id = "") => {
        // Includes=Product&NotebookId=4497&%24inlinecount=allpages&%24top=10
        let params = { inlinecount: "allpages", top: 20, Includes: "Product", NotebookId: Id };
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.DETAIL_NOTE_BOOK).GET(params).then((res) => {
            console.log("getDetailNoteBook res ", res);
            setListRefreshing(false);
            if (res.results && res.results.length > 0) {
                setDataList(res.results)
                let total = 0;
                res.results.forEach(element => {
                    total += element.Price * element.Quantity;
                });
                setTotalPrice(total)
            } else {
                setDataList([])
            }
            dialogManager.hiddenLoading()
        }).catch((e) => {
            // setListRefreshing(false);
            console.log("getDetailNoteBook err ", e);
            dialogManager.hiddenLoading()
        })
    }

    return (
        <View style={styles.container}>
            <ToolBarDefault
                {...props}
                leftIcon="keyboard-backspace"
                title={I18n.t('so_tay_ban_hang_nhanh')}
                clickLeftIcon={() => { props.navigation.goBack() }}
            />
            <ScrollView style={styles.container}>
                {
                    dataList.length > 0 ?
                        dataList.map(item => (
                            <View style={{ height: 60, marginHorizontal: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomColor: "#ddd", borderBottomWidth: 0.5 }}>
                                <TouchableOpacity style={{ flex: 1, height: "100%", justifyContent: "center" }}>
                                    <Text style={{}}>{item.Product.Name}</Text>
                                    <View style={{ marginTop: 10, flexDirection: "row" }}>
                                        <Text style={{}}>{item.Price} x </Text>
                                        <Text style={{}}>{item.Quantity}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>))
                        : null
                }
            </ScrollView>
            <View style={{ margin: 10, flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontWeight: "bold" }}>Tổng thành tiền </Text>
                <Text style={{ color: Colors.colorchinh, fontWeight: "bold" }}>{TotalPrice} đ</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 }
})
