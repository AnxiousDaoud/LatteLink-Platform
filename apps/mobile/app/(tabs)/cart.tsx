import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthSession } from "../../src/auth/session";
import { buildPricingSummary, describeCustomization } from "../../src/cart/model";
import { useCart } from "../../src/cart/store";
import { formatUsd, resolveStoreConfigData, useStoreConfigQuery } from "../../src/menu/catalog";
import {
  canAttemptNativeApplePay,
  requestNativeApplePayWallet,
  type ApplePayWalletPayload
} from "../../src/orders/applePay";
import { createDemoApplePayToken, useApplePayCheckoutMutation } from "../../src/orders/checkout";

function SummaryRow({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className={`text-sm ${emphasized ? "font-semibold text-foreground" : "text-foreground/70"}`}>{label}</Text>
      <Text className={`text-sm ${emphasized ? "font-semibold text-foreground" : "text-foreground/70"}`}>{value}</Text>
    </View>
  );
}

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuthSession();
  const { items, itemCount, subtotalCents, setQuantity, removeItem, clear } = useCart();
  const storeConfigQuery = useStoreConfigQuery();
  const storeConfig = resolveStoreConfigData(storeConfigQuery.data);
  const pricingSummary = buildPricingSummary(subtotalCents, storeConfig.taxRateBasisPoints);
  const checkoutMutation = useApplePayCheckoutMutation();
  const nativeApplePayAvailable = canAttemptNativeApplePay();
  const [applePayToken, setApplePayToken] = useState("demo-apple-pay-token");
  const [nativeApplePayPending, setNativeApplePayPending] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState("");

  function submitCheckout(paymentInput: { applePayToken: string } | { applePayWallet: ApplePayWalletPayload }) {
    setCheckoutStatus("Submitting Apple Pay payment...");

    checkoutMutation.mutate(
      {
        locationId: storeConfig.locationId,
        items,
        ...paymentInput
      },
      {
        onSuccess: (paidOrder) => {
          setNativeApplePayPending(false);
          clear();
          setCheckoutStatus(`Payment accepted. Pickup code ${paidOrder.pickupCode}.`);
        },
        onError: (error) => {
          setNativeApplePayPending(false);
          const message = error instanceof Error ? error.message : "Checkout failed.";
          setCheckoutStatus(message);
        }
      }
    );
  }

  function handleApplePayTokenCheckout() {
    const token = applePayToken.trim();
    if (!token) {
      setCheckoutStatus("Enter an Apple Pay token before checkout.");
      return;
    }

    setApplePayToken("");
    submitCheckout({ applePayToken: token });
  }

  async function handleNativeApplePayCheckout() {
    if (!nativeApplePayAvailable) {
      setCheckoutStatus("Native Apple Pay is unavailable in this build. Use fallback token mode.");
      return;
    }

    setNativeApplePayPending(true);
    setCheckoutStatus("Opening Apple Pay sheet...");

    try {
      const walletPayload = await requestNativeApplePayWallet({
        amountCents: pricingSummary.totalCents,
        currencyCode: "USD",
        countryCode: "US",
        label: "Gazelle Coffee"
      });
      submitCheckout({ applePayWallet: walletPayload });
    } catch (error) {
      setNativeApplePayPending(false);
      const message = error instanceof Error ? error.message : "Apple Pay sheet failed.";
      setCheckoutStatus(message);
    }
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: insets.top + 18,
          paddingBottom: Math.max(insets.bottom + 148, 168)
        }}
      >
        <Text className="text-[34px] font-semibold text-foreground">Cart</Text>
        <Text className="mt-2 text-sm text-foreground/70">
          Review line items, adjust quantities, and confirm pricing before checkout.
        </Text>

        {items.length === 0 ? (
          <View className="mt-6 rounded-2xl border border-foreground/15 bg-white px-5 py-5">
            <Text className="text-sm text-foreground/70">Your cart is empty.</Text>
            <Link href="/(tabs)/menu" asChild>
              <Pressable className="mt-4 self-start rounded-full bg-foreground px-5 py-3">
                <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-background">
                  Browse Menu
                </Text>
              </Pressable>
            </Link>
          </View>
        ) : (
          <View className="mt-6 gap-3">
            {items.map((item) => (
              <View key={item.lineId} className="rounded-2xl border border-foreground/15 bg-white px-4 py-4">
                <View className="flex-row items-start justify-between">
                  <Text className="mr-2 flex-1 text-base font-semibold text-foreground">{item.name}</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {formatUsd(item.unitPriceCents * item.quantity)}
                  </Text>
                </View>
                <Text className="mt-1 text-sm text-foreground/70">{describeCustomization(item.customization)}</Text>
                <Text className="mt-1 text-xs text-foreground/60">{formatUsd(item.unitPriceCents)} each</Text>

                <View className="mt-3 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Pressable
                      className="h-8 w-8 items-center justify-center rounded-full border border-foreground"
                      onPress={() => setQuantity(item.lineId, item.quantity - 1)}
                    >
                      <Text className="text-base font-semibold text-foreground">-</Text>
                    </Pressable>
                    <Text className="w-8 text-center text-sm font-semibold text-foreground">{item.quantity}</Text>
                    <Pressable
                      className="h-8 w-8 items-center justify-center rounded-full border border-foreground"
                      onPress={() => setQuantity(item.lineId, item.quantity + 1)}
                    >
                      <Text className="text-base font-semibold text-foreground">+</Text>
                    </Pressable>
                  </View>

                  <Pressable className="rounded-full border border-foreground/25 px-3 py-2" onPress={() => removeItem(item.lineId)}>
                    <Text className="text-xs font-semibold uppercase tracking-[1px] text-foreground/70">Remove</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            <View className="mt-1 rounded-2xl border border-foreground/15 bg-white px-4 py-4">
              <Text className="text-xs uppercase tracking-[1.5px] text-foreground/60">Pricing Summary</Text>
              <View className="mt-3 gap-2">
                <SummaryRow label={`Items (${itemCount})`} value={formatUsd(pricingSummary.subtotalCents)} />
                <SummaryRow
                  label={`Estimated tax (${(storeConfig.taxRateBasisPoints / 100).toFixed(2)}%)`}
                  value={formatUsd(pricingSummary.taxCents)}
                />
                <View className="my-1 h-px bg-foreground/10" />
                <SummaryRow label="Estimated total" value={formatUsd(pricingSummary.totalCents)} emphasized />
              </View>
            </View>

            <View className="rounded-2xl border border-foreground/15 bg-white px-4 py-4">
              <Text className="text-xs uppercase tracking-[1.5px] text-foreground/60">Pickup</Text>
              <Text className="mt-2 text-sm text-foreground/75">{storeConfig.pickupInstructions}</Text>
              <Text className="mt-1 text-xs text-foreground/60">Estimated prep time: {storeConfig.prepEtaMinutes} min</Text>
            </View>

            {isAuthenticated ? (
              <View className="rounded-2xl border border-foreground/15 bg-white px-4 py-4">
                <Text className="text-xs uppercase tracking-[1.5px] text-foreground/60">Apple Pay</Text>

                <Pressable
                  className={`mt-2 rounded-full px-5 py-4 ${
                    nativeApplePayPending || checkoutMutation.isPending
                      ? "bg-foreground/50"
                      : nativeApplePayAvailable
                        ? "bg-foreground"
                        : "bg-foreground/30"
                  }`}
                  disabled={nativeApplePayPending || checkoutMutation.isPending || !nativeApplePayAvailable}
                  onPress={handleNativeApplePayCheckout}
                >
                  <Text className="text-center text-xs font-semibold uppercase tracking-[2px] text-background">
                    {nativeApplePayPending
                      ? "Opening Apple Pay..."
                      : checkoutMutation.isPending
                        ? "Processing..."
                        : "Pay with Apple Pay"}
                  </Text>
                </Pressable>

                <Text className="mt-2 text-xs text-foreground/60">
                  Native Apple Pay requires iOS device support and a build with Apple Pay entitlements.
                </Text>

                <Text className="mt-4 text-xs uppercase tracking-[1.5px] text-foreground/60">
                  Fallback token mode (dev)
                </Text>
                <TextInput
                  value={applePayToken}
                  onChangeText={setApplePayToken}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  placeholder="Apple Pay token"
                  className="mt-2 rounded-xl border border-foreground/20 bg-white px-4 py-3 text-foreground"
                />

                <Pressable
                  className="mt-3 self-start rounded-full border border-foreground px-4 py-2"
                  onPress={() => setApplePayToken(createDemoApplePayToken())}
                >
                  <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-foreground">
                    Use Demo Token
                  </Text>
                </Pressable>

                <Pressable
                  className={`mt-3 rounded-full px-5 py-4 ${
                    checkoutMutation.isPending || nativeApplePayPending ? "bg-foreground/50" : "bg-foreground"
                  }`}
                  disabled={checkoutMutation.isPending || nativeApplePayPending}
                  onPress={handleApplePayTokenCheckout}
                >
                  <Text className="text-center text-xs font-semibold uppercase tracking-[2px] text-background">
                    {checkoutMutation.isPending ? "Processing..." : "Pay with Token Fallback"}
                  </Text>
                </Pressable>

                <Text className="mt-2 text-xs text-foreground/60">
                  Token fallback is for local simulation and manual testing only.
                </Text>
              </View>
            ) : (
              <Link href={{ pathname: "/auth", params: { returnTo: "/(tabs)/cart" } }} asChild>
                <Pressable className="mt-1 rounded-full bg-foreground px-5 py-4">
                  <Text className="text-center text-xs font-semibold uppercase tracking-[2px] text-background">
                    Sign In to Checkout
                  </Text>
                </Pressable>
              </Link>
            )}

            <Pressable
              className="rounded-full border border-foreground px-5 py-3"
              onPress={() => {
                clear();
                setCheckoutStatus("");
              }}
            >
              <Text className="text-center text-xs font-semibold uppercase tracking-[1.5px] text-foreground">
                Clear Cart
              </Text>
            </Pressable>

            {checkoutStatus ? <Text className="text-xs text-foreground/70">{checkoutStatus}</Text> : null}

            {storeConfigQuery.error ? (
              <Text className="text-xs text-foreground/60">
                Using fallback store settings while live config is unavailable.
              </Text>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
