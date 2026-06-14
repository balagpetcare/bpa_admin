import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pet Census 2026',
  description: 'Bangladesh Pet Association Pet Census 2026 public registration and planning portal.',
}

const highlights = [
  {
    title: 'Bangladesh-wide planning',
    body: 'District-level data helps BPA plan community clinics, vaccination outreach, rescue readiness, and future member support.',
  },
  {
    title: 'Guest-friendly now',
    body: 'Anyone can submit today. If you are logged in, your submission can also connect to your BPA profile for future benefits.',
  },
  {
    title: 'Privacy-first use',
    body: 'Submitted information is used for BPA welfare planning only and helps us understand where support is needed most.',
  },
]

export default function PetCensusLandingPage() {
  return (
    <main className="pet-census-public">
      <section className="pet-census-landing">
        <div className="container-fluid pet-census-landing__grid">
          <div className="pet-census-landing__copy">
            <span className="pet-census-kicker">Pet Census 2026</span>
            <h1>বাংলাদেশ পেট এসোসিয়েশন জাতীয় পেট সেন্সাস</h1>
            <p className="pet-census-lead">
              আপনার পরিবারে থাকা পোষা প্রাণীর তথ্য দিন, যাতে BPA ভবিষ্যতের কমিউনিটি পেট ক্লিনিক, ভ্যাকসিনেশন, সদস্যসেবা,
              রেসকিউ ও ওয়েলফেয়ার পরিকল্পনা আরও পেশাদারভাবে করতে পারে।
            </p>
            <p className="pet-census-sublead">
              Share your pet information so BPA can build smarter district-wise welfare planning across Bangladesh.
            </p>
            <div className="pet-census-actions">
              <Link href="/pet-census/register" className="btn btn-primary btn-lg">Start Registration</Link>
              <Link href="/pet-census/status" className="btn btn-outline-light btn-lg">Check Submission Status</Link>
            </div>
            <div className="pet-census-stats">
              <div>
                <strong>64+</strong>
                <span>District-ready outreach model</span>
              </div>
              <div>
                <strong>Guest + Member</strong>
                <span>Flexible submission support</span>
              </div>
              <div>
                <strong>Planning only</strong>
                <span>Privacy-focused BPA use</span>
              </div>
            </div>
          </div>

          <div className="pet-census-landing__panel">
            <div className="pet-census-note-card">
              <span className="pet-census-note-card__eyebrow">Why this matters</span>
              <h2>Professional welfare mapping for future BPA services</h2>
              <ul>
                <li>District and division demand mapping for vaccination and clinic campaigns</li>
                <li>Owner and pet segmentation for future membership benefits and priority support</li>
                <li>Better planning for rescue, community care, and partner coverage zones</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="pet-census-section">
        <div className="container-fluid">
          <div className="pet-census-section__heading">
            <span className="pet-census-kicker">How BPA will use this data</span>
            <h2>Bangla-first public copy with English-ready structure</h2>
          </div>
          <div className="row g-3">
            {highlights.map((item) => (
              <div className="col-lg-4" key={item.title}>
                <article className="pet-census-feature-card h-100">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pet-census-section pet-census-section--privacy">
        <div className="container-fluid">
          <div className="pet-census-privacy">
            <div>
              <span className="pet-census-kicker">Privacy Notice</span>
              <h2>Data used for BPA welfare planning only</h2>
              <p>
                Your Pet Census information is collected for Bangladesh Pet Association planning, campaign prioritization, and
                future community welfare support. We do not use this form for unrelated marketing or resale.
              </p>
            </div>
            <Link href="/pet-census/register" className="btn btn-dark btn-lg">Register Your Pet</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
