import {
  BookOpen, Swords, Wheat, Store, Heart, Hammer, Skull, Scroll, Radio,
  Sparkles, Users, Gamepad2, Coins,
  type LucideIcon,
} from 'lucide-react';

export interface StatConfig {
  val: string;
  labelKey: string;
}

export interface ModuleCardConfig {
  key: string;
  labelKey: string;
  titleKey: string;
  descKey: string;
  href: string;
  stats: StatConfig[];
  icon: LucideIcon;
  ctaKey?: string;
}

export interface GameFeatureConfig {
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
}

export interface StartHereStepConfig {
  titleKey: string;
  descKey: string;
  href: string;
}

export interface HeroCtaConfig {
  labelKey: string;
  href: string;
  style: 'primary' | 'secondary';
}

export const HOME_CONFIG = {
  hero: {
    // Official Kynseed trailer
    videoId: 'hcPWS06NSMM', // Kynseed gameplay video
    badgeKeys: [
      'home_hero_badge_release',
      'home_hero_badge_reviews',
      'home_hero_badge_developer',
      'home_hero_badge_version',
      'home_hero_badge_features',
    ],
    ctas: [
      { labelKey: 'home_hero_cta_beginner', href: '/guides', style: 'primary' as const },
      { labelKey: 'home_hero_cta_business', href: '/business', style: 'secondary' as const },
      { labelKey: 'home_hero_cta_guides', href: '/guides', style: 'secondary' as const },
    ],
  },

  moduleCards: [
    { key: 'guides', labelKey: 'home_module_guides', titleKey: 'home_module_guides_title', descKey: 'home_module_guides_desc', href: '/guides', stats: [{ val: '5', labelKey: 'home_module_guides_stat1' }, { val: 'Steps', labelKey: 'home_module_guides_stat2' }], icon: BookOpen, ctaKey: 'home_module_guides_cta' },
    { key: 'combat', labelKey: 'home_module_combat', titleKey: 'home_module_combat_title', descKey: 'home_module_combat_desc', href: '/combat', stats: [{ val: '3', labelKey: 'home_module_combat_stat1' }, { val: 'Styles', labelKey: 'home_module_combat_stat2' }], icon: Swords, ctaKey: 'home_module_combat_cta' },
    { key: 'farming', labelKey: 'home_module_farming', titleKey: 'home_module_farming_title', descKey: 'home_module_farming_desc', href: '/farming', stats: [{ val: '4', labelKey: 'home_module_farming_stat1' }, { val: 'Seasons', labelKey: 'home_module_farming_stat2' }], icon: Wheat, ctaKey: 'home_module_farming_cta' },
    { key: 'business', labelKey: 'home_module_business', titleKey: 'home_module_business_title', descKey: 'home_module_business_desc', href: '/business', stats: [{ val: '4', labelKey: 'home_module_business_stat1' }, { val: 'Types', labelKey: 'home_module_business_stat2' }], icon: Store, ctaKey: 'home_module_business_cta' },
    { key: 'relationships', labelKey: 'home_module_relationships', titleKey: 'home_module_relationships_title', descKey: 'home_module_relationships_desc', href: '/relationships', stats: [{ val: 'NPCs', labelKey: 'home_module_relationships_stat1' }, { val: 'Family', labelKey: 'home_module_relationships_stat2' }], icon: Heart, ctaKey: 'home_module_relationships_cta' },
    { key: 'crafting', labelKey: 'home_module_crafting', titleKey: 'home_module_crafting_title', descKey: 'home_module_crafting_desc', href: '/crafting', stats: [{ val: 'Stations', labelKey: 'home_module_crafting_stat1' }, { val: 'Recipes', labelKey: 'home_module_crafting_stat2' }], icon: Hammer, ctaKey: 'home_module_crafting_cta' },
    { key: 'dungeons', labelKey: 'home_module_dungeons', titleKey: 'home_module_dungeons_title', descKey: 'home_module_dungeons_desc', href: '/dungeons', stats: [{ val: 'Loot', labelKey: 'home_module_dungeons_stat1' }, { val: 'Bosses', labelKey: 'home_module_dungeons_stat2' }], icon: Skull, ctaKey: 'home_module_dungeons_cta' },
    { key: 'lore', labelKey: 'home_module_lore', titleKey: 'home_module_lore_title', descKey: 'home_module_lore_desc', href: '/lore', stats: [{ val: 'World', labelKey: 'home_module_lore_stat1' }, { val: 'Story', labelKey: 'home_module_lore_stat2' }], icon: Scroll, ctaKey: 'home_module_lore_cta' },
    { key: 'updates', labelKey: 'home_module_updates', titleKey: 'home_module_updates_title', descKey: 'home_module_updates_desc', href: '/updates', stats: [{ val: 'Latest', labelKey: 'home_module_updates_stat1' }, { val: 'Patches', labelKey: 'home_module_updates_stat2' }], icon: Radio, ctaKey: 'home_module_updates_cta' },
  ] as ModuleCardConfig[],

  gameFeatures: [
    { titleKey: 'home_feature_lifecycle_title', descKey: 'home_feature_lifecycle_desc', icon: Sparkles },
    { titleKey: 'home_feature_farming_title', descKey: 'home_feature_farming_desc', icon: Wheat },
    { titleKey: 'home_feature_combat_title', descKey: 'home_feature_combat_desc', icon: Swords },
    { titleKey: 'home_feature_business_title', descKey: 'home_feature_business_desc', icon: Coins },
  ] as GameFeatureConfig[],

  startHereSteps: [
    { titleKey: 'home_start_1_title', descKey: 'home_start_1_desc', href: '/guides' },
    { titleKey: 'home_start_2_title', descKey: 'home_start_2_desc', href: '/combat' },
    { titleKey: 'home_start_3_title', descKey: 'home_start_3_desc', href: '/business' },
    { titleKey: 'home_start_4_title', descKey: 'home_start_4_desc', href: '/relationships' },
    { titleKey: 'home_start_5_title', descKey: 'home_start_5_desc', href: '/crafting' },
  ] as StartHereStepConfig[],

  gameOverview: {
    infoItems: ['developer', 'publisher', 'platform', 'genre', 'release', 'reviews', 'artstyle'],
    cta: {
      guideLabelKey: 'home_about_cta',
      guideHref: '/guides',
      externalLabelKey: 'home_cta_steam',
      externalLinkKey: 'steam',
    },
  },

  faq: {
    keys: ['whatIsKynseed', 'lifeCycle', 'combatSystem', 'businessTypes', 'familyLegacy', 'dungeons'],
  },

  bottomCta: {
    guideHref: '/guides',
    guideLabelKey: 'home_cta_guide',
    externalLinkKey: 'steam',
    externalLabelKey: 'home_cta_steam',
  },
};
