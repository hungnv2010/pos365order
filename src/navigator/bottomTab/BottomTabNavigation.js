import React from 'react';
import { StatusBar, Image, View, StyleSheet, TouchableOpacity, Text, ScrollView, SectionList } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Images, Colors } from '../../theme';
const Tab = createMaterialBottomTabNavigator();
import Main from '../../screens/main/Main';
import Icon from 'react-native-vector-icons/MaterialIcons';

import More from '../../screens/more/More'
import OrderNow from '../../screens/ordernow/OrderNow';
import { useSelector } from 'react-redux';
import dataManager from '../../data/DataManager';

export default () => {

    const numberOrder = useSelector(state => {
        console.log("useSelector numberOrder state ", state);
        return state.Common.numberOrder > 0 ? state.Common.numberOrder : 0;
    });

    return (
        <Tab.Navigator
            initialRouteName="Home"
            activeColor={Colors.colorchinh}
            inactiveColor="#696969"
            // shifting={true}
            barStyle={{ backgroundColor: '#ffffff', height: 50 }}
        >
            <Tab.Screen name="Home" component={Main} options={{
                tabBarLabel: 'Home',
                tabBarIcon: ({ color }) => (
                    <View>
                        <Icon name="home" size={22} color={color} />
                        {/* {color == colors.colorchinh ?
                            // <Image style={{ width: 20, height: 20, padding: 5 }} color={color} source={Images.icon_home_active} />
                            :
                            // <Image style={{ width: 20, height: 20, padding: 5 }} color={color} source={Images.icon_home} />
                        } */}
                        {/* <View style={{ top: -5, right: -10, position: "absolute" }}>
                            <View style={{ backgroundColor: Colors.colorchinh, width: 18, height: 18, borderRadius: 9, borderColor: "#ffffff", borderWidth: 1, justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ color: "#fff" }}>2</Text>
                            </View>
                        </View> */}
                    </View>
                ),
            }} />
            <Tab.Screen name="OrderNow" component={OrderNow} options={{
                tabBarLabel: 'Order',
                tabBarIcon: ({ color }) => (
                    <View>
                        <Icon name="restaurant-menu" size={22} color={color} />
                        {numberOrder > 0 ?
                            <View style={{ top: -5, right: -10, position: "absolute" }}>
                                <View style={{ backgroundColor: Colors.colorchinh, width: 18, height: 18, borderRadius: 9, borderColor: "#ffffff", borderWidth: 1, justifyContent: "center", alignItems: "center" }}>
                                    <Text style={{ color: "#fff" }}>{numberOrder}</Text>
                                </View>
                            </View>
                            : null}
                    </View>
                ),
            }} />
            <Tab.Screen name="More" component={More} options={{
                tabBarLabel: 'More',
                tabBarIcon: ({ color }) => (
                    <Icon name="more-horiz" size={26} color={color} />
                    // color == colors.colorchinh ?
                    //     <Image style={{ width: 20, height: 20, padding: 5 }} color={color} source={Images.icon_more_active} />
                    //     :
                    //     <Image style={{ width: 20, height: 20, padding: 5 }} color={color} source={Images.icon_more} />
                ),
            }} />

        </Tab.Navigator>
    );
}