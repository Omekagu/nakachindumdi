'use client'

import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function AuthPage () {
  const router = useRouter()
  // Add this helper function at the top of your component (outside the main function)
  const mergeGuestCartToUser = async (userId, token) => {
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')

    if (guestCart.length > 0) {
      try {
        for (const item of guestCart) {
          await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/add-cart`,
            { ...item, userId },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        }
        localStorage.removeItem('guestCart')
        console.log('✅ Guest cart merged successfully')
      } catch (err) {
        console.error('❌ Failed to merge guest cart:', err)
      }
    }
  }

  // Add this helper function in your auth page
  const mergeGuestDataToUser = async (userId, token) => {
    // Merge guest cart
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')

    if (guestCart.length > 0) {
      try {
        for (const item of guestCart) {
          await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/add-cart`,
            { ...item, userId },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        }
        localStorage.removeItem('guestCart')
        console.log('✅ Guest cart merged successfully')
      } catch (err) {
        console.error('❌ Failed to merge guest cart:', err)
      }
    }

    // Merge guest measurements
    const guestMeasurements = JSON.parse(
      localStorage.getItem('customMeasurements') || '[]'
    )

    if (guestMeasurements.length > 0) {
      try {
        for (const measurement of guestMeasurements) {
          await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/measurements`,
            { ...measurement, userId },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        }
        localStorage.removeItem('customMeasurements')
        console.log('✅ Guest measurements merged successfully')
      } catch (err) {
        console.error('❌ Failed to merge guest measurements:', err)
      }
    }
  }

  // Steps: "email" | "otp"
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('') // friendly messages
  const [resendCooldown, setResendCooldown] = useState(0) // seconds
  const cooldownSeconds = 30
  const maxResendAttempts = 5
  const [resendAttempts, setResendAttempts] = useState(0)
  const cooldownTimerRef = useRef(null)
  const announceRef = useRef(null) // for aria-live focus (not required but handy)

  // Read persisted email (if any) so page refresh keeps you in OTP step
  useEffect(() => {
    const saved = localStorage.getItem('email')
    if (saved) {
      setEmail(saved)
      setStep('otp')
      // If you want to auto-start a cooldown on load, uncomment:
      // setResendCooldown(cooldownSeconds)
    }
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current)
      }
    }
  }, [])

  // manage cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current)
        cooldownTimerRef.current = null
      }
      return
    }

    // start interval if not already started
    if (!cooldownTimerRef.current) {
      cooldownTimerRef.current = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(cooldownTimerRef.current)
            cooldownTimerRef.current = null
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      // cleanup handled above when timer ends or component unmounts
    }
  }, [resendCooldown])

  // Utility to format cooldown as mm:ss or ss
  const formatCooldown = secs => {
    if (!secs) return ''
    const mm = Math.floor(secs / 60)
    const ss = secs % 60
    return mm > 0
      ? `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
      : `${ss}s`
  }

  // Step 1 → Request OTP (initial)
  const handleContinue = async () => {
    if (!email) {
      setError('Please enter your email')
      return
    }

    try {
      setLoading(true)
      setError('')
      setStatus('')

      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim()

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
        { email: normalizedEmail }
      )

      const data = res.data
      console.log('✅ Login response:', data)

      // Save normalized email
      localStorage.setItem('email', normalizedEmail)
      if (data.user?._id) {
        localStorage.setItem('userId', data.user._id)
      }

      setStep('otp')
      setStatus('Code sent. Check your email.')
      setResendCooldown(cooldownSeconds)
      setResendAttempts(0)
      if (announceRef.current)
        announceRef.current.textContent = 'Code sent to your email.'
    } catch (err) {
      console.error('❌ Login error:', err)
      setError(err.response?.data?.msg || err.message || 'Something went wrong')
      if (announceRef.current)
        announceRef.current.textContent = 'Failed to send code.'
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResend = async () => {
    if (!email) {
      setError('Email missing. Please re-enter your email.')
      return
    }
    if (resendCooldown > 0) {
      setError(
        `Please wait ${formatCooldown(resendCooldown)} before resending.`
      )
      return
    }
    if (resendAttempts >= maxResendAttempts) {
      setError(
        'You have reached the maximum number of resend attempts. Try again later.'
      )
      return
    }

    try {
      setLoading(true)
      setError('')
      setStatus('')

      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim()

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
        { email: normalizedEmail }
      )
      const data = res.data
      console.log('🔁 Resend response:', data)

      setResendAttempts(prev => prev + 1)
      setResendCooldown(cooldownSeconds)
      setStatus('A new code has been sent to your email.')
      if (announceRef.current)
        announceRef.current.textContent =
          'A new code has been sent to your email.'
    } catch (err) {
      console.error('❌ Resend error:', err)
      setError(
        err.response?.data?.msg || err.message || 'Failed to resend code'
      )
      if (announceRef.current)
        announceRef.current.textContent = 'Failed to resend code.'
    } finally {
      setLoading(false)
    }
  }

  // Step 2 → Verify OTP
  const handleVerify = async e => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    try {
      setLoading(true)
      setError('')
      setStatus('')

      // Normalize email to lowercase
      const currentEmail = (email || localStorage.getItem('email'))
        .toLowerCase()
        .trim()

      console.log('=== VERIFICATION DEBUG ===')
      console.log('Email:', currentEmail)
      console.log('Code:', code)
      console.log('Code length:', code.length)
      console.log('Code type:', typeof code)
      console.log('========================')

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify`,
        {
          email: currentEmail,
          code: code.trim() // Also trim the code
        }
      )
      const data = res.data
      console.log('✅ Verify response:', data)

      // Store authentication data consistently
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('authToken', data.token)
      }
      if (data.user?._id) {
        localStorage.setItem('userId', data.user._id)
      }
      // Check if user came from cart
      const redirect = localStorage.getItem('redirectAfterLogin')
      if (redirect === 'cart') {
        // Merge guest cart before redirecting
        if (data.user?._id && data.token) {
          await mergeGuestCartToUser(data.user._id, data.token)
        }

        if (data.user?._id && data.token) {
          await mergeGuestDataToUser(data.user._id, data.token)
        }

        localStorage.removeItem('redirectAfterLogin')
        localStorage.removeItem('email')

        // Set flag to open cart
        localStorage.setItem('openCartOnLoad', 'true')

        // Go back to previous page
        router.back()
        return
      }

      // Cleanup
      localStorage.removeItem('email')

      // Redirect based on role
      if (data.user?.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/user/user-profile')
      }
    } catch (err) {
      console.error('=== ERROR DEBUG ===')
      console.error('Full error object:', err)
      console.error('Error response:', err.response)
      console.error('Error response data:', err.response?.data)
      console.error('Error response status:', err.response?.status)
      console.error('Error response headers:', err.response?.headers)
      console.error('Error message:', err.message)
      console.error('==================')

      const errorMsg =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid code. Try again.'

      setError(errorMsg)
      if (announceRef.current) {
        announceRef.current.textContent = errorMsg
      }
    } finally {
      setLoading(false)
    }
  }

  // Allow user to go back and change email
  const handleBackToEmail = () => {
    setStep('email')
    setCode('')
    setStatus('')
    setError('')
    // optionally clear persisted email
    // localStorage.removeItem('email')
  }

  return (
    <div className='login-container'>
      <div className='login-box' role='main' aria-labelledby='auth-heading'>
        <h1 id='auth-heading' className='logo'>
          NAKACHI NDUMDI
        </h1>

        {/* Status / accessibility announcement */}
        <div
          ref={announceRef}
          aria-live='polite'
          style={{
            position: 'absolute',
            left: -9999,
            top: 'auto',
            width: 1,
            height: 1,
            overflow: 'hidden'
          }}
        />

        {/* Step 1 → Email */}
        {step === 'email' && (
          <>
            <h2 className='signin-title'>Sign in</h2>
            <p className='signin-subtitle'>Sign in using your email</p>

            <input
              type='email'
              className='input'
              placeholder='Email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              aria-label='Email address'
            />

            {error && (
              <p className='error' role='alert'>
                {error}
              </p>
            )}
            {status && <p className='status'>{status}</p>}

            <button
              className='btn btn-continue'
              onClick={handleContinue}
              disabled={loading}
            >
              {loading ? 'Sending code...' : 'Continue'}
            </button>
          </>
        )}

        {/* Step 2 → OTP */}
        {step === 'otp' && (
          <>
            <h2 className='signin-title'>Enter code</h2>
            <p className='signin-subtitle'>
              Sent to <strong>{email}</strong>
            </p>

            <input
              type='text'
              inputMode='numeric'
              pattern='[0-9]*'
              className='input'
              maxLength={6}
              placeholder='6-digit code'
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              aria-label='6-digit verification code'
            />

            {error && (
              <p className='error' role='alert'>
                {error}
              </p>
            )}
            {status && <p className='status'>{status}</p>}

            <div className='button-group'>
              <button
                className='btn btn-continue'
                onClick={handleVerify}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Submit'}
              </button>

              <button
                className='btn btn-link'
                onClick={handleResend}
                disabled={
                  loading ||
                  resendCooldown > 0 ||
                  resendAttempts >= maxResendAttempts
                }
                aria-disabled={
                  loading ||
                  resendCooldown > 0 ||
                  resendAttempts >= maxResendAttempts
                }
                title={
                  resendCooldown > 0
                    ? `Resend available in ${formatCooldown(resendCooldown)}`
                    : 'Resend code'
                }
              >
                {resendAttempts >= maxResendAttempts
                  ? 'Resend disabled'
                  : resendCooldown > 0
                  ? `Resend in ${formatCooldown(resendCooldown)}`
                  : 'Resend code'}
              </button>

              <button
                className='btn btn-ghost'
                onClick={handleBackToEmail}
                disabled={loading}
              >
                Change email
              </button>
            </div>

            <div className='attempts-info'>
              Attempts: {resendAttempts} / {maxResendAttempts}
            </div>
          </>
        )}

        {/* Footer Links */}
        <div className='links'>
          <a href='/auth/privacy-cookies'>Privacy Policy</a>
          <span className='separator'>|</span>
          <a href='/auth/privacy-cookies'>Terms of service</a>
        </div>
      </div>
    </div>
  )
}
