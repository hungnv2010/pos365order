import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import ToolBarSelectProduct from '../../../components/toolbar/ToolBarSelectProduct'
import ToolBarServed from '../../../components/toolbar/ToolBarServed'
import SelectProduct from './selectProduct/SelectProduct';
import PageServed from './pageServed/PageServed';
import Topping from './Topping';
import realmStore from '../../../data/realm/RealmStore';
import { Constant } from '../../../common/Constant';

const Served = (props) => {

    const [listProducts, setListProducts] = useState([])
    const [value, setValue] = useState('');
    const [itemOrder, setItemOrder] = useState({})
    const [listTopping, setListTopping] = useState([])
    const [position, setPosition] = useState("")
    const meMoItemOrder = useMemo(() => itemOrder, [itemOrder])
    const toolBarTabletServedRef = useRef();

    const orientaition = useSelector(state => {
        console.log("useSelector state ", state.Common.orientaition);
        return state.Common.orientaition
    });

    useEffect(() => {
        console.log("Served props ", props);
    }, [])

    const outputListProducts = (newList, type) => {
        console.log(newList, 'newList start');
        newList = newList.filter(item => item.Quantity > 0)
        switch (type) {
            case 0:
                break;
            case 2:
                newList.forEach((element, index) => {
                    listProducts.forEach(item => {
                        if (element.Id == item.Id && !item.SplitForSalesOrder) {
                            item.Quantity += element.Quantity
                            newList.splice(index, 1)
                        }
                    })
                });
                newList = [...newList, ...listProducts]
                break;

            default:
                break;
        }
        setListProducts(newList)
        console.log(newList, 'newList');
        checkHasItemOrder(newList)
        checkProductId(newList, props.route.params.room.ProductId)
    }

    const outputTextSearch = (text) => {
        setValue(text)
    }

    const outputItemOrder = (item) => {
        setItemOrder(item)
    }

    const outputPosition = (position) => {
        console.log('outputPosition', position);

        setPosition(position)
    }

    const outputListTopping = (listTopping) => {
        console.log('outputListTopping', listTopping);
        setListTopping(listTopping)
    }


    const outputClickProductService = async () => {
        let results = await realmStore.queryProducts()
        if (results) {
            results = results.filtered(`Id = "${props.route.params.room.ProductId}"`)
            if (results && results.length > 0) {
                results = JSON.parse(JSON.stringify(results))
                console.log("outputClickProductService results ", [results["0"]]);
                results["0"]["Quantity"] = 1;
                results["0"]["Sid"] = Date.now();
                outputListProducts([results["0"]], 2)
                toolBarTabletServedRef.current.clickCheckInRef()
            }
        }
    }

    const checkProductId = (listProduct, Id) => {
        console.log("checkProductId id ", Id);

        if (Id != 0) {
            let list = listProduct.filter(item => { return item.Id == Id })
            console.log("checkProductId listProduct ", list);
            setTimeout(() => {
                list.length > 0 ? toolBarTabletServedRef.current.clickCheckInRef(false) : toolBarTabletServedRef.current.clickCheckInRef(true)
            }, 500);
            // listProduct.length > 0 ? toolBarTabletServedRef.current.clickCheckInRef(false) : toolBarTabletServedRef.current.clickCheckInRef(true)
        }
    }

    const checkHasItemOrder = (newList) => {
        let exist = false
        newList.forEach(item => {
            if (item.Sid == itemOrder.Sid) {
                exist = true
            }
        })
        if (!exist) {
            setItemOrder({})
        }
    }

    const renderForTablet = () => {
        return (
            <>
                <ToolBarServed
                    {...props}
                    ref={toolBarTabletServedRef}
                    outputClickProductService={outputClickProductService}
                    navigation={props.navigation}
                    outputListProducts={outputListProducts}
                    outputTextSearch={outputTextSearch} />
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <View style={{ flex: 6, }}>
                        <View style={!itemOrder.Sid ? { flex: 1 } : { width: 0, height: 0 }}>
                            <SelectProduct
                                valueSearch={value}
                                numColumns={orientaition == Constant.LANDSCAPE ? 4 : 3}
                                listProducts={[...listProducts]}
                                outputListProducts={outputListProducts} />
                        </View>
                        <View style={itemOrder.Sid ? { flex: 1 } : { width: 0, height: 0 }}>
                            <Topping
                                {...props}
                                numColumns={orientaition == Constant.LANDSCAPE ? 2 : 1}
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

    return (
        <View style={{ flex: 1 }}>
            {
                renderForTablet()
            }
        </View>
    );
}

export default React.memo(Served)