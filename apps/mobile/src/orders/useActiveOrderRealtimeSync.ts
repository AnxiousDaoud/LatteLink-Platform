import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { findActiveOrder, mergeOrderIntoHistory, orderHistoryQueryKey, type OrderHistoryEntry, useOrderHistoryQuery } from "../account/data";
import { apiClient } from "../api/client";

export function useActiveOrderRealtimeSync(isAuthenticated: boolean) {
  const queryClient = useQueryClient();
  const ordersQuery = useOrderHistoryQuery(isAuthenticated);
  const activeOrder = findActiveOrder(ordersQuery.data ?? []);

  useEffect(() => {
    if (!isAuthenticated || !activeOrder?.id) {
      return;
    }

    return apiClient.subscribeToOrderUpdates(
      activeOrder.id,
      (updatedOrder) => {
        const nextOrder = updatedOrder as OrderHistoryEntry;

        queryClient.setQueryData<OrderHistoryEntry[] | undefined>(orderHistoryQueryKey, (currentOrders) =>
          mergeOrderIntoHistory(currentOrders, nextOrder)
        );
      },
      (error) => {
        if (__DEV__) {
          console.warn("Order update subscription failed", error);
        }
      }
    );
  }, [activeOrder?.id, isAuthenticated, queryClient]);
}
