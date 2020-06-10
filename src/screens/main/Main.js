import React, { useEffect, useState, useRef, createRef } from 'react';
import { View } from 'react-native';
import MainToolBar from './MainToolBar';
import dataManager from '../../data/DataManager'
import Order from './order/Order';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import dialogManager from '../../components/dialog/DialogManager';
import I18n from '../../common/language/i18n';
import { getFileDuLieuString, setFileLuuDuLieu } from "../../data/fileStore/FileStorage";
import { Constant } from '../../common/Constant';


export default (props) => {


  const [already, setAlready] = useState(false)


  useEffect(() => {
    if (props.route.params && props.route.params.Name) return
    let isSubcribe = true
    if (isSubcribe) {
      const syncAllDatas = async () => {
        dialogManager.showLoading()
        let already_insert = await getFileDuLieuString(Constant.ALREADY_INSERT_PRODUCT, true)
        console.log('already_insert', already_insert);
        if (already_insert) {
          await dataManager.syncRooms()
        } else {
          console.log('syncAllDatas');
          await dataManager.syncAllDatas()
          setFileLuuDuLieu(Constant.ALREADY_INSERT_PRODUCT, true)
        }
        setAlready(true)
        dialogManager.hiddenLoading()
      }
      syncAllDatas()
    }
    return () => {
      isSubcribe = false
      setAlready(false)
    }
  }, [])


  const clickRightIcon = async () => {
    dialogManager.showLoading()
    await dataManager.syncRooms()
    dialogManager.hiddenLoading()
  }

  return (
    <View style={{ flex: 1 }}>
      {props.route.params && props.route.params.Name ?
        <ToolBarDefault
          navigation={props.navigation}
          title={`${I18n.t('chuyen_ban')} ${I18n.t('tu')} ${props.route.params.Name} ${I18n.t('den')} ...`}
          leftIcon="keyboard-backspace"
          clickLeftIcon={() => { props.navigation.goBack() }} />
        :
        <MainToolBar
          navigation={props.navigation}
          title={I18n.t('nhan_vien_order')}
          rightIcon="refresh"
          clickRightIcon={clickRightIcon}
        />
      }
      <Order {...props} already={already}></Order>
    </View>
  );
};
