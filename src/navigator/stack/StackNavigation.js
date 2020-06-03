import React, { useState, useEffect, createRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Animated from 'react-native-reanimated';
import Login from '../../screens/login/LoginScreen';
import Served from '../../screens/served/Served';
import BottomTabNavigation from '../bottomTab/BottomTabNavigation';
import PrintHtml from '../../screens/more/printHtml/PrintHtml'
import Preview from '../../screens/more/printHtml/Preview'
import Topping from '../../screens/served/Topping';

import NoteBook from '../../screens/served/NoteBook';
import DetailNoteBook from '../../screens/served/DetailNoteBook';
import QRCode from '../../screens/served/QRCode';

const MainStack = createStackNavigator();
export const navigationRef = createRef();
export default (props) => {

    return (
        <Animated.View style={{ flex: 1 }}>
            <MainStack.Navigator
                headerMode="none"
            >
                <MainStack.Screen name="Login">{props => <Login {...props} />}</MainStack.Screen>
                <MainStack.Screen name="Home">{props => <BottomTabNavigation {...props} screenOptions={{ headerLeft: null }} />}</MainStack.Screen>
                <MainStack.Screen name="Served">{props => <Served {...props} />}</MainStack.Screen>
                {/* <MainStack.Screen name="SelectFood">{props => <SelectFood {...props} />}</MainStack.Screen> */}
                <MainStack.Screen name="PrintHtml">{props => <PrintHtml {...props} />}</MainStack.Screen>
                <MainStack.Screen name="Preview">{props => <Preview {...props} />}</MainStack.Screen>
                <MainStack.Screen name="Topping">{props => <Topping {...props} />}</MainStack.Screen>
                <MainStack.Screen name="NoteBook">{props => <NoteBook {...props} />}</MainStack.Screen>
                <MainStack.Screen name="DetailNoteBook">{props => <DetailNoteBook {...props} />}</MainStack.Screen>
                <MainStack.Screen name="QRCode">{props => <QRCode {...props} />}</MainStack.Screen>
            </MainStack.Navigator>
        </Animated.View>
    );
};