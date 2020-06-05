

import React, { Component, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
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
import realmStore from '../../data/realm/RealmStore';


export default forwardRef((props, ref) => {

    let blockClick = false;

    const [showProductService, setShowProductService] = useState(false);

    // useEffect(() => {
    //         console.log("useEffect ", props);

    // }, props.checkService)

    useImperativeHandle(ref, () => ({
        clickCheckInRef(status) {
            console.log("clickCheckInRef status ", status);

            setShowProductService(status)
        }
    }));

    useEffect(() => {
        const getData = async () => {
            let results = await realmStore.queryRooms()
            console.log("results ", results, props);


            if (results) {
                results = results.filtered(`ProductId = "${props.route.params.room.ProductId}"`)
                console.log("results == ", results);
                if (results && results.length > 0) {
                    results = JSON.parse(JSON.stringify(results))
                    console.log("results == ", results);
                    setShowProductService(true)
                }
            }
        }
        getData()
    }, [])

    return (
        <View style={styles.toolbarContainer}>

            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                {props.clickLeftIcon ?
                    <TouchableOpacity onPress={props.clickLeftIcon}>
                        <Icon name={props.leftIcon} size={props.size ? props.size : 30} color="white" />
                    </TouchableOpacity>
                    :
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
            {showProductService && showProductService == true ? <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <TouchableOpacity onPress={props.clickProductService}>
                    <Icon name="clock-outline" size={props.size ? props.size : 30} color="white" />
                </TouchableOpacity>
            </View> : null}
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <TouchableOpacity onPress={props.clickQRCode}>
                    <Icon name="qrcode-scan" size={props.size ? props.size : 23} color="white" />
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <TouchableOpacity onPress={props.clickNoteBook}>
                    <Icon name="library-books" size={props.size ? props.size : 26} color="white" />
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                {props.clickRightIcon && props.rightIcon ?
                    <TouchableOpacity onPress={props.clickRightIcon}>
                        <Icon name={props.rightIcon} size={props.size ? props.size : 30} color="white" />
                    </TouchableOpacity>
                    :
                    null
                }
            </View>
        </View>


    )

}
)
const styles = StyleSheet.create({

    toolbarContainer: {
        flexDirection: "row",
        height: 40,
        backgroundColor: Colors.colorchinh,
    },
})

// ToolBarPhoneServed.propTypes = {
//     title: PropTypes.string,
//     rightIcon: PropTypes.string,
//     leftIcon: PropTypes.string,
//     clickRightIcon: PropTypes.func,
//     clickLeftIcon: PropTypes.func
// }

// ToolBarPhoneServed.defaultProps = {
//     leftIcon: "keyboard-backspace"
// }

