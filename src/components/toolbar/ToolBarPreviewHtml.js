

import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
    StatusBar, Keyboard, Linking, Platform, SafeAreaView
} from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import { IconButton, Subheading } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../../theme/Fonts';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';

export default function ToolBarPreviewHtml(props) {

    onClickBack = () => {
        props.navigation.pop();
    };

    return (
        <LinearGradient
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            colors={['#FFAB40', '#FF5722']}
            style={{ height: 44 }}
        >
            <View style={styles.toolbarContainer}>
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: "center"
                }}
                >

                    <View style={{ flex: 1, alignItems: "center" }}>
                        <TouchableOpacity onPress={props.clickRightIcon}>
                            {props.rightIcon && props.clickRightIcon ?
                                <Icon name={props.rightIcon} size={props.size ? props.size : 30} color="white" />
                                :
                                <Icon delayPressIn={0} name="keyboard-backspace" onPress={onClickBack} size={24} />
                            }
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
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
                        <TouchableOpacity onPress={props.clickPrint} >
                            <Text style={{ color: 'white' }}>IN</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, alignItems: "center" }}>
                        <TouchableOpacity onPress={props.clickCheck} >
                            <Icon delayPressIn={0} name="check" size={24} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </LinearGradient>
    )

}

const styles = StyleSheet.create({

    toolbarContainer: {
        height: 44,
        flex: 1,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.24,
        shadowRadius: 0.3,
    },
})

ToolBarPreviewHtml.propTypes = {
    title: PropTypes.string,
    rightIcon: PropTypes.string,
    leftIcon: PropTypes.string,
    clickRightIcon: PropTypes.func,
    clickLeftIcon: PropTypes.func
}

ToolBarPreviewHtml.defaultProps = {

}
