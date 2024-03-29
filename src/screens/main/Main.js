import React, { useEffect, useState, useRef, createRef } from 'react';
import { View } from 'react-native';
import MainToolBar from './MainToolBar';
import dataManager from '../../data/DataManager'
import Order from './order/Order';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import dialogManager from '../../components/dialog/DialogManager';
import I18n from '../../common/language/i18n';
import signalRManager from '../../common/SignalR';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import store from '../../store/configureStore';

export default (props) => {

  const [already, setAlready] = useState(false)

  useEffect(() => {
    const getVendorSession = async () => {
      let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
      console.log('getVendorSession data ====', JSON.parse(data));
      if (data) {
        data = JSON.parse(data);
        console.log('this.info data.BID ', data.BID);
        let state = store.getState();
        signalRManager.init({ ...data, SessionId: state.Common.info.SessionId }, true)
      }
    }
    getVendorSession()


    if (props.route.params && props.route.params.Name) return
    const syncAllDatas = async () => {
      dialogManager.showLoading()
      await dataManager.syncAllDatas()
        .then(() => {
          setAlready(true)
        })
        .catch((e) => {
          console.log('syncAllDatas err', e);
          setAlready(true)
        })
      dialogManager.hiddenLoading()
    }
    syncAllDatas()
    return () => {
      setAlready(false)
    }
  }, [])


  const clickRightIcon = async () => {
    dialogManager.showLoading()
    await dataManager.syncAllDatas()
      .then(() => {
        setAlready(true)
      })
      .catch((e) => {
        console.log('syncAllDatas err', e);
        setAlready(true)
      })
    dialogManager.hiddenLoading()
  }

  return (
    <View style={{ flex: 1 }}>
      {props.route.params && props.route.params.Name ?
        <ToolBarDefault
          navigation={props.navigation}
          title={`${I18n.t('chuyen')} ${I18n.t('tu')} ${props.route.params.Name} ${I18n.t('den')} ...`}
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
      <Order {...props} already={already} ></Order>
    </View>
  );
};
