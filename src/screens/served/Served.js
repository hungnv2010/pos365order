import React, { useState, useEffect, useMemo } from 'react';
import { ActivityIndicator, Image, View, StyleSheet, Picker, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import dialogManager from '../../components/dialog/DialogManager';
import ToolBarSelectFood from './ToolBarServed';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import SelectFood from '../selectProduct/SelectFood';
import PageServed from './pageServed/PageServed';
import Topping from './Topping';

export default (props) => {

    const [numColumns, setNumColumns] = useState(1);
    const [listProducts, setListProducts] = useState([])
    const [value, setValue] = useState('');
    const [itemOrder, setItemOrder] = useState({})
    const [listTopping, setListTopping] = useState([])
    const [position, setPosition] = useState("")
    const [isSelectFood, setIsSelectFood] = useState(false)
    const [isTopping, setIsTopping] = useState(false)
    const [numColumnsForTopping, setNumColumnsForTopping] = useState(1);
    const meMoItemOrder = useMemo(() => itemOrder, [itemOrder])

    const { deviceType } = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common
    });


    useEffect(() => {
        const onOrientationChange = () => {
            dialogManager.showLoading()
            switch (deviceType) {
                case 'PHONE':
                    setNumColumns(1)
                    setNumColumnsForTopping(1)
                    break;
                case 'TABLET':
                    setNumColumns(4)
                    setNumColumnsForTopping(2)
                    break;
                default:
                    break;
            }
            dialogManager.hiddenLoading()
        }
        onOrientationChange()
    }, [deviceType])


    const outputListProducts = (newList) => {
        newList = newList.filter(item => item.Quantity > 0)
        setListProducts(newList)
        console.log(newList, 'newlist');

    }


    const outputTextSearch = (text) => {
        setValue(text)
    }

    const outputItemOrder = (item) => {
        setItemOrder(item)
    }

    const outputPosition = (position) => {
        setPosition(position)
    }

    const outputListTopping = (listTopping) => {
        setListTopping(listTopping)
    }

    const outputIsSelectFood = () => {
        setIsSelectFood(!isSelectFood)
    }

    const outputIsTopping = () => {
        setIsTopping(!isTopping)
    }

    const renderForTablet = () => {
        return (
            <>
                <ToolBarSelectFood navigation={props.navigation}
                    outputTextSearch={outputTextSearch} />
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <View style={{ flex: 6, }}>
                        <View style={!itemOrder.Id ? { flex: 1 } : { width: 0, height: 0 }}>
                            <SelectFood
                                valueSearch={value}
                                numColumns={numColumns}
                                listProducts={[...listProducts]}
                                outputListProducts={outputListProducts} />
                        </View>
                        <View style={itemOrder.Id ? { flex: 1 } : { width: 0, height: 0 }}>
                            <Topping
                                {...props}
                                numColumns={numColumnsForTopping}
                                position={position}
                                itemOrder={meMoItemOrder}
                                onClose={() => { setItemOrder({}) }}
                                outputListTopping={outputListTopping}
                            />
                        </View>
                    </View>
                    <View style={{ flex: 4, marginLeft: 2 }}>
                        <PageServed
                            {...props}
                            itemOrder={meMoItemOrder}
                            listProducts={[...listProducts]}
                            outputListProducts={outputListProducts}
                            outputItemOrder={outputItemOrder}
                            outputPosition={outputPosition}
                            listTopping={listTopping} />
                    </View>
                </View>
            </>
        )
    }

    const renderForPhone = () => {
        return (
            <>
                <View style={isSelectFood ? { flex: 1, } : { width: 0, height: 0 }}>
                    <ToolBarDefault
                        leftIcon="keyboard-backspace"
                        clickLeftIcon={outputIsSelectFood} />
                    <SelectFood
                        valueSearch={value}
                        numColumns={numColumns}
                        listProducts={[...listProducts]}
                        outputListProducts={outputListProducts} />
                </View>

                <View style={isTopping ? { flex: 1 } : { width: 0, height: 0 }}>
                    <ToolBarDefault
                        leftIcon="keyboard-backspace"
                        clickLeftIcon={outputIsTopping} />
                    <Topping
                        {...props}
                        position={position}
                        itemOrder={meMoItemOrder}
                        onClose={() => { setItemOrder({}) }}
                        outputListTopping={outputListTopping}
                    />
                </View>

                <View style={!(isTopping || isSelectFood) ? { flex: 1 } : { width: 0, height: 0 }}>
                    <ToolBarDefault
                        leftIcon="keyboard-backspace"
                        clickLeftIcon={() => { }} />
                    <PageServed
                        {...props}
                        itemOrder={meMoItemOrder}
                        listProducts={[...listProducts]}
                        outputListProducts={outputListProducts}
                        outputItemOrder={outputItemOrder}
                        outputPosition={outputPosition}
                        outputIsTopping={outputIsTopping}
                        outputIsSelectFood={outputIsSelectFood}
                        listTopping={listTopping}
                    />
                </View>
            </>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            {deviceType == 'TABLET' ?
                renderForTablet()
                :
                renderForPhone()
            }
        </View>
    );
}