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
  
}
@end

@implementation Print {
  bool isConnectAndPrint;
  UIWebView * webView;
  NSString *html;
  NSString *IP;
  bool hasListeners;
  NSMutableArray *imageArray;
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
  imageArray = [[NSMutableArray alloc] init];
  
  CGRect frame = CGRectMake(0,0,200,600);
  webView =[[UIWebView alloc] initWithFrame:frame];
  webView.delegate = self;
  webView.userInteractionEnabled = NO;
  webView.opaque = NO;
  webView.backgroundColor = [UIColor whiteColor];
  [webView loadHTMLString: html baseURL: nil];
  
  
  double delayInSeconds = 1;
  dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC)); // 1
  dispatch_after(popTime, dispatch_get_main_queue(), ^(void){
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

    imagePrint = image;
    NSLog(@".width=%d",image.size.width);
    NSLog(@".height=%d",image.size.height);
    
    float i_width = 800;
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
    
    int numberArrayImage = 1;
    if(newHeight > newWidth){
      if(fmod(newHeight,newWidth) > 0){
        numberArrayImage = newHeight / newWidth + 1;
      }else{
        numberArrayImage = newHeight / newWidth;
      }
    }
    
    for (int i=0; i<numberArrayImage; i++) {
      CGImageRef topImgRef = CGImageCreateWithImageInRect(tmpImgRef, CGRectMake(0, i * newImage.size.height / numberArrayImage, newImage.size.width, newImage.size.height / numberArrayImage));
      UIImage *img = [UIImage imageWithCGImage:topImgRef];
      [imageArray addObject:img];
      CGImageRelease(topImgRef);
    }
    
    NSLog(@"numberArrayImage == %d",numberArrayImage);
    for (int i=0, count = [imageArray count]; i < count; i++) {
      NSLog(@"numberArrayImage %@",[imageArray objectAtIndex:i]);
      
      Cmd *cmd = [_printerManager CreateCmdClass:_printerManager.CurrentPrinterCmdType];
      [cmd Clear];
      cmd.encodingType =Encoding_UTF8;
      NSData *headercmd = [_printerManager GetHeaderCmd:cmd cmdtype:_printerManager.CurrentPrinterCmdType];
      [cmd Append:headercmd];
      
      Printer *currentprinter = _printerManager.CurrentPrinter;
      BitmapSetting *bitmapSetting  = currentprinter.BitmapSetts;
      //                                       bitmapSetting.Alignmode = Align_Right;
      bitmapSetting.Alignmode = Align_Center;
      bitmapSetting.limitWidth = 60*9;//ESC
      
      NSData *data;
      data = [cmd GetBitMapCmd:bitmapSetting image:[imageArray objectAtIndex:i]];
      [cmd Append:data];
      [cmd Append:[cmd GetCutPaperCmd:CutterMode_half]];
      if ([_printerManager.CurrentPrinter IsOpen]){
        NSData *data=[cmd GetCmd];
        NSLog(@"data bytes=%@",data);
        [currentprinter Write:data];
      }
      data = nil;
      cmd=nil;
      
    }
  });
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
      [self SendSwicthScreen: @"Error"];
    } else if (([notification.name isEqualToString:(NSString *)BleDeviceDataChanged]))
    {
      NSLog(@"notification BleDeviceDataChanged");
    }
    
  });
}

+ (id)allocWithZone:(NSZone *)zone {
  static Print *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [super allocWithZone:zone];
  });
  return sharedInstance;
}

// Will be called when this module's first listener is added.
-(void)startObserving {
  hasListeners = YES;
  // Set up any upstream listeners or background tasks as necessary
}

// Will be called when this module's last listener is removed, or on dealloc.
-(void)stopObserving {
  hasListeners = NO;
  // Remove upstream listeners, stop unnecessary background tasks
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"sendSwicthScreen"];
}
- (void)SendSwicthScreen: (NSString *) info
{
  if (hasListeners) {
    [self sendEventWithName:@"sendSwicthScreen" body:IP];
  } else {
    
  }
}

@end
