#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(ApplePayModule, NSObject)

RCT_EXTERN_METHOD(canMakePayments:(NSString *)merchantIdentifier
                  supportedNetworks:(NSArray<NSString *> *)supportedNetworks
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(requestPayment:(NSDictionary *)request
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end

@interface RCT_EXTERN_REMAP_MODULE(ApplePayButtonView, ApplePayButtonViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(buttonType, NSString)
RCT_EXPORT_VIEW_PROPERTY(buttonStyle, NSString)
RCT_EXPORT_VIEW_PROPERTY(isDisabled, BOOL)

@end
