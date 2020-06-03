import React, { useEffect, useState, useRef, createRef } from 'react';
import { View } from 'react-native';
import MainToolBar from './MainToolBar';
import dataManager from '../../data/DataManager'
import Order from './order/Order';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import dialogManager from '../../components/dialog/DialogManager';
import I18n from '../../common/language/i18n';

export default (props) => {

  const [forceUpdate, setForceUpdate] = useState(false)

  useEffect(() => {
<<<<<<< HEAD
    if (props.changeTable && props.fromTable) return
    let isSubscribed = true;
    if (isSubscribed) {
      const syncAllDatas = async () => {
        dialogManager.showLoading()
        await dataManager.syncAllDatas()
        setForceUpdate(!forceUpdate)
        dialogManager.hiddenLoading()
      }
      syncAllDatas()
    }
    return () => {
      isSubscribed = false
=======
    const syncAllDatas = async () => {
      if(props.changeTable && props.fromTable) return
      dialogManager.showLoading()
      await dataManager.syncAllDatas()
      setForceUpdate(!forceUpdate)
      dialogManager.hiddenLoading()
>>>>>>> ae00e5503073eaee4bce4d74990471cd13077def
    }
  }, [])


  const clickRightIcon = async () => {
    dialogManager.showLoading()
    await dataManager.syncRooms()
    dialogManager.hiddenLoading()
  }

  return (
    <View style={{ flex: 1 }}>
      {props.changeTable && props.fromTable ?
        <ToolBarDefault
          navigation={props.navigation}
          title={`${I18n.t('chuyen_ban')} from ${props.fromTable.Name} to ...`}
          leftIcon="keyboard-backspace"
          clickLeftIcon={() => { props.outputIsChangeTable() }} />
        :
        <MainToolBar
          navigation={props.navigation}
          title={I18n.t('nhan_vien_order')}
          rightIcon="refresh"
          clickRightIcon={clickRightIcon}
        />
      }
      <Order {...props} forceUpdate={forceUpdate}></Order>
    </View>
  );
};
