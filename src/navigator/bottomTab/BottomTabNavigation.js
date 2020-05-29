import React from 'react';
import { StatusBar, Image, View, StyleSheet, TouchableOpacity, Text, ScrollView, SectionList } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Images, Colors } from '../../theme';
const Tab = createMaterialBottomTabNavigator();
import Main from '../../screens/main/Main';
import WrapSelectFood from '../../screens/served/Served';
import { IconButton } from 'react-native-paper';
import colors from '../../theme/Colors';
import Icon from 'react-native-vector-icons/MaterialIcons';

import More from '../../screens/more/More'

export default () => {
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
                        <View style={{ top: -5, right: -10, position: "absolute" }}>
                            <View style={{ backgroundColor: Colors.colorchinh, width: 18, height: 18, borderRadius: 9, borderColor: "#ffffff", borderWidth: 1, justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ color: "#fff" }}>2</Text>
                            </View>
                        </View>
                    </View>
                ),
            }} />
            {/* <Tab.Screen name="Settings" component={()=>{return(<View><Text>Setting</Text></View>)}} options={{
                tabBarLabel: 'Settings',
                tabBarIcon: ({ color }) => (
                    <Image style={{ width: 20, height: 20, padding: 5 }} source={Images.icon_transfer_money} />
                ),
            }} /> */}
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