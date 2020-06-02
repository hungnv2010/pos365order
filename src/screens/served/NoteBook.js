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

export default (props) => {

    const [showToast, setShowToast] = useState(false);
    const [toastDescription, setToastDescription] = useState("")
    const [dataList, setDataList] = useState([]);
    const [listRefreshing, setListRefreshing] = useState(false)

    useEffect(() => {
        // https://oke.pos365.vn/api/notebooks?format=json&%24inlinecount=allpages&%24top=20
        const getDataNoteBook = async () => {
            getData()
        };
        getDataNoteBook();
    }, [])

    const getData = () => {
        let params = { inlinecount: "allpages", top: 20 };
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.NOTE_BOOK).GET(params).then((res) => {
            console.log("getNoteBook res ", res);
            setListRefreshing(false);
            if (res.results && res.results.length > 0) {
                setDataList(res.results)
            } else {
                setDataList([])
            }
            dialogManager.hiddenLoading()
        }).catch((e) => {
            setListRefreshing(false);
            console.log("getNoteBook err ", e);
            dialogManager.hiddenLoading()
        })
    }


    const outputIsSelectProduct = () => {

    }

    const refreshList = () => {
        setListRefreshing(true);
        getData()
    }

    return (
        <View style={{ flex: 1 }}>
            <ToolBarNoteBook
                {...props}
                leftIcon="keyboard-backspace"
                title={I18n.t('don_hang')}
                clickLeftIcon={() => { props.navigation.goBack() }}
                rightIcon="md-search"
                clickRightIcon={outputIsSelectProduct} />
            <ScrollView style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl
                        tintColor={Colors.colorchinh}
                        onRefresh={() => refreshList()}
                        refreshing={listRefreshing}
                    />
                }
            >
                {
                    dataList.length > 0 ?
                        dataList.map(item => (
                            <View style={{ height: 60, marginHorizontal: 10 ,flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomColor: "#ddd", borderBottomWidth: 0.5 }}>
                                <TouchableOpacity style={{ flex: 1, height: "100%", justifyContent: "center" }}>
                                    <Text style={{ }}>{item.Name}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ backgroundColor: Colors.colorLightBlue, justifyContent: "center", borderRadius: 25, width: 50, height: 50, alignItems: "center" }}>
                                    <Icon name="plus" size={30} color="white" />
                                </TouchableOpacity>
                            </View>))
                        : null
                }
            </ScrollView>
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
    );
};
