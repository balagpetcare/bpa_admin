'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { Button, Card, Form, Table } from 'react-bootstrap'
import ApiErrorAlert from '@/components/ui/ApiErrorAlert'
import { useApiMutation } from '@/hooks/useApi'
import { petCensusApi } from '@/lib/api/pet-census.api'
import type { ApiError } from '@/lib/api'
import type { PetCensusStatusLookupResult } from '@/types/bpa.types'

function labelize(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function PetCensusStatusLookupContent() {
  const { mutate, loading, error } = useApiMutation<PetCensusStatusLookupResult, void>()
  const [result, setResult] = useState<PetCensusStatusLookupResult | null>(null)
  const [mobile, setMobile] = useState('')
  const [petName, setPetName] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const response = await mutate(() => petCensusApi.lookupStatus(mobile.trim(), petName.trim() || undefined), undefined)
    if (response) setResult(response)
  }

  return (
    <main className="pet-census-public">
      <section className="pet-census-form-shell">
        <div className="container-fluid">
          <div className="pet-census-form-shell__intro">
            <span className="pet-census-kicker">Submission Status</span>
            <h1>আপনার জমা দেওয়া তথ্যের বর্তমান অবস্থা দেখুন</h1>
            <p>Enter your mobile number to review the most recent Pet Census submissions associated with it.</p>
          </div>

          <Card className="pet-census-form-card">
            <Card.Body className="p-4 p-lg-5">
              <ApiErrorAlert error={error as ApiError | null} />
              <Form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-5">
                  <Form.Group>
                    <Form.Label>Mobile number</Form.Label>
                    <Form.Control required value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="01XXXXXXXXX" />
                  </Form.Group>
                </div>
                <div className="col-md-5">
                  <Form.Group>
                    <Form.Label>Pet name (optional)</Form.Label>
                    <Form.Control value={petName} onChange={(e) => setPetName(e.target.value)} />
                  </Form.Group>
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <Button type="submit" className="w-100" disabled={loading}>
                    {loading ? 'Checking...' : 'Check'}
                  </Button>
                </div>
              </Form>

              {result && (
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h5 mb-0">Matched submissions</h2>
                    <span className="text-muted">{result.total} found</span>
                  </div>

                  {result.submissions.length === 0 ? (
                    <div className="alert alert-info mb-0">
                      No submission was found for this mobile number yet. <Link href="/pet-census/register">Register now</Link>.
                    </div>
                  ) : (
                    <Table responsive hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Pet</th>
                          <th>Location</th>
                          <th>Vaccination</th>
                          <th>Status</th>
                          <th>Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.submissions.map((item) => (
                          <tr key={item.id}>
                            <td>{item.petName ?? item.petType ?? 'Pet'}</td>
                            <td>{[item.cityUpazila, item.district, item.division].filter(Boolean).join(', ') || '-'}</td>
                            <td>{item.vaccinationStatus ? labelize(item.vaccinationStatus) : '-'}</td>
                            <td>{labelize(item.status)}</td>
                            <td>{new Date(item.submittedAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </section>
    </main>
  )
}
