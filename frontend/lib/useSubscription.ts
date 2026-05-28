"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export interface SubscriptionState {
  isPremium: boolean;
  status: "free" | "active" | "canceled" | "past_due" | string;
  currentPeriodEnd: string | null;
  isAdmin: boolean;
  isTester: boolean;
  loading: boolean;
}

export function useSubscription(): SubscriptionState {
  const { data: session } = useSession();
  const [state, setState] = useState<SubscriptionState>({
    isPremium: false,
    status: "free",
    currentPeriodEnd: null,
    isAdmin: false,
    isTester: false,
    loading: true,
  });

  useEffect(() => {
    const email = session?.user?.email;
    if (!email) {
      setState({ isPremium: false, status: "free", currentPeriodEnd: null, isAdmin: false, isTester: false, loading: false });
      return;
    }
    fetch(`/api/subscription?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => setState({
        isPremium: d.isPremium,
        status: d.status,
        currentPeriodEnd: d.currentPeriodEnd,
        isAdmin: !!d.isAdmin,
        isTester: !!d.isTester,
        loading: false,
      }))
      .catch(() => setState({ isPremium: false, status: "free", currentPeriodEnd: null, isAdmin: false, isTester: false, loading: false }));
  }, [session?.user?.email]);

  return state;
}
