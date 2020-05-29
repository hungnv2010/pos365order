

import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
    StatusBar, Keyboard, Linking, Platform, SafeAreaView
} from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import { IconButton, Subheading } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Fonts from '../../theme/Fonts';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';

export default function ToolBarDefault(props) {

    let blockClick = false;

    return (

                    <View style={{ flex: 1, alignItems: "center" }}>
                        {/* {props.clickLeftIcon && props.leftIcon ? */}
                        <TouchableOpacity onPress={() => {
                            if (blockClick == false) {
                                blockClick = true;
                                props.navigation.pop()
                                setTimeout(() => {
                                    blockClick = false;
                                }, 1000);
                            }
                        }}>
                            <Icon name={props.leftIcon} size={props.size ? props.size : 30} color="white" />
                        </TouchableOpacity>
                        {/* :
                    null */}
                        {/* } */}
                    </View>
                    <View style={{ flex: 5, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                        <Subheading
                            numberOfLines={1}
                            style={{
                                color: 'white'
                            }}
                        >
                            {props.title}
                        </Subheading>
                    </View>

                <View style={{ flex: 1, alignItems: "center" }}>
                    {props.clickLeftIcon && props.leftIcon ?
                        <TouchableOpacity onPress={props.clickLeftIcon}>
                            <Icon name={props.leftIcon} size={props.size ? props.size : 30} color="white" />
                        </TouchableOpacity>
                        :
                        null
                    }
                </View>
                <View style={{ flex: 5, paddingLeft: 10, alignItems: 'center', flexDirection: 'row' }}>
                    <Subheading
                        numberOfLines={1}
                        style={{
                            color: 'white', fontWeight: "bold"
                        }}
                    >
                        {props.title}
                    </Subheading>
                </View>

                <View style={{ flex: 1, alignItems: "center" }}>
                    {props.clickRightIcon && props.rightIcon ?
                        <TouchableOpacity onPress={props.clickRightIcon}>
                            <Icon name={props.rightIcon} size={props.size ? props.size : 30} color="white" />
                        </TouchableOpacity>
                        :
                        null
                    }
                </View>
            </View>
<<<<<<< HEAD
        </View>
=======
        </LinearGradient >
>>>>>>> 290330b70fa7fd0c19a6ece633d3ca340c9fc079
    )

}

const styles = StyleSheet.create({

    toolbarContainer: {
        backgroundColor: Colors.colorchinh,
        height: 45,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.24,
        shadowRadius: 0.3,
    },
})

ToolBarDefault.propTypes = {
    title: PropTypes.string,
    rightIcon: PropTypes.string,
    leftIcon: PropTypes.string,
    clickRightIcon: PropTypes.func,
    clickLeftIcon: PropTypes.func
}

ToolBarDefault.defaultProps = {

}
