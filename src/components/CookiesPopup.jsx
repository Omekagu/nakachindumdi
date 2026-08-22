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
        <button
          className='cookies-close-btn'
          onClick={() => setShowPopup(false)}
          aria-label='Close'
        >
          ✕
        </button>

        <div className='cookies-container'>
          <p>
            This website uses first and third-party cookies along with other
            tracking technologies to enhance user experience and to analyze
            performance and traffic on our website. We also share information
            about your use of our site with our social media, advertising and
            analytics partners. If we have detected an opt-out preference signal
            then it will be honored. Further information is available in our{' '}
            <a href='/auth/privacy-cookies' target='_blank'>
              Cookie Policy
            </a>
            .
          </p>

          <div className='cookies-dnss'>
            <a href='/auth/privacy-cookies' target='_blank'>
              Do Not Sell or Share My Personal Information
            </a>
          </div>

          <div className='cookies-actions'>
            <button className='decline-btn' onClick={handleDecline}>
              Reject All
            </button>
            <button className='accept-btn' onClick={handleAccept}>
              Accept Cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
