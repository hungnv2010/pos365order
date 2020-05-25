import React, { useEffect, useState } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import Images from '../../../theme/Images';
import realmStore from '../../../data/realm/RealmStore'
import  Colors from '../../../theme/Colors'


export default (props) => {

    const row_key = `${props.route.params.room.Id}_${props.route.params.room.Position}`
    const [test, setTest] = useState("")
    const [jsonContent, setJsonContent] = useState({})

    useEffect(() => {
        init()
        return () => {
            realmStore.removeAllListener()
        }
    }, [])

    init = async () => {
        let serverEvent = await realmStore.queryServerEvents().then(res => res.filtered(`RowKey == '${row_key}'`))
        console.log("init: ", JSON.stringify(serverEvent));
        
        setJsonContent(JSON.parse(serverEvent[0].JsonContent))
        serverEvent.addListener((collection, changes) => { 
            setJsonContent(JSON.parse(serverEvent[0].JsonContent))
        })
    }

    return (
        <View>
            {
                !jsonContent.OrderDetails ? null
                : jsonContent.OrderDetails.map((item, index) => {
                    return (
                        <View style={[styles.item, { backgroundColor: (index % 2 == 0) ? Colors.backgroundYellow : Colors.backgroundWhite}]}>
                            <Image style={{ width: 20, height: 20, margin: 10 }} source={Images.icon_return} />
                            <View style={{ flexDirection: "column", flex: 1 }}>
                                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 7 }}>{item.Name}</Text>
                                <View style={{ flexDirection: "row"}}>
                                    <Text>{item.Price}x</Text>
                                    <Text style={{ color: Colors.colorPhu}}> {item.Quantity} {}</Text>
                                </View>
                            </View>
                            <View style={{ alignItems: "center", flexDirection: "row" }}>
                     
                                <Text style={{ padding: 20 }}>{item.Quantity}</Text>
                               
                            </View>
                        </View>
                    )
                })
            }
        </View >

    )

}

const styles = StyleSheet.create({
    item: { flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", padding: 10 },
})