import React, { useEffect, useState, useRef, createRef } from 'react';
import { View } from 'react-native';
import MainToolBar from './MainToolBar';
import dataManager from '../../data/DataManager'
import Order from './order/Order';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import dialogManager from '../../components/dialog/DialogManager';
import I18n from '../../common/language/i18n';

export default (props) => {


  useEffect(() => {
    if (props.route.params && props.route.params.FromPos && props.route.params.FromRoomId && props.route.params.Name) return
    let isSubscribed = true;
    if (isSubscribed) {
      const syncAllDatas = async () => {
        dialogManager.showLoading()
        await dataManager.syncRooms()
        dialogManager.hiddenLoading()
      }
      syncAllDatas()
    }
    return () => {
      isSubscribed = false
    }
  }, [])


  const clickRightIcon = async () => {
    dialogManager.showLoading()
    await dataManager.syncRooms()
    dialogManager.hiddenLoading()
  }

  return (
    <View style={{ flex: 1 }}>
      {props.route.params && props.route.params.FromPos && props.route.params.FromRoomId && props.route.params.Name ?
        <ToolBarDefault
          navigation={props.navigation}
          title={`${I18n.t('chuyen_ban')} from ${props.route.params.Name} to ...`}
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
      <Order {...props} ></Order>
    </View>
  );
};
