import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Colors, Metrics, Images } from '../../theme'
import realmStore from '../../data/realm/RealmStore';
import I18n from '../../common/language/i18n';
import dataManager from '../../data/DataManager';
import { currencyToString } from '../../common/Utils'


export default (props) => {

    const [topping, setTopping] = useState([])
    const [categories, setCategories] = useState([])
    const [listCateId, setlistCateId] = useState([I18n.t('tat_ca')])
    const [itemOrder, setItemOrder] = useState(() => props.itemOrder)
    const [listTopping, setListTopping] = useState([])
    const toppingRef = useRef([])


    useEffect(() => {
        const getTopping = async () => {
            let newCategories = [{ Id: -1, Name: I18n.t('tat_ca') }]
            let newTopping = []
            let results = await realmStore.queryTopping().then(res => res.slice(0.5))
            console.log(results, 'getTopping');
            results.forEach(item => {
                if (item.ExtraGroup !== '' && newCategories.filter(cate => cate.Name == item.ExtraGroup).length == 0) {
                    newCategories.push({ Id: item.Id, Name: item.ExtraGroup })
                }
                newTopping.push({ ...JSON.parse(JSON.stringify(item)), Quantity: 0 })
            })
            toppingRef.current = [...newTopping]
            setCategories(newCategories)
            setTopping(newTopping)
        }
        const init = () => {
            dataManager.listTopping.forEach(item => {
                if (item.IdRoom == props.route.params.room.Id) {
                    setListTopping([...item.Data])
                }
            })
        }
        getTopping()
        init()
    }, [])

    useEffect(() => {
        if (listCateId[0] == I18n.t('tat_ca')) {
            setTopping(toppingRef.current)
        } else {
            let topping = toppingRef.current.filter(tp => tp.ExtraGroup == listCateId[0])
            console.log(topping, 'topping');
            setTopping([...topping])
        }
    }, [listCateId])

    useEffect(() => {
        setItemOrder(props.itemOrder)
    }, [props.itemOrder])


    useEffect(() => {
        let exist = false
        listTopping.forEach(lt => {
            if (lt.Id == itemOrder.Sid && lt.Key == props.position) {
                exist = true
                mergeTopping(lt.List)
            }
        })
        if (!exist) {
            resetTopping()
        }
    }, [itemOrder, props.position])

    const mergeTopping = (list) => {
        resetTopping()
        console.log('mergeTopping', list);
        topping.forEach(top => {
            list.forEach(ls => {
                if (top.Id == ls.Id) {
                    top.Quantity = ls.Quantity
                }
            })
        })
        setTopping([...topping])
    }

    const resetTopping = () => {
        console.log('resetTopping');
        topping.forEach(item => {
            item.Quantity = 0
        })
        setTopping([...topping])
    }

    const onclose = () => {
        props.onClose()
    }

    const handleButtonDecrease = (item, index) => {
        topping[index].Quantity += 1;
        setTopping([...topping])
        saveListTopping()
    }

    const handleButtonIncrease = (item, index) => {
        if (item.Quantity == 0) {
            return
        }
        topping[index].Quantity -= 1;
        setTopping([...topping])
        saveListTopping()
    }

    const saveListTopping = () => {
        console.log('saveListTopping');
        let exist = false
        let ls = topping.filter(item => item.Quantity > 0)
        ls = JSON.parse(JSON.stringify(ls))
        listTopping.forEach(lt => {
            if (lt.Id == itemOrder.Sid && lt.Key == props.position) {
                exist = true
                lt.List = [...ls]
                lt.Key = props.position
            }
        })
        if (!exist) {
            listTopping.push({ Id: itemOrder.Sid, List: [...ls], Key: props.position })
        }
        saveData()
        props.outputListTopping(ls)

    }


    const saveData = () => {
        let exist = false
        dataManager.listTopping.forEach(data => {
            if (data.IdRoom == props.route.params.room.Id) {
                exist = true
                data.Data = listTopping
            }
        })
        if (!exist) {
            dataManager.listTopping.push({ IdRoom: props.route.params.room.Id, Data: listTopping })
        }
        console.log(dataManager.listTopping, 'dataManager.listTopping');

    }

    const renderCateItem = (item, index) => {
        let isSelected = item.Name == listCateId[0] ? "orange" : "black";
        return (
            <TouchableOpacity onPress={() => { setlistCateId([item.Name]) }}
                key={index} style={[styles.cateItem, { borderColor: isSelected }]}>
                <Text style={{ color: isSelected, fontWeight: "bold" }}>{item.Name}</Text>
            </TouchableOpacity>
        )
    }

    const renderTopping = (item, index) => {
        return (
            <View key={item.Id} style={[styles.toppingItem, { backgroundColor: item.Quantity > 0 ? "#6EA2D6" : "white" }]}>
                <View style={{ flex: 3, paddingRight: 10 }}>
                    <Text numberOfLines={2} style={{}}>{item.Name}</Text>
                    <Text numberOfLines={2} style={{ fontStyle: "italic", fontSize: 13, color: "gray" }}>{currencyToString(item.Price)}</Text>
                </View>
                <View style={{ flexDirection: "row", flex: 2, justifyContent: "space-between", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => { handleButtonIncrease(item, index) }}>
                        <Text style={styles.button}>-</Text>
                    </TouchableOpacity>
                    <Text>{item.Quantity}</Text>
                    <TouchableOpacity onPress={() => { handleButtonDecrease(item, index) }}>
                        <Text style={styles.button}>+</Text>
                    </TouchableOpacity>
                </View>
            </View >
        )
    }


    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 45, backgroundColor: Colors.colorchinh, flexDirection: "row" }}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: "white", textAlign: "center" }}>{itemOrder ? itemOrder.Name : ''}</Text>
                </View>
                <View style={{ flex: 5, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: "white" }}>Topping</Text>
                </View>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "flex-end" }}>
                    <TouchableOpacity style={{}} onPress={() => { onclose() }}>
                        <Text style={{ fontStyle: "italic", paddingHorizontal: 5, color: "white" }}>{I18n.t('dong')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{}}>
                <View style={{ backgroundColor: "white", marginBottom: 3 }}>
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
                        extraData={topping.Quantity}
                        key={props.numColumns}
                        numColumns={props.numColumns} />
                </View>
            </View>
        </View>
    )

}

const styles = StyleSheet.create({
    cateItem: { borderWidth: 0.5, padding: 15, margin: 5, borderRadius: 10 },
    toppingItem: { flex: 1, flexDirection: "row", justifyContent: "space-between", padding: 10, alignItems: "center", borderRadius: 10, margin: 3 },
    button: { borderWidth: .5, padding: 15, borderRadius: 10 },
})



