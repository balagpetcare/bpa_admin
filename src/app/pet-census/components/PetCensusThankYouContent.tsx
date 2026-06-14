'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function PetCensusThankYouContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const duplicate = searchParams.get('duplicate') === '1'

  return (
    <main className="pet-census-public">
      <section className="pet-census-simple-shell">
        <div className="container-fluid">
          <div className="pet-census-simple-card">
            <span className="pet-census-kicker">Submission Received</span>
            <h1>ধন্যবাদ, আপনার Pet Census 2026 তথ্য জমা হয়েছে</h1>
            <p>
              BPA will use this information for future welfare planning, vaccination mapping, and community support preparation.
            </p>
            {id && <p className="text-muted mb-2">Reference ID: <code>{id}</code></p>}
            {duplicate && (
              <div className="alert alert-warning text-start">
                A similar mobile + pet name entry already exists in our records, so this submission has been flagged for admin review.
              </div>
            )}
            <div className="d-flex flex-wrap gap-3 justify-content-center mt-4">
              <Link href="/pet-census/register" className="btn btn-primary btn-lg">Add Another Pet</Link>
              <Link href="/pet-census/status" className="btn btn-outline-secondary btn-lg">Check Status</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
