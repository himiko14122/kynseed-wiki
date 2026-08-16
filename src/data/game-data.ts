// Game-specific data for Kynseed
// Color maps, entity structures, and tier utilities

/* ──────────────── Color Maps ──────────────── */
export const TIER_COLOR_MAP: Record<string, string> = {
  S: 'var(--color-tier-s)',
  A: 'var(--color-tier-a)',
  B: 'var(--color-tier-b)',
  C: 'var(--color-tier-c)',
};
export const TIER_COLOR_DEFAULT = 'var(--color-tier-c)';

export function tierColor(tier: string): string {
  return TIER_COLOR_MAP[tier] ?? TIER_COLOR_DEFAULT;
}

/* ──────────────── Weapons (homepage Table 1) ──────────────── */
export interface WeaponEntry {
  id: string;
  nameKey: string;
  typeKey: string;
  damageKey: string;
  tier: string;
}

export const WEAPONS: WeaponEntry[] = [
  { id: 'sword', nameKey: 'weapon_sword', typeKey: 'weapon_sword_type', damageKey: 'weapon_sword_damage', tier: 'A' },
  { id: 'bow', nameKey: 'weapon_bow', typeKey: 'weapon_bow_type', damageKey: 'weapon_bow_damage', tier: 'A' },
  { id: 'staff', nameKey: 'weapon_staff', typeKey: 'weapon_staff_type', damageKey: 'weapon_staff_damage', tier: 'S' },
  { id: 'axe', nameKey: 'weapon_axe', typeKey: 'weapon_axe_type', damageKey: 'weapon_axe_damage', tier: 'B' },
  { id: 'dagger', nameKey: 'weapon_dagger', typeKey: 'weapon_dagger_type', damageKey: 'weapon_dagger_damage', tier: 'C' },
];

/* ──────────────── Crops (homepage Cards 1) ──────────────── */
export interface CropEntry {
  id: string;
  nameKey: string;
  seasonKey: string;
  profitKey: string;
  tier: string;
}

export const CROPS: CropEntry[] = [
  { id: 'wheat', nameKey: 'crop_wheat', seasonKey: 'crop_wheat_season', profitKey: 'crop_wheat_profit', tier: 'A' },
  { id: 'tomato', nameKey: 'crop_tomato', seasonKey: 'crop_tomato_season', profitKey: 'crop_tomato_profit', tier: 'B' },
  { id: 'corn', nameKey: 'crop_corn', seasonKey: 'crop_corn_season', profitKey: 'crop_corn_profit', tier: 'A' },
  { id: 'pumpkin', nameKey: 'crop_pumpkin', seasonKey: 'crop_pumpkin_season', profitKey: 'crop_pumpkin_profit', tier: 'S' },
];

/* ──────────────── Businesses (homepage Table 2) ──────────────── */
export interface BusinessEntry {
  id: string;
  nameKey: string;
  investmentKey: string;
  profitKey: string;
  tier: string;
}

export const BUSINESSES: BusinessEntry[] = [
  { id: 'tavern', nameKey: 'business_tavern', investmentKey: 'business_tavern_investment', profitKey: 'business_tavern_profit', tier: 'S' },
  { id: 'apothecary', nameKey: 'business_apothecary', investmentKey: 'business_apothecary_investment', profitKey: 'business_apothecary_profit', tier: 'A' },
  { id: 'blacksmith', nameKey: 'business_blacksmith', investmentKey: 'business_blacksmith_investment', profitKey: 'business_blacksmith_profit', tier: 'A' },
  { id: 'goodsstore', nameKey: 'business_goodsstore', investmentKey: 'business_goodsstore_investment', profitKey: 'business_goodsstore_profit', tier: 'B' },
];

/* ──────────────── NPCs (homepage Cards 2) ──────────────── */
export interface NpcEntry {
  id: string;
  nameKey: string;
  typeKey: string;
  giftKey: string;
  tier: string;
}

export const NPCS: NpcEntry[] = [
  { id: 'Mayor', nameKey: 'npc_mayor', typeKey: 'npc_mayor_type', giftKey: 'npc_mayor_gift', tier: 'A' },
  { id: 'Baker', nameKey: 'npc_baker', typeKey: 'npc_baker_type', giftKey: 'npc_baker_gift', tier: 'B' },
  { id: 'Blacksmith', nameKey: 'npc_blacksmith', typeKey: 'npc_blacksmith_type', giftKey: 'npc_blacksmith_gift', tier: 'A' },
  { id: 'Healer', nameKey: 'npc_healer', typeKey: 'npc_healer_type', giftKey: 'npc_healer_gift', tier: 'A' },
];

/* ──────────────── Sidebar Codes ──────────────── */
export interface SidebarCode {
  code: string;
  reward: string;
}

// Kynseed has no active redemption codes (verified by research-agent).
export const SIDEBAR_CODES: SidebarCode[] = [
  { code: 'None', reward: 'Kynseed has no active promo codes. Check back for future events!' },
];

/* ──────────────── Footer Data ──────────────── */
export const FOOTER_DATA = {
  officialDiscordUrl: '',
  officialYoutubeUrl: '',
  communityTool: { label: 'Community', href: '' },
} as const;
