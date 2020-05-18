import React, { useEffect, useState } from 'react';
import { Image, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Images from '../../../theme/Images';
import realmStore from '../../../data/realm/RealmStore';
import Colors from '../../../theme/Colors';
import { Subject } from 'rxjs';
import { currencyToString } from '../../../common/Utils';
import { I18n } from '../../../common/language/i18n'

const subject = new Subject()
let serverEvents = undefined
let currentPosition = "A"

export default (props) => {
    const [jsonContent, setJsonContent] = useState({})

    useEffect(() => {
        init()
        return () => {
            console.log("unmount");
            serverEvents.removeAllListeners()
        }
    }, [])

    useEffect(() => {
        changePosion()
    }, [props.position])

    changePosion = () => {
        console.log("changePosion", props.position);
        currentPosition = props.position
        subject.next(serverEvents)
    }

    init = async () => {
        serverEvents = await realmStore.queryServerEvents().then(res => res.filtered(`RoomId == '${props.route.params.room.Id}'`))
        subject
            .filter(serverEvents => serverEvents)
            .map(serverEvents => serverEvents.filtered(`Position == '${currentPosition}'`))
            .map(serverEvents => serverEvents.length ? serverEvents[0] : {})
            .subscribe(serverEvent => {
                console.log("subscribe", serverEvent);
                let jsonContent = serverEvent.JsonContent || "{}"
                setJsonContent(JSON.parse(jsonContent))
            })

        serverEvents.addListener((collection, changes) => {
            console.log("change data:");
            subject.next(serverEvents)
        })
    }

    return (
        <View style={{flex:1, flexDirection:'column', justifyContent:'space-around'}}>
            <ScrollView style={{ flex: 1 }}>
                {!jsonContent.OrderDetails ? null
                    : jsonContent.OrderDetails.map((item, index) => {
                        return (
                            <View style={[styles.item, { backgroundColor: (index % 2 == 0) ? Colors.backgroundWhite : Colors.backgroundYellow }]}>
                                <Image style={{ width: 25, height: 25, margin: 10 }} source={Images.icon_return} />
                                <View style={{ flexDirection: "column", flex: 1 }}>
                                    <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 7 }}>{item.Name}</Text>
                                    <View style={{ flexDirection: "row" }}>
                                        <Text>{item.Price} x</Text>
                                        <Text style={{ color: Colors.colorPhu }}> {item.Quantity} {item.IsLargeUnit ? item.LargeUnit : item.Unit}</Text>
                                    </View>
                                </View>
                                <View style={{ alignItems: "center", flexDirection: "row" }}>
                                    <Text style={{ padding: 20, color: Colors.colorPhu }}>{currencyToString(item.Quantity * item.Price)}</Text>
                                </View>
                            </View>
                        )
                    })
                }
            </ScrollView >
            { Footer(jsonContent) }
        </View>
    )
}

const Footer = (jsonContent) => {
    const [isShow, setIsShow] = useState(false)
    return (
        <TouchableOpacity
            onPress={() => {
                setIsShow(!isShow)
            }}>
            <View style={{justifyContent:"space-between", alignItems :'center', backgroundColor: Colors.backgroundWhite, flexDirection: 'row' }}>
                <Text style={{ paddingVertical: 10, textTransform: "uppercase", fontSize: 18, fontWeight: "bold" }}>ton</Text>
                <View style={{flexDirection: 'row'}}>             
                    <Text style={{ paddingVertical: 10, textTransform: "uppercase", fontSize: 18, fontWeight: "bold", color: Colors.colorchinh }}>{jsonContent.Total}</Text>              
                    <Image source={Images.arrow_down} 
                        style={{ width: 15, height: 15, right: 10, 
                            transform: [{ rotate: isShow ? "0deg" : "180deg" }]}}>
                    </Image>
                </View> 
            </View>
            {isShow ?
            <View style={{ height:100, width: '100%'}}>
            </View>
            : null}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    item: { flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", padding: 10 },
})