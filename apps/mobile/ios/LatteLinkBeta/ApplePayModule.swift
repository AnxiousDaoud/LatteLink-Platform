import Foundation
import PassKit
import React
import UIKit

@objc(ApplePayModule)
final class ApplePayModule: NSObject, PKPaymentAuthorizationViewControllerDelegate {
  private var resolveBlock: RCTPromiseResolveBlock?
  private var rejectBlock: RCTPromiseRejectBlock?
  private var didResolvePayment = false
  private var pendingError: (code: String, message: String)?

  @objc
  static func requiresMainQueueSetup() -> Bool {
    true
  }

  @objc(canMakePayments:supportedNetworks:resolver:rejecter:)
  func canMakePayments(
    _ merchantIdentifier: String,
    supportedNetworks: [String],
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let trimmedMerchantIdentifier = merchantIdentifier.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmedMerchantIdentifier.isEmpty else {
      resolve(false)
      return
    }
    _ = reject

    let networks = self.resolveSupportedNetworks(supportedNetworks)
    let available: Bool

    if networks.isEmpty {
      available = PKPaymentAuthorizationViewController.canMakePayments()
    } else {
      available = PKPaymentAuthorizationViewController.canMakePayments(usingNetworks: networks, capabilities: .capability3DS)
    }

    resolve(available)
  }

  @objc(requestPayment:resolver:rejecter:)
  func requestPayment(
    _ rawRequest: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      if self.resolveBlock != nil || self.rejectBlock != nil {
        reject("E_APPLE_PAY_IN_PROGRESS", "An Apple Pay request is already in progress.", nil)
        return
      }

      guard
        let merchantIdentifier = (rawRequest["merchantIdentifier"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
        !merchantIdentifier.isEmpty
      else {
        reject("E_APPLE_PAY_MERCHANT", "Apple Pay merchant identifier is required.", nil)
        return
      }

      guard let amountCents = rawRequest["amountCents"] as? NSNumber, amountCents.intValue > 0 else {
        reject("E_APPLE_PAY_AMOUNT", "Apple Pay amount must be a positive integer.", nil)
        return
      }

      guard let label = (rawRequest["label"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines), !label.isEmpty else {
        reject("E_APPLE_PAY_LABEL", "Apple Pay payment label is required.", nil)
        return
      }

      let supportedNetworks = self.resolveSupportedNetworks(rawRequest["supportedNetworks"] as? [String] ?? [])
      if supportedNetworks.isEmpty {
        reject("E_APPLE_PAY_NETWORKS", "At least one supported Apple Pay network is required.", nil)
        return
      }

      guard let presenter = self.topViewController() else {
        reject("E_APPLE_PAY_PRESENTATION", "Unable to find a view controller to present Apple Pay.", nil)
        return
      }

      let paymentRequest = PKPaymentRequest()
      paymentRequest.merchantIdentifier = merchantIdentifier
      paymentRequest.supportedNetworks = supportedNetworks
      paymentRequest.merchantCapabilities = .capability3DS
      paymentRequest.countryCode = ((rawRequest["countryCode"] as? String) ?? "US").uppercased()
      paymentRequest.currencyCode = ((rawRequest["currencyCode"] as? String) ?? "USD").uppercased()
      paymentRequest.paymentSummaryItems = [
        PKPaymentSummaryItem(
          label: label,
          amount: NSDecimalNumber(mantissa: UInt64(amountCents.intValue), exponent: -2, isNegative: false)
        )
      ]

      guard let controller = PKPaymentAuthorizationViewController(paymentRequest: paymentRequest) else {
        reject("E_APPLE_PAY_CONTROLLER", "Unable to create Apple Pay authorization controller.", nil)
        return
      }

      self.resolveBlock = resolve
      self.rejectBlock = reject
      self.didResolvePayment = false
      self.pendingError = nil

      controller.delegate = self
      presenter.present(controller, animated: true)
    }
  }

  func paymentAuthorizationViewController(
    _ controller: PKPaymentAuthorizationViewController,
    didAuthorizePayment payment: PKPayment,
    handler completion: @escaping (PKPaymentAuthorizationResult) -> Void
  ) {
    guard let walletPayload = serializeWalletPayload(from: payment.token) else {
      pendingError = (
        code: "E_APPLE_PAY_TOKEN",
        message: "Unable to extract Apple Pay wallet payload from the authorized payment."
      )
      completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
      return
    }

    didResolvePayment = true
    resolveBlock?(walletPayload)
    resolveBlock = nil
    rejectBlock = nil
    completion(PKPaymentAuthorizationResult(status: .success, errors: nil))
  }

  func paymentAuthorizationViewControllerDidFinish(_ controller: PKPaymentAuthorizationViewController) {
    controller.dismiss(animated: true) {
      if let pendingError = self.pendingError {
        self.rejectBlock?(pendingError.code, pendingError.message, nil)
      } else if !self.didResolvePayment {
        self.rejectBlock?("E_APPLE_PAY_CANCELED", "Apple Pay was canceled.", nil)
      }

      self.resolveBlock = nil
      self.rejectBlock = nil
      self.pendingError = nil
      self.didResolvePayment = false
    }
  }

  private func serializeWalletPayload(from token: PKPaymentToken) -> [String: Any]? {
    guard
      let object = try? JSONSerialization.jsonObject(with: token.paymentData),
      let payload = object as? [String: Any]
    else {
      return nil
    }

    return payload
  }

  private func resolveSupportedNetworks(_ values: [String]) -> [PKPaymentNetwork] {
    values.compactMap { value in
      switch value.lowercased() {
      case "visa":
        return .visa
      case "mastercard":
        return .masterCard
      case "amex":
        return .amex
      case "discover":
        return .discover
      default:
        return nil
      }
    }
  }

  private func topViewController(base: UIViewController? = nil) -> UIViewController? {
    let rootViewController = base ?? UIApplication.shared
      .connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap(\.windows)
      .first(where: \.isKeyWindow)?
      .rootViewController

    if let navigationController = rootViewController as? UINavigationController {
      return topViewController(base: navigationController.visibleViewController)
    }

    if let tabBarController = rootViewController as? UITabBarController, let selectedViewController = tabBarController.selectedViewController {
      return topViewController(base: selectedViewController)
    }

    if let presentedViewController = rootViewController?.presentedViewController {
      return topViewController(base: presentedViewController)
    }

    return rootViewController
  }
}

@objc(ApplePayButtonViewManager)
final class ApplePayButtonViewManager: RCTViewManager {
  override static func requiresMainQueueSetup() -> Bool {
    true
  }

  override func view() -> UIView! {
    ApplePayButtonView()
  }
}

@objc(ApplePayButtonView)
final class ApplePayButtonView: UIView {
  @objc var buttonType: NSString = "buy" {
    didSet {
      updateButton()
    }
  }

  @objc var buttonStyle: NSString = "black" {
    didSet {
      updateButton()
    }
  }

  @objc var isDisabled: Bool = false {
    didSet {
      updateDisabledState()
    }
  }

  private var button: PKPaymentButton?

  override init(frame: CGRect) {
    super.init(frame: frame)
    commonInit()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    commonInit()
  }

  private func commonInit() {
    backgroundColor = .clear
    clipsToBounds = true
    updateButton()
  }

  private func updateButton() {
    button?.removeFromSuperview()

    let paymentButton = PKPaymentButton(
      paymentButtonType: resolveButtonType(buttonType as String),
      paymentButtonStyle: resolveButtonStyle(buttonStyle as String)
    )
    paymentButton.translatesAutoresizingMaskIntoConstraints = false
    paymentButton.isUserInteractionEnabled = false

    addSubview(paymentButton)
    NSLayoutConstraint.activate([
      paymentButton.leadingAnchor.constraint(equalTo: leadingAnchor),
      paymentButton.trailingAnchor.constraint(equalTo: trailingAnchor),
      paymentButton.topAnchor.constraint(equalTo: topAnchor),
      paymentButton.bottomAnchor.constraint(equalTo: bottomAnchor)
    ])

    button = paymentButton
    updateDisabledState()
  }

  private func updateDisabledState() {
    alpha = isDisabled ? 0.45 : 1
    button?.isEnabled = !isDisabled
  }

  private func resolveButtonType(_ rawValue: String) -> PKPaymentButtonType {
    switch rawValue.lowercased() {
    case "plain":
      return .plain
    case "set-up", "setup":
      return .setUp
    case "donate":
      return .donate
    case "check-out", "checkout":
      return .checkout
    case "book":
      return .book
    case "subscribe":
      return .subscribe
    case "reload":
      return .reload
    case "add-money", "addmoney":
      return .addMoney
    case "top-up", "topup":
      return .topUp
    case "order":
      return .order
    case "rent":
      return .rent
    case "support":
      return .support
    case "contribute":
      return .contribute
    case "tip":
      return .tip
    default:
      return .buy
    }
  }

  private func resolveButtonStyle(_ rawValue: String) -> PKPaymentButtonStyle {
    switch rawValue.lowercased() {
    case "white":
      return .white
    case "white-outline", "whiteoutline":
      return .whiteOutline
    case "automatic":
      return .automatic
    default:
      return .black
    }
  }
}
