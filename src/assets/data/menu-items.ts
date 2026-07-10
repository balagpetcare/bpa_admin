import { MenuItemType } from '@/types/menu'

export interface MenuBadges {
  newInquiries?: number
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

    // ─── COMMUNICATIONS ───────────────────────────────────────────
    {
      key: 'communications',
      label: 'COMMUNICATIONS',
      isTitle: true,
    },
    {
      key: 'contact-inquiries',
      label: 'Contact Inquiries',
      icon: 'solar:inbox-unread-bold-duotone',
      url: '/contact-inquiries',
      badge: badges.newInquiries
        ? { text: String(badges.newInquiries), variant: 'danger' }
        : undefined,
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
      key: 'notifications',
      label: 'Notifications',
      icon: 'solar:bell-bing-bold-duotone',
      url: '/notifications',
    },
    {
      key: 'bpa-app-control',
      label: 'BPA App Control',
      icon: 'solar:smartphone-2-bold-duotone',
      url: '/bpa-app-control',
    },
    {
      key: 'mail-group',
      label: 'Mail',
      icon: 'solar:letter-bold-duotone',
      children: [
        {
          key: 'mail-inbox',
          label: 'Mail Inbox',
          icon: 'solar:letter-opened-bold-duotone',
          url: '/mail/inbox',
          parentKey: 'mail-group',
        },
        {
          key: 'mail-compose',
          label: 'Compose Mail',
          icon: 'solar:pen-bold-duotone',
          url: '/mail/compose',
          parentKey: 'mail-group',
        },
        {
          key: 'email-logs',
          label: 'Email Logs',
          icon: 'solar:letter-unread-bold-duotone',
          url: '/email-logs',
          parentKey: 'mail-group',
        },
        {
          key: 'mail-accounts',
          label: 'Mail Accounts',
          icon: 'solar:user-bold-duotone',
          url: '/mail/accounts',
          parentKey: 'mail-group',
        },
        {
          key: 'email-layouts',
          label: 'Email Layouts',
          icon: 'solar:widget-4-bold-duotone',
          url: '/email-layouts',
          parentKey: 'mail-group',
        },
      ],
    },
    {
      key: 'sms-group',
      label: 'SMS',
      icon: 'solar:phone-bold-duotone',
      children: [
        {
          key: 'sms-logs',
          label: 'SMS Logs',
          icon: 'solar:phone-calling-bold-duotone',
          url: '/sms-logs',
          parentKey: 'sms-group',
        },
        {
          key: 'logs-sms-alt',
          label: 'SMS Outbox',
          icon: 'solar:phone-rounded-bold-duotone',
          url: '/logs/sms',
          parentKey: 'sms-group',
        },
      ],
    },

    // ─── CAMPAIGNS ────────────────────────────────────────────────
    {
      key: 'campaigns-section',
      label: 'CAMPAIGNS',
      isTitle: true,
    },
    {
      key: 'campaign-management-group',
      label: 'Campaign Management',
      icon: 'solar:syringe-bold-duotone',
      children: [
        {
          key: 'campaigns',
          label: 'Vaccination Campaigns',
          icon: 'solar:syringe-bold-duotone',
          url: '/campaigns',
          parentKey: 'campaign-management-group',
        },
        {
          key: 'my-campaigns',
          label: 'My Assigned Campaigns',
          icon: 'solar:user-check-bold-duotone',
          url: '/my-campaigns',
          parentKey: 'campaign-management-group',
        },
        {
          key: 'campaign-analytics',
          label: 'Campaign Analytics',
          icon: 'solar:chart-2-bold-duotone',
          url: '/analytics/campaigns',
          parentKey: 'campaign-management-group',
        },
      ],
    },
    {
      key: 'field-setup-group',
      label: 'Field Setup',
      icon: 'solar:buildings-2-bold-duotone',
      children: [
        {
          key: 'doctors',
          label: 'Doctors',
          icon: 'solar:stethoscope-bold-duotone',
          url: '/doctors',
          parentKey: 'field-setup-group',
        },
        {
          key: 'pets',
          label: 'Pets & Owners',
          icon: 'solar:cat-bold-duotone',
          url: '/pets',
          parentKey: 'field-setup-group',
        },
        {
          key: 'locations',
          label: 'Locations',
          icon: 'solar:map-point-bold-duotone',
          url: '/locations',
          parentKey: 'field-setup-group',
        },
        {
          key: 'venues',
          label: 'Venues',
          icon: 'solar:buildings-2-bold-duotone',
          url: '/venues',
          parentKey: 'field-setup-group',
        },
      ],
    },

    // ─── MEMBERSHIP ───────────────────────────────────────────────
    {
      key: 'membership-title',
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
      key: 'membership-documents',
      label: 'PDF Documents',
      icon: 'solar:file-text-bold-duotone',
      url: '/community-care/membership/documents',
    },
    {
      key: 'membership-settings',
      label: 'Offer Countdown',
      icon: 'solar:clock-circle-bold-duotone',
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
      label: 'Fund Dashboard',
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
      label: 'Verification Logs',
      icon: 'solar:shield-check-bold-duotone',
      url: '/community-care/verification-logs',
    },
    {
      key: 'pet-census-group',
      label: 'Pet Census',
      icon: 'solar:cat-bold-duotone',
      children: [
        {
          key: 'pet-census',
          label: 'Pet Census',
          icon: 'solar:cat-bold-duotone',
          url: '/community-care/pet-census',
          parentKey: 'pet-census-group',
        },
        {
          key: 'pet-census-analytics',
          label: 'Pet Census Analytics',
          icon: 'solar:chart-2-bold-duotone',
          url: '/community-care/pet-census/analytics',
          parentKey: 'pet-census-group',
        },
        {
          key: 'pet-census-settings',
          label: 'Pet Census Settings',
          icon: 'solar:settings-bold-duotone',
          url: '/community-care/pet-census/settings',
          parentKey: 'pet-census-group',
        },
      ],
    },
    {
      key: 'transparency-reports',
      label: 'Transparency',
      icon: 'solar:eye-bold-duotone',
      url: '/community-care/transparency',
    },
    {
      key: 'transparency-allocation',
      label: 'Fund Allocation',
      icon: 'solar:pie-chart-bold-duotone',
      url: '/community-care/transparency-allocation',
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

    // ─── ENTERPRISE CONTENT ───────────────────────────────────────
    {
      key: 'enterprise-content',
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

    // ─── DONATIONS ────────────────────────────────────────────────
    {
      key: 'donations-title',
      label: 'DONATIONS',
      isTitle: true,
    },
    {
      key: 'donations-dashboard',
      label: 'Donation Dashboard',
      icon: 'solar:hand-money-bold-duotone',
      url: '/donations',
    },
    {
      key: 'donations-list',
      label: 'All Donations',
      icon: 'solar:dollar-minimalistic-bold-duotone',
      url: '/donations/list',
    },
    {
      key: 'donation-campaigns',
      label: 'Donation Campaigns',
      icon: 'solar:target-bold-duotone',
      url: '/donations/campaigns',
    },
    {
      key: 'donation-purposes',
      label: 'Purposes',
      icon: 'solar:heart-bold-duotone',
      url: '/donations/purposes',
    },
    {
      key: 'donation-qr-codes',
      label: 'QR Codes',
      icon: 'solar:qr-code-bold-duotone',
      url: '/donations/qr-codes',
    },
    {
      key: 'donation-impact-stories',
      label: 'Impact Stories',
      icon: 'solar:star-bold-duotone',
      url: '/donations/impact-stories',
    },
    {
      key: 'donation-transparency',
      label: 'Transparency Reports',
      icon: 'solar:eye-bold-duotone',
      url: '/donations/transparency-reports',
    },
    {
      key: 'donation-page-cms',
      label: 'Page CMS',
      icon: 'solar:pen-bold-duotone',
      url: '/donations/page-cms',
    },

    // ─── CONTENT ──────────────────────────────────────────────────
    {
      key: 'content',
      label: 'CONTENT',
      isTitle: true,
    },
    {
      key: 'website-content-group',
      label: 'Website Content',
      icon: 'solar:home-angle-bold-duotone',
      children: [
        {
          key: 'cms-homepage',
          label: 'Homepage',
          icon: 'solar:home-angle-bold-duotone',
          url: '/cms/homepage',
          parentKey: 'website-content-group',
        },
        {
          key: 'cms-news',
          label: 'News',
          icon: 'solar:document-text-bold-duotone',
          url: '/cms/news',
          parentKey: 'website-content-group',
        },
        {
          key: 'cms-events',
          label: 'Events',
          icon: 'solar:calendar-bold-duotone',
          url: '/cms/events',
          parentKey: 'website-content-group',
        },
        {
          key: 'cms-committee',
          label: 'Committee',
          icon: 'solar:users-group-two-rounded-bold-duotone',
          url: '/cms/committee',
          parentKey: 'website-content-group',
        },
        {
          key: 'cms-hero-slider',
          label: 'Hero Slider',
          icon: 'solar:slider-horizontal-bold-duotone',
          url: '/cms/hero-slider',
          parentKey: 'website-content-group',
        },
      ],
    },
    {
      key: 'content-hub-group',
      label: 'Content Hub',
      icon: 'solar:videocamera-record-bold-duotone',
      children: [
        {
          key: 'content-hub-videos',
          label: 'Videos',
          icon: 'solar:videocamera-record-bold-duotone',
          url: '/content-hub/videos',
          parentKey: 'content-hub-group',
        },
        {
          key: 'content-hub-community',
          label: 'Community Posts',
          icon: 'solar:document-text-bold-duotone',
          url: '/content-hub/community',
          parentKey: 'content-hub-group',
        },
        {
          key: 'content-hub-comments',
          label: 'Comments',
          icon: 'solar:chat-round-line-bold-duotone',
          url: '/content-hub/comments',
          parentKey: 'content-hub-group',
        },
        {
          key: 'content-hub-reports',
          label: 'Content Reports',
          icon: 'solar:danger-bold-duotone',
          url: '/content-hub/reports',
          parentKey: 'content-hub-group',
        },
        {
          key: 'content-hub-categories',
          label: 'Categories',
          icon: 'solar:folder-bold-duotone',
          url: '/content-hub/categories',
          parentKey: 'content-hub-group',
        },
        {
          key: 'content-hub-settings',
          label: 'Settings',
          icon: 'solar:settings-bold-duotone',
          url: '/content-hub/settings',
          parentKey: 'content-hub-group',
        },
      ],
    },

    // ─── USERS & ACCESS ───────────────────────────────────────────
    {
      key: 'users-access',
      label: 'USERS & ACCESS',
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
    {
      key: 'permissions',
      label: 'Permission Details',
      icon: 'solar:key-bold-duotone',
      url: '/permissions',
    },
    {
      key: 'contacts-legacy',
      label: 'Contacts (Legacy)',
      icon: 'solar:users-group-rounded-bold-duotone',
      url: '/contacts',
    },

    // ─── WEBSITE & SETTINGS ───────────────────────────────────────
    {
      key: 'website-settings',
      label: 'WEBSITE & SETTINGS',
      isTitle: true,
    },
    {
      key: 'site-settings',
      label: 'Site Settings',
      icon: 'solar:settings-bold-duotone',
      url: '/site-settings',
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
    {
      key: 'settings',
      label: 'System Settings',
      icon: 'solar:settings-minimalistic-bold-duotone',
      url: '/settings',
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
  ]
}

// Static export — only used by legacy code that imports MENU_ITEMS directly.
// Dynamic badge counts require calling getMenuItems(badges) explicitly.
export const MENU_ITEMS: MenuItemType[] = getMenuItems()
