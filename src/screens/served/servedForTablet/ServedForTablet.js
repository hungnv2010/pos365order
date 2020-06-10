import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import ToolBarSelectProduct from '../../../components/toolbar/ToolBarSelectProduct'
import ToolBarServed from '../../../components/toolbar/ToolBarServed'
import SelectProduct from './selectProduct/SelectProduct';
import PageServed from './pageServed/PageServed';
import Topping from './Topping';
import { Constant } from '../../../common/Constant';
import dialogManager from '../../../components/dialog/DialogManager';
import I18n from '../../../common/language/i18n';
import Main from '../../main/Main';
import ToolBarPhoneServed from '../../../components/toolbar/ToolBarPhoneServed';
import realmStore from '../../../data/realm/RealmStore';

const Served = (props) => {

    const [listProducts, setListProducts] = useState([])
    const [value, setValue] = useState('');
    const [itemOrder, setItemOrder] = useState({})
    const [fromTable, setFromTable] = useState({})
    const [listTopping, setListTopping] = useState([])
    const [position, setPosition] = useState("")
    const [isSelectProduct, setIsSelectProduct] = useState(false)
    const [isTopping, setIsTopping] = useState(false)
    const [isChangeTable, setIsChangeTable] = useState(false)
    const meMoItemOrder = useMemo(() => itemOrder, [itemOrder])
    const SelectProductRef = useRef()


    useEffect(() => {
        console.log("Served props ", props);
    }, [])

    const outputListProducts = (newList, type) => {
        console.log(newList, 'newList start');
        newList = newList.filter(item => item.Quantity > 0)
        if (type === 0) newList = JSON.parse(JSON.stringify(newList))
        if (type === 2) {
            newList.forEach((element, index) => {
                listProducts.forEach(item => {
                    if (element.Id == item.Id) {
                        item.Quantity++
                        newList.splice(index, 1)
                    }
                })
            });
            newList = [...newList, ...listProducts]
        }
        setListProducts(newList)
        console.log(newList, 'newList');
        // checkProductId(newList, props.route.params.room.ProductId)
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


    const renderForTablet = () => {
        return (
            <>
                <ToolBarServed navigation={props.navigation}
                    outputListProducts={outputListProducts}
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






    // const onCallBackNoteBook = (data = "") => {
    //     console.log("onCallBackNoteBook data ", data);
    //     outputListProducts(data, 2)
    // }

    // const outputClickNoteBook = () => {
    //     props.navigation.navigate('NoteBook', { _onSelect: onCallBackNoteBook })
    // }

    // const outputClickQRCode = () => {
    //     props.navigation.navigate('QRCode', { _onSelect: onCallBackNoteBook })
    // }

    // const outputClickProductService = async () => {
    //     // alert("ProductService")
    //     let results = await realmStore.queryProducts()
    //     if (results) {
    //         results = results.filtered(`Id = "${props.route.params.room.ProductId}"`)
    //         if (results && results.length > 0) {
    //             results = JSON.parse(JSON.stringify(results))
    //             console.log("outputClickProductService results ", [results["0"]]);
    //             results["0"]["Quantity"] = 1;
    //             outputListProducts([results["0"]])
    //             toolBarPhoneServedRef.current.clickCheckInRef()
    //         }
    //     }
    // }

    // const checkProductId = (listProduct, Id) => {
    //     console.log("checkProductId id ", Id);

    //     if (Id != 0) {
    //         let list = listProduct.filter(item => { return item.Id == Id })
    //         console.log("checkProductId listProduct ", list);
    //         setTimeout(() => {
    //             list.length > 0 ? toolBarPhoneServedRef.current.clickCheckInRef(false) : toolBarPhoneServedRef.current.clickCheckInRef(true)
    //         }, 500);
    //         // listProduct.length > 0 ? toolBarPhoneServedRef.current.clickCheckInRef(false) : toolBarPhoneServedRef.current.clickCheckInRef(true)
    //     }
    // }

    // const toolBarPhoneServedRef = useRef();


    return (
        <View style={{ flex: 1 }}>
            {
                renderForTablet()
            }
        </View>
    );
}

export default React.memo(Served)