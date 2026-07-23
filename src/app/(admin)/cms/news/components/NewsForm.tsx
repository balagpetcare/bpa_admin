'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Row, Col, Form, Button } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import ReactSelect from 'react-select'
import TextFormInput from '@/components/form/TextFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import MediaPickerInput from '@/components/ui/MediaPickerInput'
import NewsSlugInput, { toSlug } from './NewsSlugInput'
import NewsBodyEditor from './NewsBodyEditor'
import NewsPublishPanel from './NewsPublishPanel'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { newsApi } from '@/lib/api/news.api'
import type { NewsDetail, NewsStatus, MediaFile } from '@/types/bpa.types'
import type { ApiError } from '@/lib/api'

const schema = yup.object({
  title: yup.string().required('Title is required').max(255),
  slug: yup.string().required('Slug is required').max(255),
  excerpt: yup.string().nullable().optional(),
  body: yup.string().required('Body is required'),
  categoryId: yup.string().nullable().optional(),
  tagIds: yup.array(yup.string().required()).default([]),
  coverImageId: yup.string().nullable().optional(),
  isFeatured: yup.boolean().default(false),
  status: yup.string().oneOf(['draft', 'published', 'archived']).default('draft') as unknown as yup.StringSchema<NewsStatus>,
  publishedAt: yup.string().nullable().optional(),
})

type FormValues = yup.InferType<typeof schema>

interface NewsFormProps {
  existing?: NewsDetail | null
}

export default function NewsForm({ existing }: NewsFormProps) {
  const router = useRouter()
  const isEdit = !!existing

  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(existing?.coverImageUrl ?? null)

  const { data: categories } = useApi(() => newsApi.listCategories(), [])
  const { data: tags } = useApi(() => newsApi.listTags(), [])
  const { mutate, loading, error, clearError } = useApiMutation<NewsDetail, FormValues>()

  const categoryOptions = (categories ?? []).map((c) => ({ value: c.id, label: c.name }))
  const tagOptions = (tags ?? []).map((t) => ({ value: t.id, label: t.name }))

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema as any),
    defaultValues: {
      title: existing?.title ?? '',
      slug: existing?.slug ?? '',
      excerpt: existing?.excerpt ?? '',
      body: existing?.body ?? '',
      categoryId: existing?.category?.id ?? null,
      tagIds: existing?.tags?.map((t) => t.id) ?? [],
      coverImageId: null,
      isFeatured: existing?.isFeatured ?? false,
      status: existing?.status ?? 'draft',
      publishedAt: existing?.publishedAt ?? null,
    },
  })

  const titleValue = watch('title')
  const slugValue = watch('slug')
  const bodyValue = watch('body')
  const statusValue = watch('status')
  const publishedAtValue = watch('publishedAt')
  const isFeaturedValue = watch('isFeatured')
  const tagIdsValue = watch('tagIds')

  // Auto-slug from title when slug is empty
  useEffect(() => {
    if (!isEdit && titleValue && !slugValue) {
      setValue('slug', toSlug(titleValue))
    }
  }, [titleValue, isEdit, slugValue, setValue])

  const saveWith = async (overrideStatus?: NewsStatus) => {
    await handleSubmit(async (values) => {
      const finalValues = overrideStatus ? { ...values, status: overrideStatus } : values
      const result = await mutate(async (vals) => {
        if (isEdit) {
          const updated = await newsApi.update(existing!.id, {
            title: vals.title,
            slug: vals.slug,
            excerpt: vals.excerpt ?? undefined,
            body: vals.body,
            categoryId: vals.categoryId ?? null,
            tagIds: vals.tagIds,
            coverImageId: vals.coverImageId ?? null,
            isFeatured: vals.isFeatured,
          })
          // If status changed, call publish endpoint
          if (vals.status !== existing!.status) {
            return newsApi.publish(existing!.id, { status: vals.status })
          }
          return updated
        }
        const created = await newsApi.create({
          title: vals.title,
          slug: vals.slug,
          excerpt: vals.excerpt ?? undefined,
          body: vals.body,
          categoryId: vals.categoryId ?? null,
          tagIds: vals.tagIds,
          coverImageId: vals.coverImageId ?? null,
          isFeatured: vals.isFeatured,
        })
        if (vals.status === 'published') {
          return newsApi.publish(created.id, { status: 'published' })
        }
        return created
      }, finalValues)
      if (result) router.push('/cms/news')
    })()
  }

  return (
    <div className="container-fluid">
      <div className="mb-3 d-flex align-items-center gap-2">
        <Button variant="light" size="sm" onClick={() => router.push('/cms/news')}>
          ← Back to News
        </Button>
        <h5 className="mb-0">{isEdit ? `Edit: ${existing!.title}` : 'New Article'}</h5>
      </div>

      <ApiErrorAlert error={error as ApiError | null} onDismiss={clearError} />

      <Row>
        {/* Main content */}
        <Col lg={8}>
          <Card className="mb-3">
            <Card.Body>
              <TextFormInput name="title" label="Title" placeholder="Enter article title" containerClassName="mb-3" control={control} />

              <NewsSlugInput value={slugValue} onChange={(s) => setValue('slug', s)} title={titleValue} />

              <TextAreaFormInput
                name="excerpt"
                label="Excerpt (optional)"
                placeholder="Short summary shown in listings…"
                rows={3}
                containerClassName="mb-3"
                control={control}
              />

              <NewsBodyEditor value={bodyValue} onChange={(html) => setValue('body', html)} error={errors.body?.message} />
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          <NewsPublishPanel
            status={statusValue}
            publishedAt={publishedAtValue ?? null}
            isFeatured={isFeaturedValue ?? false}
            onStatusChange={(s) => setValue('status', s)}
            onPublishedAtChange={(d) => setValue('publishedAt', d)}
            onFeaturedChange={(v) => setValue('isFeatured', v)}
            onSaveDraft={() => saveWith('draft')}
            onPublish={() => saveWith(statusValue === 'published' ? 'published' : 'published')}
            onArchive={isEdit ? () => saveWith('archived') : undefined}
            saving={loading}
            isEdit={isEdit}
          />

          <Card className="mb-3">
            <Card.Header className="py-2">
              <h6 className="mb-0">Cover Image</h6>
            </Card.Header>
            <Card.Body>
              <MediaPickerInput
                value={watch('coverImageId')}
                previewUrl={coverImageUrl}
                onChange={(id, file) => {
                  setValue('coverImageId', id)
                  setCoverImageUrl((file as MediaFile | null)?.url ?? null)
                }}
                helpText="Recommended: 1200×630px"
              />
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="py-2">
              <h6 className="mb-0">Category</h6>
            </Card.Header>
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
                  />
                )}
              />
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="py-2">
              <h6 className="mb-0">Tags</h6>
            </Card.Header>
            <Card.Body>
              <ReactSelect
                isMulti
                options={tagOptions}
                value={tagOptions.filter((o) => (tagIdsValue ?? []).includes(o.value))}
                onChange={(opts) =>
                  setValue(
                    'tagIds',
                    opts.map((o) => o.value),
                  )
                }
                classNamePrefix="react-select"
                placeholder="Select tags…"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
