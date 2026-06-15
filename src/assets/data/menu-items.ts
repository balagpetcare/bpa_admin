import { MenuItemType } from '@/types/menu'

export interface MenuBadges {
  unreadContacts?: number
  pendingVolunteers?: number
}

export function getMenuItems(badges: MenuBadges = {}): MenuItemType[] {
  return [
    // ─── GENERAL ──────────────────────────────────────────────────
    {
      key: 'general',
      label: 'GENERAL',
      isTitle: true,
    },
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'solar:widget-5-bold-duotone',
      url: '/dashboard',
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: 'solar:graph-new-bold-duotone',
      url: '/analytics',
    },

    // ─── CONTENT ──────────────────────────────────────────────────
    {
      key: 'content',
      label: 'CONTENT',
      isTitle: true,
    },
    {
      key: 'cms-homepage',
      label: 'Homepage CMS',
      icon: 'solar:home-angle-bold-duotone',
      url: '/cms/homepage',
    },
    {
      key: 'cms-news',
      label: 'News CMS',
      icon: 'solar:document-text-bold-duotone',
      url: '/cms/news',
    },
    {
      key: 'cms-events',
      label: 'Event CMS',
      icon: 'solar:calendar-bold-duotone',
      url: '/cms/events',
    },
    {
      key: 'cms-committee',
      label: 'Committee CMS',
      icon: 'solar:users-group-two-rounded-bold-duotone',
      url: '/cms/committee',
    },
    {
      key: 'cms-hero-slider',
      label: 'Hero Slider CMS',
      icon: 'solar:slider-horizontal-bold-duotone',
      url: '/cms/hero-slider',
    },

    // ─── COMMUNITY ────────────────────────────────────────────────
    {
      key: 'community',
      label: 'COMMUNITY',
      isTitle: true,
    },
    {
      key: 'members',
      label: 'Members',
      icon: 'solar:card-bold-duotone',
      url: '/members',
    },
    {
      key: 'volunteers',
      label: 'Volunteers',
      icon: 'solar:hand-heart-bold-duotone',
      url: '/volunteers',
      badge: badges.pendingVolunteers
        ? { text: String(badges.pendingVolunteers), variant: 'warning' }
        : undefined,
    },
    {
      key: 'contacts',
      label: 'Contacts',
      icon: 'solar:letter-bold-duotone',
      url: '/contacts',
      badge: badges.unreadContacts
        ? { text: String(badges.unreadContacts), variant: 'danger' }
        : undefined,
    },

    // ─── ADMINISTRATION ───────────────────────────────────────────
    {
      key: 'administration',
      label: 'ADMINISTRATION',
      isTitle: true,
    },
    {
      key: 'users',
      label: 'Users',
      icon: 'solar:user-bold-duotone',
      url: '/users',
    },
    {
      key: 'roles',
      label: 'Roles & Permissions',
      icon: 'solar:shield-bold-duotone',
      url: '/roles',
    },

    // ─── ASSETS & CONFIG ──────────────────────────────────────────
    {
      key: 'assets',
      label: 'ASSETS & CONFIG',
      isTitle: true,
    },
    {
      key: 'media',
      label: 'Media Library',
      icon: 'solar:gallery-bold-duotone',
      url: '/media',
    },
    {
      key: 'seo',
      label: 'SEO Management',
      icon: 'solar:chart-bold-duotone',
      url: '/seo',
    },

    // ─── CAMPAIGNS ────────────────────────────────────────────────
    {
      key: 'campaigns-section',
      label: 'CAMPAIGNS',
      isTitle: true,
    },
    {
      key: 'campaigns',
      label: 'Campaigns',
      icon: 'solar:syringe-bold-duotone',
      url: '/campaigns',
    },
    {
      key: 'doctors',
      label: 'Doctors',
      icon: 'solar:stethoscope-bold-duotone',
      url: '/doctors',
    },
    {
      key: 'pets',
      label: 'Pets & Owners',
      icon: 'solar:cat-bold-duotone',
      url: '/pets',
    },
    {
      key: 'locations',
      label: 'Locations',
      icon: 'solar:map-point-bold-duotone',
      url: '/locations',
    },

    // ─── COMMUNITY CARE MEMBERSHIP ────────────────────────────────
    {
      key: 'community-care-membership-title',
      label: 'MEMBERSHIP',
      isTitle: true,
    },
    {
      key: 'membership-dashboard',
      label: 'Membership Dashboard',
      icon: 'solar:card-bold-duotone',
      url: '/community-care/membership',
    },
    {
      key: 'membership-tiers',
      label: 'Tiers & Pricing',
      icon: 'solar:tag-price-bold-duotone',
      url: '/community-care/membership/tiers',
    },
    {
      key: 'membership-services',
      label: 'Services & Discounts',
      icon: 'solar:test-tube-bold-duotone',
      url: '/community-care/membership/services',
    },
    {
      key: 'membership-benefits',
      label: 'Benefits',
      icon: 'solar:gift-bold-duotone',
      url: '/community-care/membership/benefits',
    },
    {
      key: 'membership-purchases',
      label: 'Purchases',
      icon: 'solar:cart-bold-duotone',
      url: '/community-care/membership/purchases',
    },
    {
      key: 'membership-upgrades',
      label: 'Upgrade Requests',
      icon: 'solar:arrow-up-bold-duotone',
      url: '/community-care/membership/upgrades',
    },
    {
      key: 'membership-documents',
      label: 'PDF Documents',
      icon: 'solar:file-text-bold-duotone',
      url: '/community-care/membership/documents',
    },
    {
      key: 'membership-settings',
      label: 'Offer Countdown',
      icon: 'solar:clock-bold-duotone',
      url: '/community-care/membership/settings',
    },

    // ─── COMMUNITY CARE FUND ──────────────────────────────────────
    {
      key: 'community-care-fund',
      label: 'COMMUNITY CARE FUND',
      isTitle: true,
    },
    {
      key: 'community-care-dashboard',
      label: 'Care Fund Dashboard',
      icon: 'solar:hand-money-bold-duotone',
      url: '/community-care/dashboard',
    },
    {
      key: 'community-zones',
      label: 'Zones',
      icon: 'solar:map-point-wave-bold-duotone',
      url: '/community-care/zones',
    },
    {
      key: 'zone-demand',
      label: 'Clinic Priority',
      icon: 'solar:ranking-bold-duotone',
      url: '/community-care/zone-demand',
    },
    {
      key: 'contribution-plans',
      label: 'Plans',
      icon: 'solar:tag-price-bold-duotone',
      url: '/community-care/plans',
    },
    {
      key: 'care-contributions',
      label: 'Contributors',
      icon: 'solar:users-group-rounded-bold-duotone',
      url: '/community-care/contributors',
    },
    {
      key: 'care-partner-cards',
      label: 'Partner Cards',
      icon: 'solar:card-2-bold-duotone',
      url: '/community-care/cards',
    },
    {
      key: 'card-verification-logs',
      label: 'Verif. Logs',
      icon: 'solar:shield-check-bold-duotone',
      url: '/community-care/verification-logs',
    },
    {
      key: 'pet-census',
      label: 'Pet Census',
      icon: 'solar:cat-bold-duotone',
      url: '/community-care/pet-census',
    },
    {
      key: 'pet-census-analytics',
      label: 'Pet Census Analytics',
      icon: 'solar:chart-2-bold-duotone',
      url: '/community-care/pet-census/analytics',
    },
    {
      key: 'pet-census-settings',
      label: 'Pet Census Settings',
      icon: 'solar:settings-bold-duotone',
      url: '/community-care/pet-census/settings',
    },
    {
      key: 'transparency-reports',
      label: 'Transparency',
      icon: 'solar:eye-bold-duotone',
      url: '/community-care/transparency',
    },
    {
      key: 'pet-smart-solution',
      label: 'Pet Smart Solution',
      icon: 'solar:settings-bold-duotone',
      url: '/community-care/pet-smart-solution',
    },
    {
      key: 'sync-logs',
      label: 'Sync Logs',
      icon: 'solar:refresh-bold-duotone',
      url: '/community-care/sync-logs',
    },

    // ─── COMMUNITY CARE — ENTERPRISE CONTENT ─────────────────────
    {
      key: 'community-care-enterprise',
      label: 'ENTERPRISE CONTENT',
      isTitle: true,
    },
    {
      key: 'care-partner-benefits',
      label: 'Care Partner Benefits',
      icon: 'solar:gift-bold-duotone',
      url: '/community-care/care-partner-benefits',
    },
    {
      key: 'social-impact-programs',
      label: 'Social Impact Programs',
      icon: 'solar:heart-pulse-bold-duotone',
      url: '/community-care/social-impact-programs',
    },
    {
      key: 'diagnostic-center-services',
      label: 'Diagnostic Services',
      icon: 'solar:test-tube-bold-duotone',
      url: '/community-care/diagnostic-center-services',
    },
    {
      key: 'roadmap',
      label: 'Future Roadmap',
      icon: 'solar:map-arrow-right-bold-duotone',
      url: '/community-care/roadmap',
    },
    {
      key: 'transparency-allocation',
      label: 'Fund Allocation',
      icon: 'solar:pie-chart-bold-duotone',
      url: '/community-care/transparency-allocation',
    },

    // ─── SETTINGS ─────────────────────────────────────────────────
    {
      key: 'settings-title',
      label: 'SETTINGS',
      isTitle: true,
    },
    {
      key: 'site-settings',
      label: 'Site Settings',
      icon: 'solar:settings-bold-duotone',
      url: '/site-settings',
    },

    // ─── PAYMENTS & LOGS ──────────────────────────────────────────
    {
      key: 'payments-logs',
      label: 'PAYMENTS & LOGS',
      isTitle: true,
    },
    {
      key: 'payments',
      label: 'Payments',
      icon: 'solar:wallet-bold-duotone',
      url: '/payments',
    },
    {
      key: 'logs-sms',
      label: 'SMS Logs',
      icon: 'solar:phone-bold-duotone',
      url: '/logs/sms',
    },
    {
      key: 'logs-email',
      label: 'Email Logs',
      icon: 'solar:letter-opened-bold-duotone',
      url: '/logs/email',
    },
  ]
}

// Static export for backward compatibility with template components that import MENU_ITEMS directly
export const MENU_ITEMS: MenuItemType[] = getMenuItems()
