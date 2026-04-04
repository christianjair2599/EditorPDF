"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export interface SubscriptionState {
  isPremium: boolean;
  status: "free" | "active" | "canceled" | "past_due" | string;
  currentPeriodEnd: string | null;
  loading: boolean;
}

export function useSubscription(): SubscriptionState {
  const { data: session } = useSession();
  const [state, setState] = useState<SubscriptionState>({
    isPremium: false,
    status: "free",
    currentPeriodEnd: null,
    loading: true,
  });

  useEffect(() => {
    const email = session?.user?.email;
    if (!email) {
      setState({ isPremium: false, status: "free", currentPeriodEnd: null, loading: false });
      return;
    }
    fetch(`/api/subscription?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => setState({ isPremium: d.isPremium, status: d.status, currentPeriodEnd: d.currentPeriodEnd, loading: false }))
      .catch(() => setState({ isPremium: false, status: "free", currentPeriodEnd: null, loading: false }));
  }, [session?.user?.email]);

  return state;
}
