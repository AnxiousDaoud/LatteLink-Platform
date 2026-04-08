#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ApplePayModule, NSObject)

RCT_EXTERN_METHOD(canMakePayments:(NSString *)merchantIdentifier
                  supportedNetworks:(NSArray<NSString *> *)supportedNetworks
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(requestPayment:(NSDictionary *)request
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
