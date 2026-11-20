import {
  Backpack, Banknote, BookOpen, Briefcase, Bus, Camera, Car, CircleDot, Coffee, Coins, CreditCard, Crown, Dumbbell,
  Flame, Folders, Footprints, Fuel, Gamepad2, Gem, Gift, GraduationCap, HandCoins, Headphones, HeartPulse, House,
  Landmark, Laptop, Leaf, Lightbulb, Medal, Music, Film, Notebook, NotebookPen, Package, PiggyBank, Pill, Pizza, Plane,
  Receipt, Rocket, ScrollText, ShieldCheck, ShoppingBag, ShoppingCart, Shirt, Skull, Smartphone, Sparkles, Star, Swords,
  Target, TrendingUp, TreePalm, Trophy, Train, Utensils, Wallet, Wifi, Wrench, Zap, Bike,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

/** Registry ikon: kunci string (disimpan di DB) -> komponen lucide. Nilai tak dikenal -> fallback. */
export const ICONS = {
  // Keuangan
  wallet: Wallet,
  coins: Coins,
  banknote: Banknote,
  "piggy-bank": PiggyBank,
  landmark: Landmark,
  "credit-card": CreditCard,
  "hand-coins": HandCoins,
  "trending-up": TrendingUp,
  receipt: Receipt,
  gem: Gem,
  // Makanan & belanja
  utensils: Utensils,
  coffee: Coffee,
  pizza: Pizza,
  "shopping-bag": ShoppingBag,
  "shopping-cart": ShoppingCart,
  shirt: Shirt,
  // Transport & rumah
  bus: Bus,
  car: Car,
  train: Train,
  bike: Bike,
  plane: Plane,
  house: House,
  fuel: Fuel,
  wifi: Wifi,
  // Hiburan & belajar
  gamepad: Gamepad2,
  music: Music,
  film: Film,
  headphones: Headphones,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  camera: Camera,
  "tree-palm": TreePalm,
  // Kerja, kesehatan, barang
  briefcase: Briefcase,
  laptop: Laptop,
  wrench: Wrench,
  pill: Pill,
  "heart-pulse": HeartPulse,
  dumbbell: Dumbbell,
  smartphone: Smartphone,
  package: Package,
  backpack: Backpack,
  gift: Gift,
  // Quest, tantangan, achievement
  target: Target,
  trophy: Trophy,
  flame: Flame,
  "shield-check": ShieldCheck,
  skull: Skull,
  rocket: Rocket,
  footprints: Footprints,
  notebook: Notebook,
  "notebook-pen": NotebookPen,
  "scroll-text": ScrollText,
  zap: Zap,
  lightbulb: Lightbulb,
  leaf: Leaf,
  folders: Folders,
  star: Star,
  crown: Crown,
  medal: Medal,
  swords: Swords,
  sparkles: Sparkles,
  "circle-dot": CircleDot,
} as const satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof ICONS;

export const FALLBACK_ICON: IconKey = "circle-dot";

export const DEFAULT_ICONS = {
  category: "coins",
  wallet: "wallet",
  goal: "skull",
  challenge: "target",
  achievement: "trophy",
} as const satisfies Record<string, IconKey>;

export function isIconKey(name: unknown): name is IconKey {
  return typeof name === "string" && Object.prototype.hasOwnProperty.call(ICONS, name);
}

/** Ambil komponen ikon; nilai lama (mis. teks emoji dari data lama) jatuh ke fallback. */
export function resolveIcon(name: string | null | undefined): LucideIcon {
  return isIconKey(name) ? ICONS[name] : ICONS[FALLBACK_ICON];
}

export function AppIcon({
  name,
  size = 20,
  strokeWidth = 2,
  className,
  style,
  color,
}: {
  name: string | null | undefined;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
  color?: string;
}) {
  const Cmp: LucideIcon = isIconKey(name) ? ICONS[name] : ICONS[FALLBACK_ICON];
  return <Cmp size={size} strokeWidth={strokeWidth} className={className} style={style} color={color} aria-hidden />;
}

/** Kelompok untuk icon picker. */
export const ICON_GROUPS: { label: string; keys: IconKey[] }[] = [
  { label: "Keuangan", keys: ["wallet", "coins", "banknote", "piggy-bank", "landmark", "credit-card", "hand-coins", "trending-up", "receipt", "gem"] },
  { label: "Makanan & belanja", keys: ["utensils", "coffee", "pizza", "shopping-bag", "shopping-cart", "shirt"] },
  { label: "Transport & rumah", keys: ["bus", "car", "train", "bike", "plane", "house", "fuel", "wifi"] },
  { label: "Hiburan & belajar", keys: ["gamepad", "music", "film", "headphones", "book-open", "graduation-cap", "camera", "tree-palm"] },
  { label: "Kerja & barang", keys: ["briefcase", "laptop", "wrench", "pill", "heart-pulse", "dumbbell", "smartphone", "package", "backpack", "gift"] },
  { label: "Quest & lencana", keys: ["target", "trophy", "flame", "shield-check", "skull", "rocket", "footprints", "notebook", "notebook-pen", "scroll-text", "zap", "lightbulb", "leaf", "folders", "star", "crown", "medal", "swords", "sparkles"] },
];

/** Subset siap pakai per jenis form. */
export const PICKER_SETS = {
  category: ICON_GROUPS.slice(0, 5),
  wallet: [ICON_GROUPS[0], { label: "Lainnya", keys: ["smartphone", "backpack", "briefcase", "house"] as IconKey[] }],
  goal: [
    { label: "Target impian", keys: ["skull", "laptop", "tree-palm", "headphones", "house", "car", "smartphone", "graduation-cap", "gift", "plane", "camera", "bike", "piggy-bank", "gem", "crown", "rocket"] as IconKey[] },
  ],
  challenge: [
    { label: "Tantangan", keys: ["target", "notebook-pen", "shield-check", "leaf", "piggy-bank", "folders", "flame", "lightbulb", "coffee", "rocket", "zap", "star"] as IconKey[] },
  ],
  achievement: [ICON_GROUPS[5], { label: "Keuangan", keys: ["coins", "wallet", "piggy-bank", "gem"] as IconKey[] }],
} satisfies Record<string, { label: string; keys: IconKey[] }[]>;
