import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import ToolBarDefault from '../../components/toolbar/ToolBarDefault'
import ToolBarSelectProduct from '../../components/toolbar/ToolBarSelectProduct'
import ToolBarServed from '../../components/toolbar/ToolBarServed'
import SelectProduct from '../selectProduct/SelectProduct';
import PageServed from './pageServed/PageServed';
import Topping from './Topping';
import { Constant } from '../../common/Constant';
import dialogManager from '../../components/dialog/DialogManager';
import I18n from '../../common/language/i18n';
import Main from '../../screens/main/Main';
import ToolBarPhoneServed from '../../components/toolbar/ToolBarPhoneServed';

const Served = (props) => {

    const [listProducts, setListProducts] = useState([])
    const [value, setValue] = useState('');
    const [itemOrder, setItemOrder] = useState({})
    const [fromTable, setFromTable] = useState({})
    const [listTopping, setListTopping] = useState([])
    const [position, setPosition] = useState("A")
    const [isSelectProduct, setIsSelectProduct] = useState(false)
    const [isTopping, setIsTopping] = useState(false)
    const [isChangeTable, setIsChangeTable] = useState(false)
    const meMoItemOrder = useMemo(() => itemOrder, [itemOrder])
    const SelectProductRef = useRef()

    const { deviceType } = useSelector(state => {
        console.log("useSelector state ", state);
        return state.Common
    });

    useEffect(() => {
        console.log("Served props ", props);

    }, [])


    const outputListProducts = (newList, type) => {
        newList = newList.filter(item => item.Quantity > 0)
        if (type === 0) newList = JSON.parse(JSON.stringify(newList))
        setListProducts(newList)
        console.log(newList, 'newList');
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

    const outputIsSelectProduct = () => {
        setIsSelectProduct(!isSelectProduct)
    }

    const outputIsTopping = () => {
        setIsTopping(!isTopping)
    }

    const outputIsChangeTable = (fromTable) => {
        if (fromTable) setFromTable(fromTable)
        setIsChangeTable(!isChangeTable)
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

    const onClickDone = () => {
        SelectProductRef.current.onClickDoneInRef()
        outputIsSelectProduct()
    }

    const clickLeftIcon = () => {
        console.log(SelectProductRef.current.listProductsRef());
        if (SelectProductRef.current.listProductsRef().length > 0) {
            dialogManager.showPopupTwoButton('Bạn có muốn lưu thay đổi không?', 'Thông báo', (value) => {
                if (value == 1) {
                    onClickDone()
                } else {
                    outputIsSelectProduct()
                }
            })
        } else {
            outputIsSelectProduct()
        }
    }

    const onClickSearch = () => {

    }

    const onCallBackNoteBook = (data = "") => {
        console.log("onCallBackNoteBook data ", data);
        outputListProducts(data, 0)
    }

    const outputClickNoteBook = () => {
        props.navigation.navigate('NoteBook', { _onSelect: onCallBackNoteBook })
    }

    const outputClickQRCode = () => {
        props.navigation.navigate('QRCode')
    }

    const renderForPhone = () => {
        return (
            <>
                {isSelectProduct ?
                    <View style={{ flex: 1 }}>
                        <ToolBarSelectProduct
                            leftIcon="keyboard-backspace"
                            clickLeftIcon={clickLeftIcon}
                            onClickDone={onClickDone}
                            title="Select Product"
                            outputTextSearch={outputTextSearch} />
                        <SelectProduct
                            ref={SelectProductRef}
                            valueSearch={value}
                            numColumns={1}
                            listProducts={[...listProducts]}
                            outputListProducts={outputListProducts} />
                    </View> :
                    null
                }
                {isTopping ?
                    <View style={{ flex: 1 }}>
                        <Topping
                            {...props}
                            position={position}
                            numColumns={1}
                            itemOrder={meMoItemOrder}
                            onClose={() => {
                                outputIsTopping();
                            }}
                            outputListTopping={outputListTopping}
                        />
                    </View> :
                    null
                }
                {isChangeTable ?
                    <View style={{ flex: 1 }}>
                        <Main
                            {...props}
                            fromTable={fromTable}
                            outputIsChangeTable={outputIsChangeTable}
                            changeTable={true} />
                    </View>
                    :
                    null
                }
                {!(isTopping || isSelectProduct || isChangeTable) ?
                    <View style={{ flex: 1 }}>
                        <ToolBarPhoneServed
                            {...props}
                            leftIcon="keyboard-backspace"
                            title={I18n.t('don_hang')}
                            clickLeftIcon={() => { props.navigation.goBack() }}
                            clickNoteBook={outputClickNoteBook}
                            clickQRCode={outputClickQRCode}
                            rightIcon="plus"
                            clickRightIcon={outputIsSelectProduct} />
                        <PageServed
                            {...props}
                            position={position}
                            itemOrder={meMoItemOrder}
                            listProducts={[...listProducts]}
                            outputListProducts={outputListProducts}
                            outputItemOrder={outputItemOrder}
                            outputPosition={outputPosition}
                            outputIsTopping={outputIsTopping}
                            outputIsSelectProduct={outputIsSelectProduct}
                            outputIsChangeTable={outputIsChangeTable}
                            listTopping={listTopping}
                        />
                    </View> :
                    null
                }
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

export default React.memo(Served)