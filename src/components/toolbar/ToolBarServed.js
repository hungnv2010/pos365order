import React, { useEffect, useState } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
    TextInput, Keyboard, Linking, Platform, SafeAreaView
} from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import { IconButton, Subheading } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';

export default function ToolBarServed(props) {

    const [value, onChangeText] = useState('');
    const [isSearch, setIsSearch] = useState(false);

    useEffect(() => {
        props.outputTextSearch(value)
    }, [value])

    const onCallBack = (data, type) => {
        props.outputListProducts(data, type)
    }

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
                    <TouchableOpacity onPress={() => { props.navigation.goBack() }}>
                        <Icon name="keyboard-backspace" size={35} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 2, justifyContent: 'center', alignItems: 'flex-start', }}>
                    <Subheading
                        numberOfLines={1}
                        style={{ color: 'white' }}
                    >{props.title}
                    </Subheading>
                </View>
                <View style={{ flex: 3, }}>
                    {isSearch ?
                        <TextInput
                            placeholder="what are you searching?"
                            style={{ backgroundColor: "white" }}
                            onChangeText={(text) => onChangeText(text)}
                            value={value}
                        /> :
                        null}
                </View>

                <View style={{ flex: 1.5, alignItems: "center", flexDirection: "row", justifyContent: "space-around", }}>
                    <TouchableOpacity onPress={() => { setIsSearch(!isSearch) }} >
                        <View style={{}}>
                            <Ionicons name="md-search" size={30} color="white" style={{}} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { props.navigation.navigate('QRCode', { _onSelect: onCallBack }) }} >
                        <View style={{}}>
                            <Icon name="qrcode-scan" size={25} color="white" style={{}} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { props.navigation.navigate('NoteBook', { _onSelect: onCallBack }) }} >
                        <View style={{}}>
                            <Icon name="library-books" size={28} color="white" style={{}} />
                        </View>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    )

}

const styles = StyleSheet.create({

    toolbarContainer: {
        flexDirection: "row",
        height: 40,
        backgroundColor: Colors.colorchinh,
    },
})

ToolBarServed.propTypes = {
    title: PropTypes.string,
    rightIcon: PropTypes.string,
    leftIcon: PropTypes.string,
    clickRightIcon: PropTypes.func,
    clickLeftIcon: PropTypes.func
}

ToolBarServed.defaultProps = {

}
