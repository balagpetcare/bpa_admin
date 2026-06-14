/**
 * Shared utility for resolving media URLs consistently across the admin panel.
 */
export function getMediaImageUrl(media: any): string {
  if (!media) return 'https://placehold.co/600x400?text=No+Media';

  // If it's a MediaFile object directly
  if (typeof media === 'object' && media.url) {
    return media.url;
  }

  // If it's a CampaignMedia object (contains mediaFile)
  if (typeof media === 'object' && media.mediaFile?.url) {
    return media.mediaFile.url;
  }

  // Fallback for campaign objects that might have coverImage
  if (typeof media === 'object' && media.coverImage?.url) {
    return media.coverImage.url;
  }

  // If it's a string, assume it's already a URL or a path
  if (typeof media === 'string') {
    if (media.startsWith('http') || media.startsWith('/')) {
      return media;
    }
  }

  return 'https://placehold.co/600x400?text=Invalid+Media';
}
