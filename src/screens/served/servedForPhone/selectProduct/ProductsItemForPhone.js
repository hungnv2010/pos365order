import React from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { currencyToString } from '../../../../common/Utils';
import { Colors, Images, Metrics } from '../../../../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';



const ProductsItemForPhone = (props) => {

    const onClickItem = () => {
        props.onClickProduct(props.item, props.index)
    }

    return (
        <TouchableOpacity key={props.index} onPress={onClickItem} style={{ flex: 1, flexDirection: "row", backgroundColor: "white", paddingVertical: 5, marginBottom: 3, marginHorizontal: 5, borderRadius: 10 }}>
            <Image
                style={{ height: 70, width: 70, borderRadius: 50 }}
                source={JSON.parse(props.item.ProductImages).length > 0 ? { uri: JSON.parse(props.item.ProductImages)[0].ImageURL } : Images.default_food_image}
            />
            <View style={{ flexDirection: "column", flex: 2, marginLeft: 10, justifyContent: "center" }}>
                <Text numberOfLines={3} style={{ textTransform: "uppercase", fontWeight: "bold" }}>{props.item.Name}</Text>
                <Text style={{ paddingVertical: 5, fontStyle: "italic" }}>{currencyToString(props.item.Price)}<Text style={{ color: Colors.colorchinh }}>{props.item.LargeUnit != '' ? `/${props.item.LargeUnit}` : props.item.Unit != '' ? `/${props.item.Unit}` : ''}</Text></Text>
            </View>
            <View style={{ flex: 1.5, flexDirection: "row", alignItems: "center", marginRight: 25 }}>

                {props.item.Quantity > 0 ?
                    <>
                        <TouchableOpacity onPress={() => { props.handleButtonDecrease(props.item, props.index) }}>
                            <Icon name="minus-circle" size={40} color={Colors.colorchinh} />
                        </TouchableOpacity>
                        <TextInput keyboardType="numeric" textAlign="center" style={{ width: 50, borderBottomWidth: .5 }}>{props.item.Quantity}</TextInput>
                        <TouchableOpacity onPress={() => { props.handleButtonIncrease(props.item, props.index) }}>
                            <Icon name="plus-circle" size={40} color={Colors.colorchinh} />
                        </TouchableOpacity>
                    </> :
                    null
                }

            </View>
        </TouchableOpacity>
    );
}

export default React.memo(ProductsItemForPhone);
