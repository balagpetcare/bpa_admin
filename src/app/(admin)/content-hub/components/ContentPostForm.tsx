'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Row, Col, Form, Button } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import ReactSelect from 'react-select'
import dynamic from 'next/dynamic'
import { Icon } from '@iconify/react'
import PageHeader from '@/components/ui/PageHeader'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import MediaPickerInput from '@/components/ui/MediaPickerInput'
import { contentApi, ContentPost, Category, ContentPostType } from '@/lib/api/content.api'
import type { ApiError } from '@/lib/api'
import { buildContentPostPayload, ContentVideoSourceType, toCategoryOptions, toDateTimeLocalInputValue } from './content-post-form.helpers'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

const TOOLBAR_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    [{ align: [] }],
    ['clean'],
  ],
}

const FORMATS = ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'indent', 'blockquote', 'code-block', 'link', 'image', 'align']

interface FormValues {
  type: ContentPostType
  titleEn: string
  titleBn: string
  slug: string
  summaryEn: string
  summaryBn: string
  bodyEn: string
  bodyBn: string
  coverImageUrl: string | null
  thumbnailUrl: string | null
  videoUrl: string | null
  videoProvider: string | null
  videoSourceType: ContentVideoSourceType
  videoFileUrl: string | null
  videoFileKey: string | null
  videoPosterUrl: string | null
  durationSeconds: number | null
  status: 'draft' | 'published' | 'archived'
  categoryId: string | null
  tags: string[]
  allowComments: boolean
  showOnHomepage: boolean
  isFeatured: boolean
  isPinned: boolean
  homepagePriority: number
  ctaLabelEn: string | null
  ctaLabelBn: string | null
  ctaUrl: string | null
  ctaType: string | null
  publishedAtInput: string | null
}

interface ContentPostFormProps {
  existing?: ContentPost | null
  defaultType: ContentPostType
}

export default function ContentPostForm({ existing, defaultType }: ContentPostFormProps) {
  const router = useRouter()
  const isEdit = !!existing

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(existing?.coverImageUrl ?? null)
  const [thumbPreviewUrl, setThumbPreviewUrl] = useState<string | null>(existing?.thumbnailUrl ?? null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(existing?.videoFileUrl ?? null)
  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | null>(existing?.videoPosterUrl ?? null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      type: existing?.type ?? defaultType,
      titleEn: existing?.titleEn ?? '',
      titleBn: existing?.titleBn ?? '',
      slug: existing?.slug ?? '',
      summaryEn: existing?.summaryEn ?? '',
      summaryBn: existing?.summaryBn ?? '',
      bodyEn: existing?.bodyEn ?? '',
      bodyBn: existing?.bodyBn ?? '',
      coverImageUrl: existing?.coverImageUrl ?? null,
      thumbnailUrl: existing?.thumbnailUrl ?? null,
      videoUrl: existing?.videoUrl ?? null,
      videoProvider: existing?.videoProvider ?? 'youtube',
      videoSourceType: existing?.videoSourceType ?? 'youtube',
      videoFileUrl: existing?.videoFileUrl ?? null,
      videoFileKey: existing?.videoFileKey ?? null,
      videoPosterUrl: existing?.videoPosterUrl ?? null,
      durationSeconds: existing?.durationSeconds ?? null,
      status: existing?.status ?? 'draft',
      categoryId: existing?.categoryId ?? null,
      tags: existing?.tags ?? [],
      allowComments: existing?.allowComments ?? true,
      showOnHomepage: existing?.showOnHomepage ?? true,
      isFeatured: existing?.isFeatured ?? false,
      isPinned: existing?.isPinned ?? false,
      homepagePriority: existing?.homepagePriority ?? 0,
      ctaLabelEn: existing?.ctaLabelEn ?? '',
      ctaLabelBn: existing?.ctaLabelBn ?? '',
      ctaUrl: existing?.ctaUrl ?? '',
      ctaType: existing?.ctaType ?? 'primary',
      publishedAtInput: toDateTimeLocalInputValue(existing?.publishedAt),
    },
  })

  const typeValue = watch('type')
  const titleEnValue = watch('titleEn')
  const slugValue = watch('slug')
  const bodyEnValue = watch('bodyEn')
  const bodyBnValue = watch('bodyBn')
  const tagValue = watch('tags')
  const videoSourceTypeValue = watch('videoSourceType')

  // Load categories
  useEffect(() => {
    contentApi
      .listCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoadingCats(false))
  }, [])

  // Auto-slug
  useEffect(() => {
    if (!isEdit && titleEnValue && !slugValue) {
      const generated = titleEnValue
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      setValue('slug', generated)
    }
  }, [titleEnValue, isEdit, slugValue, setValue])

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    setError(null)
    try {
      const payload = buildContentPostPayload(values, {
        existingPublishedAt: existing?.publishedAt ?? null,
      })

      if (isEdit) {
        await contentApi.updatePost(existing!.id, payload)
      } else {
        await contentApi.createPost(payload)
      }

      router.push(typeValue === 'VIDEO' ? '/content-hub/videos' : '/content-hub/community')
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setSubmitting(false)
    }
  }

  const categoryOptions = toCategoryOptions(categories)

  return (
    <div className="container-fluid py-4">
      <div className="mb-3 d-flex align-items-center gap-2">
        <Button variant="light" size="sm" onClick={() => router.push(defaultType === 'VIDEO' ? '/content-hub/videos' : '/content-hub/community')}>
          ← Back
        </Button>
        <h4 className="mb-0">{isEdit ? `Edit: ${existing!.titleEn}` : `New ${defaultType === 'VIDEO' ? 'Video' : 'Community Post'}`}</h4>
      </div>

      <ApiErrorAlert error={error} onDismiss={() => setError(null)} />

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          {/* Main Column */}
          <Col lg={8} className="space-y-4">
            <Card className="mb-4">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Title (English)</Form.Label>
                  <Form.Control type="text" required {...register('titleEn', { required: true })} placeholder="Enter English title..." />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Title (Bengali)</Form.Label>
                  <Form.Control type="text" required {...register('titleBn', { required: true })} placeholder="Enter Bengali title..." />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Slug</Form.Label>
                  <Form.Control type="text" required {...register('slug', { required: true })} placeholder="e.g. video-how-to-vaccinate" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Summary (English)</Form.Label>
                  <Form.Control as="textarea" rows={2} {...register('summaryEn')} placeholder="Brief description for search listings..." />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Summary (Bengali)</Form.Label>
                  <Form.Control as="textarea" rows={2} {...register('summaryBn')} placeholder="সংক্ষিপ্ত বিবরণ..." />
                </Form.Group>

                {/* Rich text editors */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Body Content (English)</Form.Label>
                  <div className="bg-white">
                    <ReactQuill
                      theme="snow"
                      value={bodyEnValue}
                      onChange={(html) => setValue('bodyEn', html)}
                      modules={TOOLBAR_MODULES}
                      formats={FORMATS}
                      style={{ minHeight: 250 }}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Body Content (Bengali)</Form.Label>
                  <div className="bg-white">
                    <ReactQuill
                      theme="snow"
                      value={bodyBnValue}
                      onChange={(html) => setValue('bodyBn', html)}
                      modules={TOOLBAR_MODULES}
                      formats={FORMATS}
                      style={{ minHeight: 250 }}
                    />
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Video specifics */}
            {defaultType === 'VIDEO' && (
              <Card className="mb-4">
                <Card.Header className="bg-light fw-bold">Video Details</Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold d-block">Video Source Type</Form.Label>
                    <Form.Check
                      inline
                      label="YouTube"
                      type="radio"
                      id="source-youtube"
                      value="youtube"
                      checked={videoSourceTypeValue === 'youtube'}
                      onChange={() => setValue('videoSourceType', 'youtube')}
                    />
                    <Form.Check
                      inline
                      label="Vimeo"
                      type="radio"
                      id="source-vimeo"
                      value="vimeo"
                      checked={videoSourceTypeValue === 'vimeo'}
                      onChange={() => setValue('videoSourceType', 'vimeo')}
                    />
                    <Form.Check
                      inline
                      label="Upload Video File"
                      type="radio"
                      id="source-upload"
                      value="upload"
                      checked={videoSourceTypeValue === 'upload'}
                      onChange={() => setValue('videoSourceType', 'upload')}
                    />
                  </Form.Group>

                  {videoSourceTypeValue === 'youtube' || videoSourceTypeValue === 'vimeo' ? (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          {videoSourceTypeValue === 'youtube' ? 'YouTube URL or Video ID' : 'Vimeo URL or Video ID'}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          {...register('videoUrl')}
                          placeholder={
                            videoSourceTypeValue === 'youtube'
                              ? 'e.g. https://www.youtube.com/watch?v=... or dQw4w9WgXcQ'
                              : 'e.g. https://vimeo.com/148751763 or 148751763'
                          }
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Video Provider</Form.Label>
                        <Form.Control type="text" value={videoSourceTypeValue === 'youtube' ? 'YouTube' : 'Vimeo'} disabled readOnly />
                      </Form.Group>
                    </>
                  ) : (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Upload Video File</Form.Label>
                        <MediaPickerInput
                          value={watch('videoFileKey') || ''}
                          previewUrl={videoPreviewUrl}
                          previewMimeType="video/mp4"
                          mimeTypePrefix="video/"
                          accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                          onChange={(id, file: any) => {
                            setValue('videoFileKey', id ?? null)
                            setValue('videoFileUrl', file?.url ?? null)
                            setVideoPreviewUrl(file?.url ?? null)
                          }}
                          helpText="For best performance, upload MP4 H.264 video under 200MB."
                          emptyLabel="Select/Upload Video"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Video Poster / Thumbnail</Form.Label>
                        <MediaPickerInput
                          value={watch('videoPosterUrl') || ''}
                          previewUrl={posterPreviewUrl}
                          mimeTypePrefix="image/"
                          accept="image/*"
                          onChange={(id, file: any) => {
                            setValue('videoPosterUrl', file?.url ?? null)
                            setPosterPreviewUrl(file?.url ?? null)
                          }}
                          helpText="Optional poster image shown before video starts playing."
                          emptyLabel="Select Video Poster"
                        />
                      </Form.Group>
                    </>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Duration (seconds)</Form.Label>
                    <Form.Control type="number" min={1} {...register('durationSeconds', { valueAsNumber: true })} placeholder="e.g. 185" />
                  </Form.Group>
                </Card.Body>
              </Card>
            )}

            {/* CTA Panel */}
            <Card className="mb-4">
              <Card.Header className="bg-light fw-bold">Call to Action (CTA) Button</Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">CTA Button Link</Form.Label>
                      <Form.Control type="text" {...register('ctaUrl')} placeholder="e.g. /community-pet-care/contribute" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">CTA Button Style</Form.Label>
                      <Form.Select {...register('ctaType')}>
                        <option value="primary">Primary Green</option>
                        <option value="secondary">Secondary White</option>
                        <option value="none">Disabled</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">CTA Button Label (English)</Form.Label>
                      <Form.Control type="text" {...register('ctaLabelEn')} placeholder="e.g. Register Your Pet" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">CTA Button Label (Bengali)</Form.Label>
                      <Form.Control type="text" {...register('ctaLabelBn')} placeholder="e.g. রেজিষ্ট্রেশন করুন" />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar Panel */}
          <Col lg={4} className="space-y-4">
            <Card className="mb-4">
              <Card.Header className="bg-light fw-bold">Publish Settings</Card.Header>
              <Card.Body className="space-y-3">
                {defaultType !== 'VIDEO' && (
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Post Type</Form.Label>
                    <Form.Select {...register('type')}>
                      <option value="COMMUNITY_POST">Community Post</option>
                      <option value="ANNOUNCEMENT">Announcement</option>
                      <option value="DONATION_STORY">Donation Story</option>
                      <option value="CAMPAIGN_UPDATE">Campaign Update</option>
                      <option value="PET_CARE_TIP">Pet Care Tip</option>
                    </Form.Select>
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Status</Form.Label>
                  <Form.Select {...register('status')}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Publish Date & Time</Form.Label>
                  <Form.Control type="datetime-local" {...register('publishedAtInput')} />
                  <Form.Text className="text-muted">Leave blank to publish immediately when status is Published.</Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="show-homepage-switch"
                    label="Show on Homepage"
                    {...register('showOnHomepage')}
                    className="fw-semibold"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check type="switch" id="featured-switch" label="Mark as Featured" {...register('isFeatured')} className="fw-semibold" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check type="switch" id="pinned-switch" label="Pin to Top" {...register('isPinned')} className="fw-semibold" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check type="switch" id="comments-switch" label="Allow User Comments" {...register('allowComments')} className="fw-semibold" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Homepage Priority Order</Form.Label>
                  <Form.Control type="number" {...register('homepagePriority')} placeholder="0" />
                  <Form.Text className="text-muted">Higher values show first in listings.</Form.Text>
                </Form.Group>

                <Button type="submit" variant="primary" className="w-full mt-3" disabled={submitting}>
                  <Icon icon="solar:diskette-bold" className="me-1" />
                  {submitting ? 'Saving...' : 'Save Content'}
                </Button>

                {isEdit && defaultType === 'VIDEO' && (
                  <Button
                    type="button"
                    variant="outline-secondary"
                    className="w-full mt-2"
                    onClick={() => router.push(`/content-hub/videos/${existing!.id}/preview`)}>
                    <Icon icon="solar:eye-bold" className="me-1" />
                    Preview Video
                  </Button>
                )}
              </Card.Body>
            </Card>

            {/* Category selection */}
            <Card className="mb-4">
              <Card.Header className="bg-light fw-bold">Category</Card.Header>
              <Card.Body>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <ReactSelect
                      isClearable
                      options={categoryOptions}
                      value={categoryOptions.find((o) => o.value === field.value) ?? null}
                      onChange={(opt) => field.onChange(opt?.value ?? null)}
                      classNamePrefix="react-select"
                      placeholder="Select category…"
                      isLoading={loadingCats}
                    />
                  )}
                />
              </Card.Body>
            </Card>

            {/* Media cover image picker */}
            <Card className="mb-4">
              <Card.Header className="bg-light fw-bold">Cover Image</Card.Header>
              <Card.Body>
                <MediaPickerInput
                  value={watch('coverImageUrl') || ''}
                  previewUrl={coverPreviewUrl}
                  onChange={(id, file: any) => {
                    setValue('coverImageUrl', file?.url ?? null)
                    setCoverPreviewUrl(file?.url ?? null)
                  }}
                  helpText="Shows as listing thumbnail and header banner"
                />
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header className="bg-light fw-bold">Tags</Card.Header>
              <Card.Body>
                <Form.Control
                  type="text"
                  placeholder="Comma separated: tips, cats, vaccines"
                  value={tagValue.join(', ')}
                  onChange={(e) => {
                    const arr = e.target.value
                      .split(',')
                      .map((x) => x.trim())
                      .filter(Boolean)
                    setValue('tags', arr)
                  }}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}
