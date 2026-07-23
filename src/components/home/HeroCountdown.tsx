'use client'

import { useEffect, useState } from 'react'

interface HeroCountdownProps {
  label: string
  targetAt: string
}

function getTimeParts(targetAt: string, now: number) {
  const diff = Math.max(0, new Date(targetAt).getTime() - now)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds, complete: diff <= 0 }
}

export default function HeroCountdown({ label, targetAt }: HeroCountdownProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const time = getTimeParts(targetAt, now)

  return (
    <div className="hero-slide__countdown" aria-live="polite">
      <span className="hero-slide__countdown-label">{label}</span>
      <div className="hero-slide__countdown-grid">
        <div>
          <strong>{time.days}</strong>
          <span>Days</span>
        </div>
        <div>
          <strong>{time.hours}</strong>
          <span>Hours</span>
        </div>
        <div>
          <strong>{time.minutes}</strong>
          <span>Minutes</span>
        </div>
        <div>
          <strong>{time.seconds}</strong>
          <span>Seconds</span>
        </div>
      </div>
      {time.complete && <span className="hero-slide__countdown-complete">Countdown complete</span>}
    </div>
  )
}
