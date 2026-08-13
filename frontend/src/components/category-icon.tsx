"use client";

import {
  Home,
  Utensils,
  Car,
  HeartPulse,
  Book,
  Gamepad2,
  ShoppingBag,
  Repeat,
  Tag,
  Banknote,
  Briefcase,
  TrendingUp,
  Wallet,
  Plane,
  Gift,
  CreditCard,
  FileText,
  Users,
  Scissors,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  home: Home,
  utensils: Utensils,
  car: Car,
  "heart-pulse": HeartPulse,
  book: Book,
  gamepad: Gamepad2,
  "shopping-bag": ShoppingBag,
  repeat: Repeat,
  tag: Tag,
  banknote: Banknote,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  wallet: Wallet,
  plane: Plane,
  gift: Gift,
  "credit-card": CreditCard,
  "file-text": FileText,
  users: Users,
  scissors: Scissors,
};

export function CategoryIcon({
  name,
  color,
  className = "h-4 w-4",
}: {
  name: string;
  color: string;
  className?: string;
}) {
  const Icon = iconMap[name] ?? Tag;
  return <Icon className={className} style={{ color }} />;
}
