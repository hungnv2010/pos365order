
import I18n from '../../common/language/i18n';
import dialogManager from '../../components/dialog/DialogManager';
import store from "../../store/configureStore";
import { NavigateScreen, ScreenList } from '../../common/ScreenList';
import { ApiPath } from './ApiPath';
import { Platform, NativeModules } from 'react-native';
import { Constant } from '../../common/Constant';
import { setFileLuuDuLieu } from '../fileStore/FileStorage';
const { AzureHub } = NativeModules;
import NavigationService from "../../navigator/NavigationService";
// import * as StackNavigation from '../../navigator/stack/StackNavigation';
import { navigate } from '../../navigator/NavigationService';
import dataManager from '../DataManager';
import realmStore from '../realm/RealmStore';

const URL_DEBUG = "https://kt365cafe.pos365.vn/";

export var URL = { link: "https://oke.pos365.vn/" };

export var index401 = 0;

export class HTTPService {

    _api = URL.link;
    _path = ''

    HTTP_OK = 200 | 204;




    constructor() {

    }

    setAPI(api) {
        this._api = api;
    }

    setLinkFileTinh(path) {
        this._path = path;
        return this
    }

    setPath(path) {
        this._path = this._api + path;

        return this
    }

    setReplaceId(key, id) {
        this._path = this._path.replace(key, id)
        return this
    }

    GET(jsonParam, headers = getHeaders(), ) {
        let params = jsonParam ? convertJsonToPrameter(jsonParam) : ''
        this._path = this._path + params

        console.log('GET:', this._path, JSON.stringify(headers));

        return fetch(this._path, {
            method: 'GET',
            headers: headers,
            credentials: "omit",
        }).then(extractData).catch((e) => {
            dialogManager.showPopupOneButton(I18n.t('loi_server'), I18n.t('thong_bao'))
            console.log("GET err ", e);
        })

    }

    POST(jsonParam, headers = getHeaders()) {
        headers['Content-Type'] = 'application/json'
        console.log('POST:', this._path, headers, jsonParam);
        return fetch(this._path, {
            method: 'POST',
            credentials: "omit",
            headers: headers,
            body: JSON.stringify(jsonParam),
        }).then(extractData).catch((e) => {
            // dialogManager.showPopupOneButton(I18n.t('loi_server'), I18n.t('thong_bao'))
            console.log("POST err ", e);
        })
    }

    PUT(jsonParam, headers = getHeaders()) {
        headers['Content-Type'] = 'application/json'
        return fetch(this._path, {
            method: 'PUT',
            credentials: "omit",
            headers: headers,
            body: JSON.stringify(jsonParam),
        }).then(extractData);
    }

    DELETE(jsonParam, headers = getHeaders()) {
        let params = convertJsonToPrameter(jsonParam)
        return fetch(this._path + params, {
            method: 'DELETE',
            credentials: "omit",
            headers: headers,
        }).then(extractData);
    }

}
const extractData = (response) => {
    console.log("extractData Responses === ", response)
    if (response.status == 200) {
            return response.json();
    }
    else {
        if (response.status == 401) {
            index401++;
            // if (!(response.url.includes(ApiPath.RETAILER_INFO) || response.url.includes(ApiPath.LOGIN))) {
            if (index401 == 10) {
                setFileLuuDuLieu(Constant.CURRENT_ACCOUNT, "");
                realmStore.deleteAll()
                setFileLuuDuLieu(Constant.CURRENT_BRANCH, "");
                dataManager.dataChoosing = []
                navigate('Login', {}, true);
                index401 = 0
            }
        } else {
            dialogManager.showPopupOneButton(I18n.t('loi_server'), I18n.t('thong_bao'), () => {
                dialogManager.destroy();
            }, null, null, I18n.t('dong'))
        }
        return {
            status: response.status
        };
    }

}



export function convertJsonToPrameter(jsonData) {
    let state = store.getState();
    console.log("convertJsonToPrameter state ", state);
    return '?' + new URLSearchParams(jsonData).toString();
}

export function getHeaders(jsonHeader = null, isLogin = false) {
    let state = store.getState();
    let headers = {

        // 'Accept-Language': I18n.locale,
        'Accept': 'application/json',
        // 'Content-Type': 'application/json',
    }
    if (state.Common.info && state.Common.info.SessionId && state.Common.info.SessionId != "" && isLogin == false)
        headers["COOKIE"] = "ss-id=" + state.Common.info.SessionId;

    if (jsonHeader) {
        Object.keys(jsonHeader).forEach(function (key) {
            headers[key] = jsonHeader[key];
        })
    }

    return headers;
}