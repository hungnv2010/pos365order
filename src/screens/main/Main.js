import React, { useEffect, useState, useRef, createRef } from 'react';
import { StatusBar, Image, View, StyleSheet, TouchableOpacity, Text, ScrollView, SectionList } from 'react-native';
import MainToolBar from './MainToolBar';
import dataManager from '../../data/DataManager'
import realmStore from '../../data/realm/RealmStore'
import Order from './order/Order';
import { syncServerEvent } from '../../data/DataManager'
import { useSelector } from 'react-redux';
import Images from '../../theme/Images';
import I18n from '../../common/language/i18n';
import dialogManager from '../../components/dialog/DialogManager';

export default (props) => {

  const [forceUpdate, setForceUpdate] = useState(false)

  // useEffect(() => {
  //   syncServerEvent().then(res =>
  //     alert("Sync Done")
  //   )
  // }
  //   , [])


  const clickRightIcon = async () => {
    dialogManager.showLoading()
    await dataManager.syncAllDatas()
    setForceUpdate(!forceUpdate)
    dialogManager.hiddenLoading()
  }


  const clickLeftIcon = () => {
  }

  return (
    <View style={{ flex: 1 }}>
      <MainToolBar
        navigation={props.navigation}
        title="Main"
        rightIcon="refresh"
        clickRightIcon={clickRightIcon}
      />
      <Order {...props} forceUpdate={forceUpdate}></Order>
    </View>
  );
};
