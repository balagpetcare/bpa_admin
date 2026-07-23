'use client'

import { useCallback, useState } from 'react'
import { Alert, Table } from 'react-bootstrap'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import EmptyState from '@/components/ui/EmptyState'
import { heroSliderApi } from '@/lib/api/hero-slider.api'
import type { HeroSlideListItem } from '@/types/bpa.types'
import HeroSliderSortableRow from './HeroSliderSortableRow'

interface HeroSliderSortableTableProps {
  data: HeroSlideListItem[]
  loading: boolean
  onDeleted: (slide: HeroSlideListItem) => void
  onToggled: (slide: HeroSlideListItem, isActive: boolean) => void
  onReordered: (items: HeroSlideListItem[]) => void
}

export default function HeroSliderSortableTable({ data, loading, onDeleted, onToggled, onReordered }: HeroSliderSortableTableProps) {
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = data.findIndex((slide) => slide.id === active.id)
      const newIndex = data.findIndex((slide) => slide.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = arrayMove(data, oldIndex, newIndex).map((slide, index) => ({
        ...slide,
        sortOrder: index,
      }))

      onReordered(reordered)
      setSaving(true)
      setSaveError(null)

      try {
        await heroSliderApi.reorder(reordered.map((slide) => slide.id))
      } catch {
        setSaveError('Failed to save the new order. Please try again.')
        onReordered(data)
      } finally {
        setSaving(false)
      }
    },
    [data, onReordered],
  )

  return (
    <div>
      {saveError && (
        <Alert variant="danger" dismissible onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}
      {saving && <p className="text-muted small mb-2">Saving order...</p>}

      <LoadingOverlay loading={loading}>
        <div className="table-responsive">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
            <Table hover className="table-centered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th />
                  <th>Slide</th>
                  <th>Locale / Media</th>
                  <th>Status</th>
                  <th>Schedule</th>
                  <th>Active</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        icon="solar:slider-horizontal-bold-duotone"
                        title="No hero slides yet"
                        description="Create the first slide to start managing the homepage banner."
                      />
                    </td>
                  </tr>
                ) : (
                  <SortableContext items={data.map((slide) => slide.id)} strategy={verticalListSortingStrategy}>
                    {data.map((slide) => (
                      <HeroSliderSortableRow key={slide.id} slide={slide} onDelete={onDeleted} onToggleActive={onToggled} />
                    ))}
                  </SortableContext>
                )}
              </tbody>
            </Table>
          </DndContext>
        </div>
      </LoadingOverlay>
    </div>
  )
}
