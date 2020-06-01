

import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import { IconButton, Subheading } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PropTypes from 'prop-types';

export default function MainToolBar(props) {

    return (
        // <LinearGradient
        //     start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        //     colors={['#FFAB40', '#FF5722']}
        //     style={{ height: 44 }}
        // >
        <View style={styles.toolbarContainer}>
            <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: "center"
            }}
            >

                <View style={{ flex: 2, alignItems: "center", marginLeft: 15 }}>
                    {/* {props.clickLeftIcon && props.leftIcon ?
                            <TouchableOpacity onPress={props.clickLeftIcon}>
                                <Icon name={props.leftIcon} size={props.size ? props.size : 30} color="white" />
                            </TouchableOpacity>
                            :
                            null
                        } */}
                    <Image source={Images.logo_365_boss_white}
                        style={{ width: 172, height: 40, resizeMode: 'contain' }} />
                </View>
                <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                    <Subheading
                        numberOfLines={1}
                        style={{
                            color: 'white',
                            fontWeight: "bold",
                            fontSize: 18
                        }}
                    >
                        {props.title}
                    </Subheading>
                </View>

                <View style={{ flex: 1, alignItems: "center" }}>
                    {props.clickRightIcon && props.rightIcon ?
                        <TouchableOpacity onPress={props.clickRightIcon}>
                            <Icon name={props.rightIcon} size={props.size ? props.size : 28} color="white" />
                        </TouchableOpacity>
                        :
                        null
                    }
                </View>
            </View>
        </View>
        // </LinearGradient>
    )

}

const styles = StyleSheet.create({

    toolbarContainer: {
        height: 44,
        // flex: 1,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.24,
        shadowRadius: 0.3,
        backgroundColor: Colors.colorchinh,
        height: 44
    },
})

MainToolBar.propTypes = {
    title: PropTypes.string,
    rightIcon: PropTypes.string,
    leftIcon: PropTypes.string,
    clickRightIcon: PropTypes.func,
    clickLeftIcon: PropTypes.func
}

MainToolBar.defaultProps = {

}
