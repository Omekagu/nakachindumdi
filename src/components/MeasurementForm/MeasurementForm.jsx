'use client'

import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import './MeasurementForm.scss'
import { useNotification } from '@/app/context/NotificationContext'

const MEASUREMENT_GUIDES = {
  'Jackets & Blousons': [
    { name: 'Jacket Sleeve Length', description: 'Top of shoulder to wrist' },
    { name: 'Natural Waist', description: 'Around natural waist' },
    { name: 'Waist', description: 'Around waist' },
    { name: 'Hips', description: 'Around fullest hips' },
    { name: 'Cross Back', description: 'Shoulder across back' },
    { name: 'Jacket Length', description: 'Shoulder to hip' },
    { name: 'Arm Hole', description: 'Arm hole circumference' },
    { name: 'Shoulder', description: 'Shoulder bone to bone' },
    { name: 'Cross Front', description: 'From shoulder across front' },
    { name: 'Neck', description: 'Base of neck' },
    { name: 'Chest', description: 'Full chest circumference' },
    { name: 'Slope (Left Shoulder)', description: 'Left shoulder slope' },
    { name: 'Slope (Right Shoulder)', description: 'Right shoulder slope' },
    { name: 'Strap', description: 'Strap measurement' },
    { name: 'Depth of Scye', description: 'Depth from shoulder to scye' },
    { name: 'Height', description: 'Full height' },
    { name: 'Trouser Length', description: 'Waist to ankle' },
    { name: 'Knee Length', description: 'Waist to knee' },
    { name: 'Fixed Thigh', description: 'Thigh circumference' },
    { name: 'Fixed Knee', description: 'Knee circumference' },
    { name: 'Leg Opening', description: 'Hem opening' },
    { name: 'Crotch', description: 'Front to back crotch' }
  ],
  Trousers: [
    { name: 'Trouser Length', description: 'Waist to ankle' },
    { name: 'Hip', description: 'Around hip' },
    { name: 'Thigh', description: 'Around thigh' },
    { name: 'Ankle', description: 'Around ankle' },
    { name: 'Knee', description: 'Around knee' },
    { name: 'Calf', description: 'Around calf' },
    { name: 'Crotch', description: 'Front to back crotch' },
    { name: 'Inseam', description: 'Inner leg length' },
    { name: 'Waist', description: 'Around waist' }
  ]
}

const CHUNK_SIZE = 7

export default function MeasurementForm ({
  productId = '',
  initialType = null,
  onSaved = null
}) {
  const router = useRouter()
  const { showNotification } = useNotification()

  const defaultType =
    initialType && MEASUREMENT_GUIDES[initialType]
      ? initialType
      : Object.keys(MEASUREMENT_GUIDES)[0]

  const [unit, setUnit] = useState('cm')
  const [activeType, setActiveType] = useState(defaultType)
  const [values, setValues] = useState({})
  const [step, setStep] = useState(1) // 1 = form, 2 = review
  const [chunk, setChunk] = useState(0)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('measurements')

  const fields = MEASUREMENT_GUIDES[activeType] || []

  const chunks = []
  for (let i = 0; i < fields.length; i += CHUNK_SIZE) {
    chunks.push(fields.slice(i, i + CHUNK_SIZE))
  }
  const totalChunks = chunks.length
  const currentFields = chunks[chunk] || []

  useEffect(() => {
    setValues(prev => {
      const base = {}
      fields.forEach(f => {
        base[f.name] = prev[f.name] ?? ''
      })
      return { ...base, ...prev }
    })
    setStep(1)
    setChunk(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType])

  function handleChange (name, raw) {
    const cleaned = String(raw).replace(/[^\d.]/g, '')
    setValues(prev => ({ ...prev, [name]: cleaned }))
  }

  function isChunkFilled () {
    return currentFields.every(f => {
      const v = values[f.name]
      return v !== undefined && v !== null && String(v).trim() !== ''
    })
  }

  function areAllFieldsFilled () {
    return fields.every(f => {
      const v = values[f.name]
      return v !== undefined && v !== null && String(v).trim() !== ''
    })
  }

  function handleContinue () {
    if (!isChunkFilled()) {
      showNotification(
        'Please fill in all measurements to continue.',
        'warning'
      )
      return
    }
    if (chunk < totalChunks - 1) {
      setChunk(c => c + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handleErase () {
    const reset = {}
    fields.forEach(f => {
      reset[f.name] = ''
    })
    setValues(reset)
    setChunk(0)
  }

  function persistLocally (payload) {
    try {
      const existing = JSON.parse(
        typeof window !== 'undefined'
          ? localStorage.getItem('customMeasurements') || '[]'
          : '[]'
      )
      const saved = { id: Date.now().toString(), ...payload }
      existing.push(saved)
      if (typeof window !== 'undefined') {
        localStorage.setItem('customMeasurements', JSON.stringify(existing))
      }
      return saved
    } catch {
      return { id: Date.now().toString(), ...payload }
    }
  }

  async function saveMeasurement () {
    if (!areAllFieldsFilled()) {
      showNotification(
        'Please fill in all measurements before saving.',
        'warning'
      )
      return
    }
    setSaving(true)

    const userId =
      typeof window !== 'undefined' ? localStorage.getItem('userId') : null

    const payload = {
      type: activeType,
      unit,
      values,
      productId: productId || null,
      userId,
      createdAt: new Date().toISOString()
    }

    let savedMeasurement
    try {
      savedMeasurement = persistLocally(payload)
    } catch {
      showNotification('Unable to save. Please try again.', 'error')
      setSaving(false)
      return
    }

    if (userId && process.env.NEXT_PUBLIC_BACKEND_URL) {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/measurements`,
          payload,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        )
        if (res?.data?._id) {
          savedMeasurement = { ...savedMeasurement, _id: res.data._id }
        }
      } catch {
        /* local save succeeded */
      }
    }

    if (onSaved) onSaved(savedMeasurement)

    if (productId) {
      const idToUse = savedMeasurement._id || savedMeasurement.id
      router.replace(
        `/Products/id/${productId}?measurementId=${encodeURIComponent(
          idToUse
        )}&fromMeasurement=1`
      )
    } else {
      router.back()
    }

    setSaving(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        className='mf-page'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* ── TOP BAR ── */}
        <div className='mf-topbar'>
          <div className='mf-topbar-spacer' />
          <button
            className='mf-close'
            onClick={() => router.back()}
            aria-label='Close'
          >
            ✕
          </button>
        </div>

        {/* ── TABS ── */}
        <div className='mf-tabs'>
          <button
            className={`mf-tab ${activeTab === 'measurements' ? 'active' : ''}`}
            onClick={() => setActiveTab('measurements')}
          >
            Custom measurements
          </button>
          <button
            className={`mf-tab ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            Size guide
          </button>
        </div>
        <div className='mf-tab-divider' />

        {activeTab === 'guide' ? (
          <div className='mf-guide-placeholder'>
            <p>Size guide coming soon.</p>
          </div>
        ) : (
          <div className='mf-body'>
            <h1 className='mf-heading'>
              {step === 1
                ? 'Enter your measurements'
                : 'Review your measurements'}
            </h1>

            <p className='mf-desc'>
              {step === 1
                ? 'To ensure a flawless silhouette and fit, we require accurate body measurements, which serve as the foundation of your custom pattern. A $250 pattern-making fee applies for drafting a design exclusively tailored to your proportions. By submitting your measurements, you acknowledge that you have read and understood our Custom Sizing & Tailoring Terms and Conditions.'
                : 'Confirm your measurements before we proceed with your custom pattern.'}
            </p>

            {/* ── UNIT TOGGLE (step 1 only) ── */}
            {step === 1 && (
              <div className='mf-unit-toggle'>
                <button
                  className={`mf-unit ${unit === 'cm' ? 'active' : ''}`}
                  onClick={() => setUnit('cm')}
                  type='button'
                >
                  cm
                </button>
                <button
                  className={`mf-unit ${unit === 'inches' ? 'active' : ''}`}
                  onClick={() => setUnit('inches')}
                  type='button'
                >
                  in
                </button>
              </div>
            )}
            {/* ── STEP & HEADING ── */}
            <div className='mf-step-label'>
              {step === 1 ? `${chunk + 1} – ${totalChunks}` : 'Review'}
            </div>

            {/* ── FORM FIELDS ── */}
            {step === 1 && (
              <>
                <div className='mf-fields'>
                  {currentFields.map((f, i) => (
                    <div key={f.name} className='mf-box'>
                      <span className='mf-box-label'>{f.name}</span>
                      <div className='mf-box-right'>
                        <input
                          className='mf-box-input'
                          inputMode='decimal'
                          value={values[f.name] ?? ''}
                          placeholder='—'
                          onChange={e => handleChange(f.name, e.target.value)}
                          aria-label={f.name}
                        />
                        <span className='mf-box-unit'>{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className='mf-btn-continue' onClick={handleContinue}>
                  CONTINUE
                </button>

                <div className='mf-bottom-links'>
                  {chunk > 0 && (
                    <button
                      className='mf-link-btn'
                      onClick={() => {
                        setChunk(c => c - 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                    >
                      Back
                    </button>
                  )}
                  <button className='mf-link-btn' onClick={handleErase}>
                    Erase data
                  </button>
                </div>
              </>
            )}

            {/* ── REVIEW ── */}
            {step === 2 && (
              <>
                <div className='mf-review-list'>
                  {fields.map(f => (
                    <div key={f.name} className='mf-review-row'>
                      <span className='mf-r-label'>{f.name}</span>
                      <span className='mf-r-val'>
                        {values[f.name] ? `${values[f.name]} ${unit}` : '—'}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  className='mf-btn-continue'
                  onClick={saveMeasurement}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'CONFIRM & PROCEED'}
                </button>

                <div className='mf-bottom-links'>
                  <button
                    className='mf-link-btn'
                    onClick={() => {
                      setStep(1)
                      setChunk(totalChunks - 1)
                    }}
                  >
                    Edit measurements
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

MeasurementForm.propTypes = {
  productId: PropTypes.string,
  initialType: PropTypes.string,
  onSaved: PropTypes.func
}
