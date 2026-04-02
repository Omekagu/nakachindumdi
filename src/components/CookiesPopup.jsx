'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function CookiesPopup () {
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    const hasAcceptedCookies = localStorage.getItem('cookiesAccepted')
    if (!hasAcceptedCookies) {
      setTimeout(() => setShowPopup(true), 800)
    }
  }, [])

  const handleAccept = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cookies`, {
        consent: 'accepted'
      })
      localStorage.setItem('cookiesAccepted', 'true')
      setShowPopup(false)
    } catch (err) {
      console.error('Error saving consent:', err)
    }
  }

  const handleDecline = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cookies`, {
        consent: 'declined'
      })
      setShowPopup(false)
    } catch (err) {
      console.error('Error saving decline:', err)
    }
  }

  if (!showPopup) return null

  return (
    <div className='cookie-overlay'>
      <div className='cookies-popup'>
        <div className='cookies-container'>
          <p>
            We and our partners use cookies and similar tracking technologies on
            the website of NAKACHI NDUMDI to ensure the security and proper
            functioning of the website, improve your browsing experience,
            measure and analyze website traffic and performance, and provide
            personalized content, offers, and services. Some cookies may also
            enable features related to social media platforms and help us better
            understand how visitors interact with our website.
            <br />
            <br />
            {''}
            {''}
            By clicking “Accept All,” you consent to the use of all cookies on
            our website, including those used for analytics and personalized
            content. If you click “Reject All,” only cookies that are strictly
            necessary for the security and basic operation of the website will
            be used.
            <br />
            <br />
            Your cookie preferences will be stored for up to six months. For
            more information about how we collect, use, and protect your
            information, please refer to our{' '}
            <a href='/privacy-policy' target='_blank'>
              Privacy Policy
            </a>
            .
          </p>

          <div className='cookies-actions'>
            <button className='accept-btn' onClick={handleAccept}>
              Accept All
            </button>
            <button className='decline-btn' onClick={handleDecline}>
              Decline All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
