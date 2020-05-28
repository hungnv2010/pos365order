import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import realmStore from '../../data/realm/RealmStore';
import dialogManager from '../../components/dialog/DialogManager';
import ProductsItem from './ProductsItem';
import ProductsItemForPhone from './ProductsItemForPhone';
import { Constant } from '../../common/Constant';
import I18n from '../../common/language/i18n';
import { change_alias } from '../../common/Utils';
import { useSelector } from 'react-redux';
import useDebounce from '../../customHook/useDebounce';


export default (props) => {
  const [isLoadMore, setIsLoadMore] = useState(false)
  const [hasProducts, setHasProducts] = useState(false)
  const [category, setCategory] = useState([])
  const [product, setProduct] = useState([])
  const [skip, setSkip] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [listCateId, setListCateId] = useState([-1])
  const [listProducts, setListProducts] = useState(() => props.listProducts)
  const [valueSearch, setValueSearch] = useState(() => props.valueSearch)
  const count = useRef(0)
  const debouncedVal = useDebounce(valueSearch)

  const { deviceType } = useSelector(state => {
    return state.Common
  });

  useEffect(() => {
    const getSearchResult = async () => {
      if (debouncedVal) {
        setIsSearching(true)
        count.current = 0
        let valueSearchLatin = change_alias(debouncedVal)
        let results = await realmStore.queryProducts()
        let searchResult = results.filtered(`NameLatin CONTAINS "${valueSearchLatin}" OR Code CONTAINS "${valueSearchLatin}"`)
        setProduct(searchResult)
      } else {
        onClickCate({ Id: -1, Name: I18n.t('tat_ca') })
        setIsSearching(false)
      }
    }
    getSearchResult()
  }, [debouncedVal])

  useEffect(() => {
    setValueSearch(props.valueSearch)
  }, [props.valueSearch])


  useEffect(() => {
    console.log(props.listProducts, 'props.listProducts');
    setListProducts(props.listProducts)
  }, [props.listProducts])

  useEffect(() => {
    const getCategories = async () => {
      let newCategories = [{ Id: -1, Name: I18n.t('tat_ca') }];
      let results = await realmStore.queryCategories()
      results.forEach(item => {
        newCategories.push(item)
      })
      setCategory(newCategories)
    }
    getCategories()
  }, [])

  const getProducts = useCallback(async () => {
    dialogManager.showLoading();
    console.log('getProducts');
    let results = await realmStore.queryProducts()
    if (listCateId[0] != -1) {
      results = results.filtered(`CategoryId == ${listCateId[0]}`)
    }
    let productsRes = results.slice(skip, skip + Constant.LOAD_LIMIT)
    count.current = productsRes.length
    setProduct([...product, ...productsRes])
    setHasProducts(true)
    setIsLoadMore(false)
    dialogManager.hiddenLoading();
    return () => {
      count.current = 0
    }
  }, [skip, listCateId])


  useEffect(() => {
    getProducts()
  }, [getProducts])


  const onClickCate = async (item, index) => {
    setHasProducts(false)
    resetState()
    setListCateId([item.Id])
  }

  const resetState = () => {
    console.log('reset');
    setProduct([])
    setSkip(0)
  }

  const onClickProduct = (item, index) => {
    item.Sid = Date.now()
    console.log(item, 'onClickProduct');
    if (item.SplitForSalesOrder) {
      item.Quantity = 1
      listProducts.unshift(item)
    }
    else {
      let exist = false;
      listProducts.forEach(listProduct => {
        if (listProduct.Id === item.Id) {
          item.Quantity++
          listProduct.Quantity++
          exist = true;
        }
      })
      if (!exist) {
        item.Quantity = 1
        listProducts.unshift(item)
      }
    }
    setProduct([...product])
    props.outputListProducts([...listProducts], 0)
  }

  const onClickProductForPhone = (item, index) => {
    let exist = false;
    item.Sid = Date.now()
    listProducts.forEach(listProduct => {
      if (listProduct.Id === item.Id) {
        item.Quantity++
        listProduct.Quantity++
        exist = true;
      }
    })
    if (!exist) {
      item.Quantity = 1
      listProducts.unshift(item)
    }
    console.log(item, 'onClickProduct');
    setProduct([...product])
    props.outputListProducts([...listProducts], 0)
  }

  const handleButtonIncrease = (item, index) => {
    console.log('handleButtonIncrease', item, index);
    listProducts.forEach(listProduct => {
      if (listProduct.Id === item.Id) {
        listProduct.Quantity++
      }
    })
    product[index].Quantity += 1;
    setProduct([...product])
    props.outputListProducts([...listProducts], 0)
  }

  const handleButtonDecrease = (item, index) => {
    listProducts.forEach(listProduct => {
      if (listProduct.Id === item.Id) {
        listProduct.Quantity--
      }
    })
    product[index].Quantity -= 1;
    setProduct([...product])
    props.outputListProducts([...listProducts], 0)
  }

  const getQuantityProduct = (arrItem) => {
    let Quantity = 0
    listProducts.forEach(item => {
      if (item.Id == arrItem.Id) {
        Quantity = item.Quantity
      }
    })
    return Quantity
  }

  const loadMore = (info) => {
    console.log(info, 'loadMore');
    if (count.current > 0) {
      setIsLoadMore(true)
      setSkip((prevSkip) => prevSkip + Constant.LOAD_LIMIT);
    }
  }


  const renderCateItem = (item, index) => {
    return (
      <TouchableOpacity onPress={() => onClickCate(item, index)} key={index} style={[styles.renderCateItem, { backgroundColor: item.Id == listCateId[0] ? "orange" : "white" }]}>
        <Text numberOfLines={2} style={[styles.textRenderCateItem, { color: item.Id == listCateId[0] ? "white" : "orange" }]}>{item.Name}</Text>
      </TouchableOpacity>
    );
  }



  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 0.5, flexDirection: "row", marginVertical: 5, marginHorizontal: 2 }}>
        <View style={{ flex: 1 }}>
          {isSearching ?
            <TouchableOpacity style={[styles.renderCateItem, { backgroundColor: "orange", flex: 1 }]}>
              <Text style={[styles.textRenderCateItem, { color: "white" }]}>Searching</Text>
            </TouchableOpacity>
            :
            <FlatList
              extraData={listCateId}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              data={category}
              renderItem={({ item, index }) => renderCateItem(item, index)}
              keyExtractor={(item, index) => '' + index}
            />}
        </View>
      </View>

      <View style={{ flex: 5, }}>
        <View style={{ flex: 1, justifyContent: "center", }}>
          {hasProducts ?
            <FlatList
              removeClippedSubviews={true}
              showsVerticalScrollIndicator={false}
              data={product}
              key={props.numColumns}
              numColumns={props.numColumns}
              renderItem={({ item, index }) => {
                return deviceType == Constant.TABLET ?
                  (<ProductsItem
                    getQuantityProduct={getQuantityProduct(item)}
                    item={item}
                    index={index}
                    onClickProduct={onClickProduct}
                  />)
                  :
                  (<ProductsItemForPhone
                    getQuantityProduct={getQuantityProduct(item)}
                    item={item}
                    index={index}
                    onClickProduct={onClickProductForPhone}
                    handleButtonDecrease={handleButtonDecrease}
                    handleButtonIncrease={handleButtonIncrease}
                  />)
              }}
              keyExtractor={(item, index) => '' + index}
              extraData={product.Quantity}
              onEndReached={(info) => { loadMore(info) }}
            />
            :
            <ActivityIndicator size="large" style={{}} color="orange" />}
        </View>
      </View>
      {isLoadMore ? <ActivityIndicator style={{ position: "absolute", right: 5, bottom: 5 }} color="orange" /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  renderCateItem: { justifyContent: "center", alignItems: "center", paddingHorizontal: 5, marginLeft: 5, width: 150 },
  textRenderCateItem: { fontWeight: "bold", textTransform: "uppercase", textAlign: "center", },
  button: { borderWidth: 1, padding: 20, borderRadius: 10 },
});
