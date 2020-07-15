import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Image, View, StyleSheet, Button, Text, TouchableOpacity, ScrollView, NativeEventEmitter, NativeModules } from 'react-native';
import { Images, Colors, Metrics } from '../../theme';
import { WebView } from 'react-native-webview';
import useDidMountEffect from '../../customHook/useDidMountEffect';
import dialogManager from '../../components/dialog/DialogManager';
import { HTTPService } from '../../data/services/HttpService';
import { ApiPath } from '../../data/services/ApiPath';
import ToolBarPreviewHtml from '../../components/toolbar/ToolBarPreviewHtml';
import JsonContent1 from '../../data/json/data_print_demo'
import { dateToDate, DATE_FORMAT, currencyToString } from '../../common/Utils';
import { getFileDuLieuString } from '../../data/fileStore/FileStorage';
import { Constant } from '../../common/Constant';
import { useSelector } from 'react-redux';
import { Snackbar } from 'react-native-paper';
const { Print } = NativeModules;
const eventSwicthScreen = new NativeEventEmitter(Print);

const typeHeader = "HOÁ ĐƠN TEST PRINT"
const code = "HD000000"
const number = "0000"

const CONTENT_FOOTER_POS365 = "Powered by POS365.VN"

class PrintService {

    GenHtml = async (html, JsonContent) => {
        let vendorSession = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
        console.log('data', JSON.parse(vendorSession));
        vendorSession = JSON.parse(vendorSession);
        return new Promise((resolve, reject) => {
            let HTMLBase = html;
            let listHtml = HTMLBase.split("<!--Body Table-->");
            let listTable = ""
            let sum = 0;
            JsonContent.OrderDetails.forEach(el => {
                var description = el.Description && el.Description.trim() != "" ? `<br>${el.Description?.replace(";", "<br>")}` : "";
                let itemTable = listHtml[1];

                let BasePriceCustomAndTopping = (el.IsLargeUnit ? el.PriceLargeUnit : el.UnitPrice) + el.TotalTopping

                itemTable = itemTable.replace("{Ten_Hang_Hoa}", "" + el.Name)
                itemTable = itemTable.replace("{Ghi_Chu_Hang_Hoa}", description)
                itemTable = itemTable.replace("{So_Luong}", el.Quantity)
                itemTable = itemTable.replace("{Thanh_Tien_Hang_Hoa}", currencyToString(this.getPrice(el)))
                itemTable = itemTable.replace("{Don_Gia}", currencyToString(el.Price))
                itemTable = itemTable.replace("{Don_Gia_Goc_Hien_Thi_Check}", BasePriceCustomAndTopping > el.Price ? "style='display: block'" : "style='display: none'")
                itemTable = itemTable.replace("{Don_Gia_Goc_Hien_Thi}", currencyToString(BasePriceCustomAndTopping))
                sum += this.getPrice(el);
                listTable += itemTable;
            });
            HTMLBase = listHtml[0] + listTable + listHtml[2];
            if (vendorSession.CurrentRetailer) {
                let img = vendorSession.CurrentRetailer.Logo;
                if (img != "") {
                    HTMLBase = HTMLBase.replace("{Logo_Full}", img)
                    HTMLBase = HTMLBase.replace("{Logo_Full_Check}", `style="visibility: 'unset'"`)
                } else {
                    HTMLBase = HTMLBase.replace("{Logo_Full_Check}", `style="visibility: 'collapse'"`)
                }
                let CurrentBranch = vendorSession.Branchs.filter(item => item.Id == vendorSession.CurrentBranchId)
                console.log("CurrentBranch ", CurrentBranch);
                if (CurrentBranch.length == 1) {
                    CurrentBranch = CurrentBranch[0]
                }
                HTMLBase = HTMLBase.replace("{Ten_Cua_Hang}", CurrentBranch.Name)
                HTMLBase = HTMLBase.replace("{Dia_Chi_Cua_Hang}", vendorSession.CurrentRetailer.Address ? vendorSession.CurrentRetailer.Address : "")
                HTMLBase = HTMLBase.replace("{Dien_Thoai_Cua_Hang}", vendorSession.CurrentRetailer.Phone)
                HTMLBase = HTMLBase.replace("{Loai_Hoa_Don}", typeHeader)
                HTMLBase = HTMLBase.replace("{Ma_Chung_Tu}", number + ": " + code)
                HTMLBase = HTMLBase.replace("{Ngay_Tao_Karaoke}", dateToDate(new Date()))
                HTMLBase = HTMLBase.replace("{Ngay}/{Thang}/{Nam}-{Gio}:{Phut}-Vao", dateToDate(JsonContent.ActiveDate, DATE_FORMAT, "DD/MM/YYYY - HH:mm"))
                HTMLBase = HTMLBase.replace("{Ngay}/{Thang}/{Nam}-{Gio}:{Phut}-Ra", dateToDate(new Date(), DATE_FORMAT, "DD/MM/YYYY - HH:mm"))
                HTMLBase = HTMLBase.replace("{Ten_Phong_Ban}", JsonContent.RoomName + "[" + JsonContent.Pos + "]")
                HTMLBase = HTMLBase.replace("{Ten_Khach_Hang}", JsonContent.Partner && JsonContent.Partner.Name != "" ? JsonContent.partner.name : "Khách lẻ")
                HTMLBase = HTMLBase.replace("{Nhan_Vien}", vendorSession.CurrentUser.Name)

                let partnerPhone = JsonContent.Partner && JsonContent.Partner.Phone ? JsonContent.Partner.Phone : ""
                HTMLBase = HTMLBase.replace("{Dien_Thoai_Khach_Hang}", partnerPhone)
                let addressCustomer = JsonContent.Partner && JsonContent.Partner.Address ? JsonContent.Partner.Address : ""
                let addressCustomerShow = addressCustomer != "" ? addressCustomer : "";
                HTMLBase = HTMLBase.replace("{Dia_Chi_Khach_Hang}", addressCustomerShow)

                HTMLBase = HTMLBase.replace("{Tong_Truoc_Chiet_Khau}", currencyToString(sum))
                HTMLBase = HTMLBase.replace("{Chiet_Khau_Check}", JsonContent.Discount > 0 ? "style='visibility: unset;'" : "style='visibility: collapse; display: none'")
                HTMLBase = HTMLBase.replace("{Chiet_Khau}", currencyToString(JsonContent.Discount))
                HTMLBase = HTMLBase.replace("{VAT_Check}", JsonContent.VATRates != "" && JsonContent.VAT > 0 ? "style='visibility: unset'" : "style='visibility: collapse; display: none'")
                HTMLBase = HTMLBase.replace("{VAT}", currencyToString(JsonContent.VAT))
                HTMLBase = HTMLBase.replace("{VAT%}", JsonContent.VATRates + "%")
                HTMLBase = HTMLBase.replace("{Tong_Cong}", currencyToString(JsonContent.Total))
                HTMLBase = HTMLBase.replace(/{Excess_Cash_Check}/g, (JsonContent.ExcessCash != 0) &&
                 (JsonContent.TotalPayment != undefined && JsonContent.TotalPayment != "") ? "style='visibility: unset'" : "style='visibility: collapse; display: none'")
                HTMLBase = HTMLBase.replace("{Tien_Khach_Dua}", JsonContent.TotalPayment != undefined && JsonContent.TotalPayment != "" ? currencyToString(JsonContent.TotalPayment) : "")
                HTMLBase = HTMLBase.replace("{Tien_Thua_Tra_Khach}", currencyToString(JsonContent.ExcessCash))
                HTMLBase = HTMLBase.replace("{Ghi_Chu_Check}", JsonContent.Description && JsonContent.Description != "" ? "style='visibility: unset'" : "style='visibility: collapse; display: none'")
                HTMLBase = HTMLBase.replace("{Ghi_Chu}", JsonContent.Description)
                HTMLBase = HTMLBase.replace("{Chan_Trang}", "Xin cảm ơn, hẹn gặp lại quý khách!")
                HTMLBase = HTMLBase.replace("{FOOTER_POS_365}", CONTENT_FOOTER_POS365)
                // console.log("html ", JSON.stringify(HTMLBase));
                console.log("html Description ", JsonContent.Description);
            }
            console.log("html ", JSON.stringify(HTMLBase));
            resolve(HTMLBase);
        })
    }

    PrintHtmlService = (html, JsonContent) => {
        this.GenHtml(html, JsonContent).then(res => {
            if (res && res != "")
                Print.printImage(res)
        })
    }

    getPrice = (item) => {
        console.log('getPrice', item);
        let price = item.IsLargeUnit ? item.PriceLargeUnit : item.Price
        return item.Quantity * price
    }

}
const printService = new PrintService();
export default printService;