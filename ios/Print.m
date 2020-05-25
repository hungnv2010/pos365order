//
//  Print.m
//  Pos365Order
//
//  Created by HungNV on 5/18/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "Print.h"
#import "PrinterManager.h"

@interface Print ()
{
  PrinterManager * _printerManager;
  UIImage *imagePrint;
  UIImage *imagePrint1;
  UIImage *imagePrint2;
  
}
@end

@implementation Print {
  bool isConnectAndPrint;
  UIWebView * webView;
  NSString *html;
  NSString *IP;
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(registerPrint:(NSString *)param) {
  NSLog(@"registerPrint param %@", param);
  IP = param;
  isConnectAndPrint = NO;
  _printerManager = [PrinterManager sharedInstance];
  [_printerManager AddConnectObserver:self selector:@selector(handleNotification:)];//Add
}

RCT_EXPORT_METHOD(printImage:(NSString *)param) {
  NSLog(@"printImage param %@", param);
  html = param;
  isConnectAndPrint = YES;
  [_printerManager DoConnectwifi:IP Port:9100];
  
}

- (void)loadWebview{
  NSLog(@"loadWebview ");
  
  CGRect frame = CGRectMake(0,0,200,600);
  webView =[[UIWebView alloc] initWithFrame:frame];
  webView.delegate = self;
  
  webView.userInteractionEnabled = NO;
  webView.opaque = NO;
  webView.backgroundColor = [UIColor whiteColor];
  [webView loadHTMLString: html baseURL: nil];
  
  
  double delayInSeconds = 1;
  dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC)); // 1
  dispatch_after(popTime, dispatch_get_main_queue(), ^(void){ // 2
    
    //    });
    //
    
    CGRect originalFrame = webView.frame;
    
    //get the width and height of webpage using js (you might need to use another call, this doesn't work always)
    int webViewHeight = [[webView stringByEvaluatingJavaScriptFromString:@"document.body.scrollHeight;"] integerValue];
    int webViewWidth = [[webView stringByEvaluatingJavaScriptFromString:@"document.body.scrollWidth;"] integerValue];
    
    NSLog(@"webViewWidth=%d",webViewWidth);
    NSLog(@"webViewHeight=%d",webViewHeight);
    //set the webview's frames to match the size of the page
    [webView setFrame:CGRectMake(0, 0, webViewWidth, webViewHeight)];
    
    //make the snapshot
    UIGraphicsBeginImageContextWithOptions(webView.frame.size, false, 0.0);
    [webView.layer renderInContext:UIGraphicsGetCurrentContext()];
    UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    //set the webview's frame to the original size
    [webView setFrame:originalFrame];
    
    //and VOILA :)
    imagePrint = image;
    //                           self.imageView.image = imagePrint;
    NSLog(@".width=%d",image.size.width);
    NSLog(@".height=%d",image.size.height);
    //                           self.imageView.contentMode = UIViewContentModeScaleAspectFit;
    //                           [self imageWithImage:imagePrint scaledToWidth:5000 ];
    
    float i_width = 5000;
    float oldWidth = imagePrint.size.width;
    float oldHeight = imagePrint.size.height;
    
    float scaleFactor = i_width / oldWidth;
    NSLog(@"i_width=%f",i_width);
    NSLog(@"oldWidth=%f",oldWidth);
    NSLog(@"scaleFactor=%f",scaleFactor);
    
    float newHeight = oldHeight * scaleFactor;
    float newWidth = oldWidth * scaleFactor;
    
    NSLog(@"newWidth=%f",newWidth);
    NSLog(@"newHeight=%f",newHeight);
    UIGraphicsBeginImageContext(CGSizeMake(newWidth, newHeight));
    [imagePrint drawInRect:CGRectMake(0, 0, newWidth, newHeight)];
    UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
    imagePrint = newImage;
    
    CGImageRef tmpImgRef = newImage.CGImage;
    CGImageRef topImgRef = CGImageCreateWithImageInRect(tmpImgRef, CGRectMake(0, 0, newImage.size.width, newImage.size.height / 2.0));
    imagePrint1 = [UIImage imageWithCGImage:topImgRef];
    CGImageRelease(topImgRef);
    
    CGImageRef bottomImgRef = CGImageCreateWithImageInRect(tmpImgRef, CGRectMake(0, newImage.size.height / 2.0,  newImage.size.width, newImage.size.height / 2.0));
    imagePrint2 = [UIImage imageWithCGImage:bottomImgRef];
    CGImageRelease(bottomImgRef);
    
    for (int i=0; i<2; i++) {
      Cmd *cmd = [_printerManager CreateCmdClass:_printerManager.CurrentPrinterCmdType];
      [cmd Clear];
      cmd.encodingType =Encoding_UTF8;
      NSData *headercmd = [_printerManager GetHeaderCmd:cmd cmdtype:_printerManager.CurrentPrinterCmdType];
      [cmd Append:headercmd];
      
      NSLog(@"imageFromWebview 4");
      Printer *currentprinter = _printerManager.CurrentPrinter;
      BitmapSetting *bitmapSetting  = currentprinter.BitmapSetts;
      //                                       bitmapSetting.Alignmode = Align_Right;
      bitmapSetting.Alignmode = Align_Center;
      bitmapSetting.limitWidth = 60*9;//ESC
      
      
      NSLog(@"imageFromWebview 5");
      
      NSData *data;
      if(i == 0){
        data = [cmd GetBitMapCmd:bitmapSetting image:imagePrint1];
      }else {
        data = [cmd GetBitMapCmd:bitmapSetting image:imagePrint2];
      }
      [cmd Append:data];
      [cmd Append:[cmd GetCutPaperCmd:CutterMode_half]];
      if ([_printerManager.CurrentPrinter IsOpen]){
        NSData *data=[cmd GetCmd];
        NSLog(@"data bytes=%@",data);
        //        NSLog(@"===========================");
        //        Byte *b =[data bytes];
        //        NSMutableString * s = [NSMutableString new];
        //        for (int i=0; i<data.length; i++) {
        //            [s appendFormat:@"%02x ",b[i]];
        //            if ((i+1) % 16==0)
        //              [s appendString:@"\r"];
        //        }
        //        NSLog(@"s=%@",s);
        // NSString *aString = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
        //aString = [aString stringByReplacingOccurrencesOfString:@"\r" withString:@""];
        //NSLog(@"data string=%@",aString);
        [currentprinter Write:data];
      }
      data = nil;
      cmd=nil;
      
    }
  });
}

- (UIImage*)imageWithImage: (UIImage*) sourceImage scaledToWidth: (float) i_width
{
  NSLog(@"sourceImage.size.width=%f",sourceImage.size.width);
  NSLog(@"sourceImage.size.height=%f",sourceImage.size.height);
  float oldWidth = sourceImage.size.width;
  float oldHeight = sourceImage.size.height;
  
  float scaleFactor = i_width / oldWidth;
  NSLog(@"i_width=%f",i_width);
  NSLog(@"oldWidth=%f",oldWidth);
  NSLog(@"scaleFactor=%f",scaleFactor);
  
  float newHeight = oldHeight * scaleFactor;
  float newWidth = oldWidth * scaleFactor;
  
  NSLog(@"newWidth=%f",newWidth);
  NSLog(@"newHeight=%f",newHeight);
  UIGraphicsBeginImageContext(CGSizeMake(newWidth, newHeight));
  [sourceImage drawInRect:CGRectMake(0, 0, newWidth, newHeight)];
  UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
  imagePrint = newImage;
  
  CGImageRef tmpImgRef = newImage.CGImage;
  CGImageRef topImgRef = CGImageCreateWithImageInRect(tmpImgRef, CGRectMake(0, 0, newImage.size.width, newImage.size.height / 2.0));
  imagePrint1 = [UIImage imageWithCGImage:topImgRef];
  CGImageRelease(topImgRef);
  
  CGImageRef bottomImgRef = CGImageCreateWithImageInRect(tmpImgRef, CGRectMake(0, newImage.size.height / 2.0,  newImage.size.width, newImage.size.height / 2.0));
  imagePrint2 = [UIImage imageWithCGImage:bottomImgRef];
  CGImageRelease(bottomImgRef);
  UIGraphicsEndImageContext();
  return newImage;
}

#pragma handleNotification
- (void)handleNotification:(NSNotification *)notification{
  dispatch_async(dispatch_get_main_queue(),^{
    NSLog(@"handleNotification");
    if([notification.name isEqualToString:(NSString *)PrinterConnectedNotification])
    {
      NSLog(@"notification PrinterConnectedNotification");
      if (isConnectAndPrint) {
        NSLog(@"isConnectAndPrint");
        [self loadWebview];
      }
    }else if([notification.name isEqualToString:(NSString *)PrinterDisconnectedNotification])
    {
      NSLog(@"notification PrinterDisconnectedNotification");
    } else if (([notification.name isEqualToString:(NSString *)BleDeviceDataChanged]))
    {
      NSLog(@"notification BleDeviceDataChanged");
    }
    
  });
}

@end
