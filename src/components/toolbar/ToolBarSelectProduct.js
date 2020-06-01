

import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
    StatusBar, Keyboard, Linking, Platform, SafeAreaView
} from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import { IconButton, Subheading } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';

export default function ToolBarDefault(props) {

    return (
        <View style={styles.toolbarContainer}>
            <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: "center"
            }}
            >

                <View style={{ flex: 1, alignItems: "center" }}>
                    {props.clickLeftIcon && props.leftIcon ?
                        <TouchableOpacity onPress={props.clickLeftIcon}>
                            <Icon name={props.leftIcon} size={props.size ? props.size : 30} color="white" />
                        </TouchableOpacity>
                        :
                        null
                    }
                </View>
                <View style={{ flex: 5, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
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
                    <TouchableOpacity onPress={props.onClickSearch}>
                        <Ionicons name="md-search" size={30} color="white" style={{}} />
                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1, alignItems: "center" }}>
                    <TouchableOpacity onPress={props.onClickDone}>
                        <Icon name="check" size={30} color="white" style={{}} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )

}

const styles = StyleSheet.create({

    toolbarContainer: {
        height: 45,
        backgroundColor: Colors.colorchinh
    },
})

ToolBarDefault.propTypes = {
    title: PropTypes.string,
    leftIcon: PropTypes.string,
    onClickSearch: PropTypes.func,
    clickLeftIcon: PropTypes.func,
    onClickDone: PropTypes.func
}

ToolBarDefault.defaultProps = {

}
