import React from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { currencyToString } from '../../../../common/Utils';
import { Colors, Images, Metrics } from '../../../../theme';
import { useSelector } from 'react-redux';




const ProductsItem = (props) => {

    const onClickItem = () => {
        props.onClickProduct(props.item, props.index)
    }

    return (
        <TouchableOpacity onPress={onClickItem} key={props.index} style={{ backgroundColor: "white", borderRadius: 10, flex: 1 / 3, marginBottom: 7, marginLeft: 2 }}>
            <View style={{}}>
                <Image
                    style={{ height: 150, width: "100%", borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                    source={JSON.parse(props.item.ProductImages).length > 0 ? { uri: JSON.parse(props.item.ProductImages)[0].ImageURL } : Images.default_food_image}
                />
                <View style={{ marginLeft: 10 }}>
                    <Text numberOfLines={3} style={{ textTransform: "uppercase", fontWeight: "bold", paddingVertical: 5 }}>{props.item.Name}</Text>
                    <Text style={{ paddingVertical: 5, fontStyle: "italic" }}>{currencyToString(props.item.Price)}<Text style={{ color: Colors.colorchinh }}>{props.item.LargeUnit != '' ? `/${props.item.LargeUnit}` : props.item.Unit != '' ? `/${props.item.Unit}` : ''}</Text></Text>
                </View>
            </View>
            {props.getQuantityProduct > 0 ?
                <Image style={{ height: 30, width: 30, position: "absolute", top: 10, right: 10 }}
                    source={Images.icon_checked} />
                :
                null}
        </TouchableOpacity>
    )
}

export default React.memo(ProductsItem);
