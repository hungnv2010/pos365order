import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import ToolBarSelectProduct from '../../components/toolbar/ToolBarSelectProduct'
import ToolBarServed from '../../components/toolbar/ToolBarServed'
import SelectProduct from '../selectProduct/SelectProduct';
import PageServed from './pageServed/PageServed';
import Topping from './Topping';
import { Constant } from '../../common/Constant';

export default (props) => {

    const [listProducts, setListProducts] = useState([])
    const [value, setValue] = useState('');
    const [itemOrder, setItemOrder] = useState({})
    const [listTopping, setListTopping] = useState([])
    const [position, setPosition] = useState("")
    const [isSelectProduct, setIsSelectProduct] = useState(false)
    const [isTopping, setIsTopping] = useState(false)
    const meMoItemOrder = useMemo(() => itemOrder, [itemOrder])

    const { deviceType } = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common
    });


    const outputListProducts = (newList, type) => {
        newList = newList.filter(item => item.Quantity > 0)
        if (type === 0) newList = JSON.parse(JSON.stringify(newList))
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

    const outputIsSelectProduct = () => {
        setIsSelectProduct(!isSelectProduct)
    }

    const outputIsTopping = () => {
        setIsTopping(!isTopping)
    }

    const renderForTablet = () => {
        return (
            <>
                <ToolBarServed navigation={props.navigation}
                    outputTextSearch={outputTextSearch} />
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <View style={{ flex: 6, }}>
                        <View style={!itemOrder.Id ? { flex: 1 } : { width: 0, height: 0 }}>
                            <SelectProduct
                                valueSearch={value}
                                numColumns={3}
                                listProducts={[...listProducts]}
                                outputListProducts={outputListProducts} />
                        </View>
                        <View style={itemOrder.Id ? { flex: 1 } : { width: 0, height: 0 }}>
                            <Topping
                                {...props}
                                numColumns={2}
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
                <View style={isSelectProduct ? { flex: 1, } : { width: 0, height: 0 }}>
                    <ToolBarSelectProduct
                        leftIcon="keyboard-backspace"
                        clickLeftIcon={outputIsSelectProduct} />
                    <SelectProduct
                        valueSearch={value}
                        numColumns={1}
                        listProducts={[...listProducts]}
                        outputListProducts={outputListProducts} />
                </View>

                <View style={isTopping ? { flex: 1 } : { width: 0, height: 0 }}>
                    {/* <ToolBarDefault
                        leftIcon="keyboard-backspace"
                        clickLeftIcon={() => {
                            setItemOrder({})
                            outputIsTopping();
                        }} /> */}
                    <Topping
                        {...props}
                        position={position}
                        numColumns={1}
                        itemOrder={meMoItemOrder}
                        onClose={() => {
                            setItemOrder({})
                            outputIsTopping();
                        }}
                        outputListTopping={outputListTopping}
                    />
                </View>

                <View style={!(isTopping || isSelectProduct) ? { flex: 1 } : { width: 0, height: 0 }}>
                    <ToolBarDefault
                        leftIcon="keyboard-backspace"
                        clickLeftIcon={() => { props.navigation.goBack() }}
                        rightIcon="plus"
                        clickRightIcon={outputIsSelectProduct} />
                    <PageServed
                        {...props}
                        itemOrder={meMoItemOrder}
                        listProducts={[...listProducts]}
                        outputListProducts={outputListProducts}
                        outputItemOrder={outputItemOrder}
                        outputPosition={outputPosition}
                        outputIsTopping={outputIsTopping}
                        outputIsSelectProduct={outputIsSelectProduct}
                        listTopping={listTopping}
                    />
                </View>
            </>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            {deviceType == Constant.TABLET ?
                renderForTablet()
                :
                renderForPhone()
            }
        </View>
    );
}