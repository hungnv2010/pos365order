import React, { useEffect, useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import realmStore from '../../../../data/realm/RealmStore';
import ProductsItemForPhone from './ProductsItemForPhone';
import { Constant } from '../../../../common/Constant';
import I18n from '../../../../common/language/i18n';
import { change_alias } from '../../../../common/Utils';
import useDebounce from '../../../../customHook/useDebounce';
import { Colors, Metrics, Images } from '../../../../theme'
import ToolBarSelectProduct from '../../../../components/toolbar/ToolBarSelectProduct'
import dialogManager from '../../../../components/dialog/DialogManager'


export default (props) => {
  const [isLoadMore, setIsLoadMore] = useState(false)
  const [hasProducts, setHasProducts] = useState(false)
  const [category, setCategory] = useState([])
  const [product, setProduct] = useState([])
  const [skip, setSkip] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [listCateId, setListCateId] = useState([-1])
  const [listProducts, setListProducts] = useState(() => props.route.params.listProducts)
  const newProducts = useRef([])

  const [valueSearch, setValueSearch] = useState('')
  const count = useRef(0)
  const debouncedVal = useDebounce(valueSearch)


  useEffect(() => {
    console.log('SelectProduct', props);

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
    console.log('getProducts');
    let results = await realmStore.queryProducts()
    if (listCateId[0] != -1) {
      results = results.filtered(`CategoryId == ${listCateId[0]}`)
    }
    let productsRes = results.slice(skip, skip + Constant.LOAD_LIMIT)
    console.log('productsRes', productsRes);

    count.current = productsRes.length
    setProduct([...product, ...productsRes])
    setHasProducts(true)
    setIsLoadMore(false)
    return () => {
      count.current = 0
    }
  }, [skip, listCateId])


  useEffect(() => {
    getProducts()
  }, [getProducts])

  useEffect(() => {
    const getSearchResult = async () => {
      if (debouncedVal) {
        setHasProducts(false)
        setIsSearching(true)
        count.current = 0
        let valueSearchLatin = change_alias(debouncedVal)
        let results = await realmStore.queryProducts()
        let searchResult = results.filtered(`NameLatin CONTAINS "${valueSearchLatin}" OR Code CONTAINS "${valueSearchLatin}"`)
        setProduct(searchResult)
        setHasProducts(true)
      } else {
        onClickCate({ Id: -1, Name: I18n.t('tat_ca') })
        setIsSearching(false)
      }
    }
    getSearchResult()
  }, [debouncedVal])


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
    let exist = false;
    item.Sid = Date.now()
    newProducts.current.forEach(listProduct => {
      if (listProduct.Id === item.Id) {
        listProduct.Quantity++
        exist = true;
      }
    })
    if (!exist) {
      item.Quantity = 1
      newProducts.current.unshift(item)
    }
    setProduct([...product])
  }

  const handleButtonIncrease = (item, index) => {
    console.log('handleButtonIncrease', item, index);
    newProducts.current.forEach(listProduct => {
      if (listProduct.Id === item.Id) {
        listProduct.Quantity++
      }
    })
    setProduct([...product])
  }

  const handleButtonDecrease = (item, index) => {
    newProducts.current.forEach(listProduct => {
      if (listProduct.Id === item.Id) {
        listProduct.Quantity--
      }
    })
    setProduct([...product])
  }

  const getQuantityProduct = (arrItem) => {
    let Quantity = 0
    listProducts.concat(newProducts.current).forEach(item => {
      if (item.Id == arrItem.Id) {
        Quantity = item.Quantity
      }
    })
    return Quantity
  }

  const onClickDone = () => {
    props.navigation.pop();
    props.route.params._onSelect(newProducts.current, 1);
  }

  const clickLeftIcon = () => {
    console.log('newProducts.current', newProducts.current);
    if (newProducts.current.length > 0) {
      dialogManager.showPopupTwoButton('Bạn có muốn lưu thay đổi không?', 'Thông báo', (value) => {
        if (value == 1) {
          onClickDone()
        } else {
          props.navigation.goBack();
        }
      })
    } else {
      props.navigation.goBack();
    }
  }

  const loadMore = (info) => {
    console.log(info, 'loadMore');
    if (count.current > 0) {
      setIsLoadMore(true)
      setSkip((prevSkip) => prevSkip + Constant.LOAD_LIMIT);
    }
  }

  const outputTextSearch = (text) => {
    setValueSearch(text)
  }


  const renderCateItem = (item, index) => {
    return (
      <TouchableOpacity onPress={() => onClickCate(item, index)} key={index} style={[styles.renderCateItem, { backgroundColor: item.Id == listCateId[0] ? Colors.colorchinh : "white" }]}>
        <Text numberOfLines={2} style={[styles.textRenderCateItem, { color: item.Id == listCateId[0] ? "white" : Colors.colorchinh }]}>{item.Name}</Text>
      </TouchableOpacity>
    );
  }


  return (
    <View style={{ flex: 1 }}>
      <ToolBarSelectProduct
        leftIcon="keyboard-backspace"
        clickLeftIcon={clickLeftIcon}
        onClickDone={onClickDone}
        title="Select Product"
        outputTextSearch={outputTextSearch} />
      <View style={{ flex: 0.5, flexDirection: "row", marginVertical: 5, marginHorizontal: 2 }}>
        <View style={{ flex: 1 }}>
          {isSearching ?
            <TouchableOpacity style={[styles.renderCateItem, { backgroundColor: Colors.colorchinh, flex: 1 }]}>
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
              renderItem={({ item, index }) =>
                <ProductsItemForPhone
                  getQuantityProduct={getQuantityProduct(item)}
                  item={item}
                  index={index}
                  onClickProduct={onClickProduct}
                  handleButtonDecrease={handleButtonDecrease}
                  handleButtonIncrease={handleButtonIncrease}
                />
              }
              keyExtractor={(item, index) => '' + index}
              extraData={product.Quantity}
              onEndReached={(info) => { loadMore(info) }}
            />
            :
            <ActivityIndicator size="large" style={{}} color={Colors.colorchinh} />}
        </View>
      </View>
      {isLoadMore ? <ActivityIndicator style={{ position: "absolute", right: 5, bottom: 5 }} color={Colors.colorchinh} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  renderCateItem: { justifyContent: "center", alignItems: "center", paddingHorizontal: 5, marginLeft: 5, width: 150 },
  textRenderCateItem: { fontWeight: "bold", textTransform: "uppercase", textAlign: "center", },
  button: { borderWidth: 1, padding: 20, borderRadius: 10 },
});
