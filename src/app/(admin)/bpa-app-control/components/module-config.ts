export const BPA_APP_CONTROL_SECTIONS = [
  {
    title: 'Overview',
    items: [{ label: 'App Dashboard', href: '/bpa-app-control/dashboard', icon: 'solar:widget-5-bold-duotone' }],
  },
  {
    title: 'Home Screen',
    items: [
      { label: 'Home Page Builder', href: '/bpa-app-control/home-page-builder', icon: 'solar:pen-bold-duotone' },
      { label: 'Banners & Sliders', href: '/bpa-app-control/banners-sliders', icon: 'solar:slider-horizontal-bold-duotone' },
      { label: 'Quick Actions', href: '/bpa-app-control/quick-actions', icon: 'solar:flash-bold-duotone' },
      { label: 'Featured Services', href: '/bpa-app-control/featured-services', icon: 'solar:star-bold-duotone' },
      { label: 'Campaign Blocks', href: '/bpa-app-control/campaign-blocks', icon: 'solar:bookmark-square-minimalistic-bold-duotone' },
      { label: 'Offers & Promotions', href: '/bpa-app-control/offers-promotions', icon: 'solar:ticket-bold-duotone' },
    ],
  },
  {
    title: 'App Content',
    items: [
      { label: 'Page CMS', href: '/bpa-app-control/page-cms', icon: 'solar:document-text-bold-duotone' },
      { label: 'App Navigation', href: '/bpa-app-control/app-navigation', icon: 'solar:compass-bold-duotone' },
      { label: 'Theme & Branding', href: '/bpa-app-control/theme-branding', icon: 'solar:palette-bold-duotone' },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { label: 'Push Notifications', href: '/bpa-app-control/push-notifications', icon: 'solar:bell-bing-bold-duotone' },
      { label: 'Popup / Notice', href: '/bpa-app-control/popup-notice', icon: 'solar:window-frame-bold-duotone' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Version Control', href: '/bpa-app-control/version-control', icon: 'solar:code-bold-duotone' },
      { label: 'Maintenance Mode', href: '/bpa-app-control/maintenance-mode', icon: 'solar:shield-warning-bold-duotone' },
      { label: 'Audit Logs', href: '/bpa-app-control/audit-logs', icon: 'solar:list-check-bold-duotone' },
    ],
  },
] as const

