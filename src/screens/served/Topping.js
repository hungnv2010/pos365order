import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import ToolBarDefault from '../../components/toolbar/ToolBarDefault';
import realmStore from '../../data/realm/RealmStore';
import I18n from '../../common/language/i18n';


export default (props) => {

    const [topping, setTopping] = useState([])
    const [categories, setCategories] = useState([])
    const [listCateId, setlistCateId] = useState([-1])

    useEffect(() => {
        const getTopping = async () => {
            let newCategories = [{ Id: -1, Name: I18n.t('tat_ca') }]
            let newTopping = []
            let results = await realmStore.queryTopping()
            console.log(results, 'getTopping');
            results.forEach(item => {
                if (item.ExtraGroup !== '' && newCategories.filter(cate => cate.Name == item.ExtraGroup).length == 0) {
                    newCategories.push({ Id: item.Id, Name: item.ExtraGroup })
                }
                newTopping.push({ ...item, Quantity: 0 })
            })
            setCategories(newCategories)
            setTopping(newTopping)
        }
        getTopping()
    }, [])

    useEffect(() => {
        console.log(topping, 'topping');
        console.log(categories, 'categories');
    }, [topping, categories])


    const renderCateItem = (item, index) => {
        let isSelected = item.Id == listCateId[0] ? "orange" : "black";
        return (
            <TouchableOpacity onPress={() => { setlistCateId([item.Id]) }}
                key={index} style={[styles.cateItem, { borderColor: isSelected }]}>
                <Text style={{ color: isSelected }}>{item.Name}</Text>
            </TouchableOpacity>
        )
    }

    const renderTopping = (item, index) => {
        return (
            <View key={item.Id} style={styles.toppingItem}>
                <Text numberOfLines={2} style={{ flex: 3 }}>{item.Name}</Text>
                <View style={{ flexDirection: "row", flex: 2, justifyContent: "space-between", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => { handleButtonDecrease(item, index) }}>
                        <Text style={styles.button}>+</Text>
                    </TouchableOpacity>
                    <Text>{item.Quantity}</Text>
                    <TouchableOpacity onPress={() => { handleButtonIncrease(item, index) }}>
                        <Text style={styles.button}>-</Text>
                    </TouchableOpacity>
                </View>
            </View >
        )
    }

    const handleButtonDecrease = (item, index) => {
        console.log(item, index, 'item');
        topping[index].Quantity += 1;
        setTopping([...topping])
    }

    const handleButtonIncrease = (item, index) => {
        console.log(item, 'item');
        if (item.Quantity == 0) {
            return
        }
        topping[index].Quantity -= 1;
        setTopping([...topping])
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 45, backgroundColor: Colors.colorchinh, flexDirection: "row" }}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}></View>
                <View style={{ flex: 5, justifyContent: "center", alignItems: "center" }}>
                    <Text>Topping</Text>
                </View>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "flex-end" }}>
                    <TouchableOpacity style={{}} onPress={() => { props.setIsTopping() }}>
                        <Text style={{ fontStyle: "italic", paddingHorizontal: 5 }}>Đóng</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{}}>
                <View>
                    <FlatList
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        data={categories}
                        renderItem={({ item, index }) => renderCateItem(item, index)}
                        keyExtractor={(item, index) => '' + index}
                        extraData={listCateId} />
                </View>
                <View style={{}}>
                    <FlatList
                        data={topping}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => renderTopping(item, index)}
                        keyExtractor={(item, index) => '' + index}
                        extraData={topping.Quantity} />
                </View>
            </View>
        </View>
    )

}

const styles = StyleSheet.create({
    cateItem: { borderWidth: 0.5, padding: 15, margin: 5, borderRadius: 10 },
    toppingItem: { flex: 1, flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 0.5, paddingHorizontal: 10, paddingVertical: 20, alignItems: "center", },
    button: { borderWidth: 1, padding: 20, borderRadius: 10 },
})
