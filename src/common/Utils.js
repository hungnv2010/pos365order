import I18n from "./language/i18n";
import moment from "moment";

export const DATE_FORMAT = "YYYY-MM-DD'T'HH:mm:ss.SSFFFFF'Z'";

//Convert number, currency format
export const currencyToString = value => {
  if (!value || (value && value == "")) {
    value = "0";
  }
  // value = value | 0;
  value = parseInt(value)
  value = value.toString();
  let money = parseInt(value.replace(/\D/g, ""), 10);
  let currentMoney = I18n.toNumber(money, { delimiter: ",", precision: 0 });
  return currentMoney.toString();
};

//Convert Time (Date is String type, moment is Moment type)
export const dateToDate = (date, inputFormat = "YYYY-MM-DD HH:mm:ss", outputFormat = "DD/MM/YYYY") => {
  let dateOutput = "";
  try {
    dateOutput = moment(date, inputFormat).format(outputFormat);
    if (dateOutput == "Invalid date") {
      dateOutput = "";
    }
  } catch (e) {
    dateOutput = "";
  }
  return dateOutput;
};

export const dateUTCToDate = (date, inputFormat = "YYYYMMDDhhmmss", outputFormat = "HH:mm DD/MM/YYYY") => {
  let momentUTC = moment.utc(date, inputFormat)
  let momentITC = moment(momentUTC).local();
  let dateITC = momentITC.format(outputFormat);
  return dateITC;
};

export const dateUTCToMoment = (date, inputFormat = "yyyy-MM-dd'T'HH:mm:ss.SSFFFFF'Z'") => {
  let momentUTC = moment.utc(date, inputFormat)
  let momentITC = moment(momentUTC).local();
  return momentITC;
}

export const momentToDateUTC = (momentInput, outputFormat = "YYYY-MM-DDTHH:mm:ss.SS") => {
  let dateUTC = moment.utc(momentInput).format(outputFormat)
  return dateUTC
}

export const change_alias = (alias) => {
  var str = alias;
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
  str = str.replace(/ + /g, " ");
  str = str.trim();
  return str;
}

