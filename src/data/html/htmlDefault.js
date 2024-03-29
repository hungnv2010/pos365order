export default `<!DOCTYPE html>
<html lang="en">
   <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta charset="UTF-8">
      <title>Document</title>
      <style>
          table, th, td { border-collapse: collapse; font-size:16.0px; }
          td { text-align: right; word-wrap: break-word; max-width: 0px; }
          body { margin:0 auto; background-color: white;}
      </style>
   </head>
   <body style="" rules=rows align="center">
      <table style="width:100%; border: none;" rules=rows >
         <tr {Logo_Full_Check}>
            <td style="text-align: center; border: none;">
                <img style="width:80%; height:auto; border: collapse;" src='{Logo_Full}'/>
             </td>
         </tr>
         <tr>
            <td style="text-align: center; border: none;"> <b> {Ten_Cua_Hang}</b></td>
         </tr>
         <tr>
            <td style="text-align: center; border: none;"> <b>ĐC: {Dia_Chi_Cua_Hang}</b></td>
         </tr>
         <tr>
            <td style="text-align: center; border: none;"> <b> SĐT: {Dien_Thoai_Cua_Hang}</b></td>
         </tr>
         <tr>
            <td style="text-align: center; border: none;"> ----------------------------</td>
         </tr>
      </table>
      <table style="width:100%; border: none;" rules=rows >
         <tr>
            <td style="text-align: center; border: none;"> <b> {Loai_Hoa_Don}</b></td>
         </tr>
         <tr {Ma_Chung_Tu_Check}>
            <td style="text-align: center; border: none;"> <b>Số {Ma_Chung_Tu}</b> </td>
         </tr>
         <tr>
            <td style="text-align: center; border: none;"><b>Ngày: {Ngay_Tao_Karaoke} </b> </td>
         </tr>
      </table>
      <table style="width:100%; border: none;" rules=rows >
         <tr>
            <td style="text-align: left; border: none;"> <b>Giờ vào</b>: {Ngay}/{Thang}/{Nam}-{Gio}:{Phut}-Vao <b>Giờ ra</b>: {Ngay}/{Thang}/{Nam}-{Gio}:{Phut}-Ra</td>
         </tr>
         <tr>
            <td style="text-align: left; border: none;"> <b>Bàn</b>: {Ten_Phong_Ban}</td>
         </tr>
         <tr>
            <td style="text-align: left; border: none;"> <b>Khách hàng</b>: {Ten_Khach_Hang}{Dien_Thoai_Khach_Hang}{Dia_Chi_Khach_Hang}</td>
         </tr>
         <tr>
            <td style="text-align: left; border: none;"> <b>Thu ngân</b>: {Nhan_Vien}<br> </td>
         </tr>
      </table>
      <table style="width:100%; border: none;" rules=rows >
         <tr>
            <th style="text-align: left">Tên hàng</th>
            <th width="65" style="text-align: right">Đ.giá</th>
            <th width="30" style="text-align: right">SL</th>
            <th width="65" style="text-align: right">TT</th>
         </tr>
         <!--Body Table-->
         <tr height="25px">
            <td style="text-align: left">{Ten_Hang_Hoa}{Ghi_Chu_Hang_Hoa}</td>
            <td>
               {Don_Gia}
               <div {Don_Gia_Goc_Hien_Thi_Check}><del>{Don_Gia_Goc_Hien_Thi}</del></div>
            </td>
            <td style="text-align: right">{So_Luong}</td>
            <td>{Thanh_Tien_Hang_Hoa}</td>
         </tr>
         <!--Body Table-->
      </table>
      <table style="width:100%; border: none;" rules=rows >
         <tr>
            <td style="border: none; text-align: left"> <b>Tổng thành tiền</b> </td>
            <td style="border: none;"> <b>{Tong_Truoc_Chiet_Khau}</b> </td>
         </tr>
         <tr {Chiet_Khau_Check}>
         <td style="border: none; text-align: left"> <b> Chiết khấu </b> </td>
         <td  style="border: none;"> <b> {Chiet_Khau} </b> </td>
         </tr>
         <tr {VAT_Check}>
            <td  style="border: none; text-align: left"> <b> VAT ({VAT%}) </b> </td>
            <td style="border: none;"> <b> {VAT} </b> </td>
         </tr>
         <tr>
            <td style="border: none; text-align: left"> <b>Tổng cộng</b> </td>
            <td colspan="3" style="border: none;"> <b>{Tong_Cong}</b> </td>
         </tr>
         <tr {Excess_Cash_Check}>
            <td style="border: none; text-align: left"> <b> Tiền khách trả </b> </td>
            <td style="border: none;"> <b> {Tien_Khach_Dua} </b> </td>
         </tr>
         <tr {Excess_Cash_Check}>
            <td style="border: none; text-align: left"> <b> Tiền thừa </b> </td>
            <td style="border: none;"> <b> {Tien_Thua_Tra_Khach} </b> </td>
         </tr>
      </table>
      <table style="width:100%; border: none;" rules=rows >
         <tr {Ghi_Chu_Check}>
            <td style="text-align: left; border: none;"> {Ghi_Chu} </td>
         </tr>
         <tr>
            <td style="text-align: center; border: none;"> <b>  ----------------------------<br> {Chan_Trang}<br><br>{FOOTER_POS_365} </b> </td>
         </tr>
      </table>
        <br>
        <br>
        <br>
        <br>
   </body>
</html>`