"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { pushDataLayerEvent } from "@/lib/analytics";

type Props = Omit<ComponentProps<typeof Link>, "onClick"> & {
  ctaLocation: string;
  planInterest?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function LandingCta({ ctaLocation, planInterest, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        pushDataLayerEvent("landing_cta_click", {
          cta_location: ctaLocation,
          ...(planInterest ? { plan_interest: planInterest } : {}),
        });
        onClick?.(event);
      }}
    />
  );
}