import React from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { currencyToString } from '../../../../common/Utils';
import { Colors, Images, Metrics } from '../../../../theme';
import { useSelector } from 'react-redux';




const ProductsItem = ({ item, index, getQuantityProduct, numColumns, onClickProduct }) => {

    const onClickItem = () => {
        onClickProduct(item, index)
    }

    return (
        <TouchableOpacity onPress={onClickItem} key={index} style={{ backgroundColor: "white", borderRadius: 10, flex: 1 / numColumns, marginBottom: 7, marginLeft: 2 }}>
            <View style={{}}>
                <Image
                    style={{ height: 150, width: "100%", borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                    source={JSON.parse(item.ProductImages).length > 0 ? { uri: JSON.parse(item.ProductImages)[0].ImageURL } : Images.default_food_image}
                />
                <View style={{ marginLeft: 10 }}>
                    <Text numberOfLines={3} style={{ textTransform: "uppercase", fontWeight: "bold", paddingVertical: 5 }}>{item.Name}</Text>
                    <Text style={{ paddingVertical: 5, fontStyle: "italic" }}>{currencyToString(item.Price)}<Text style={{ color: Colors.colorchinh }}>{item.LargeUnit != '' ? `/${item.LargeUnit}` : item.Unit != '' ? `/${item.Unit}` : ''}</Text></Text>
                </View>
            </View>
            {getQuantityProduct > 0 ?
                <Image style={{ height: 30, width: 30, position: "absolute", top: 10, right: 10 }}
                    source={Images.icon_checked} />
                :
                null}
        </TouchableOpacity>
    )
}

export default React.memo(ProductsItem);
