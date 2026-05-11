'use client'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL

export default function AuthorizeNetForm ({
  apiLoginId,
  clientKey,
  testMode,
  items,
  userId,
  token,
  isGuest,
  onSuccess
}) {
  const [scriptReady, setScriptReady] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const [cardData, setCardData] = useState({
    cardNumber: '',
    month: '',
    year: '',
    cardCode: ''
  })

  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postcode: '',
    phone: '',
    country: 'United States'
  })

  // Load Accept.js once
  useEffect(() => {
    const src = testMode
      ? 'https://jstest.authorize.net/v1/Accept.js'
      : 'https://js.authorize.net/v1/Accept.js'

    if (document.querySelector(`script[src="${src}"]`)) {
      setScriptReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.charset = 'utf-8'
    script.onload = () => setScriptReady(true)
    script.onerror = () => setError('Failed to load payment processor. Please refresh.')
    document.head.appendChild(script)
  }, [testMode])

  // Pre-fill profile for logged-in users
  useEffect(() => {
    if (!userId || !token || isGuest) return
    axios
      .get(`${BACKEND}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const addr = res.data.addresses?.[0]
        const [firstName, ...rest] = (addr?.fullName || '').split(' ')
        setShippingData(prev => ({
          ...prev,
          firstName: firstName || res.data.firstName || '',
          lastName: rest.join(' ') || res.data.lastName || '',
          email: res.data.email || '',
          address: addr?.addressLine1 || '',
          apartment: addr?.addressLine2 || '',
          city: addr?.city || '',
          state: addr?.state || '',
          postcode: addr?.zip || '',
          phone: addr?.phone || '',
          country: addr?.country || 'United States'
        }))
      })
      .catch(() => {})
  }, [userId, token, isGuest])

  const handleShippingChange = e => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value })
  }

  const handleCardChange = e => {
    setCardData({ ...cardData, [e.target.name]: e.target.value })
  }

  const validateShipping = () => {
    const required = ['firstName', 'lastName', 'email', 'address', 'city', 'postcode', 'phone']
    for (const field of required) {
      if (!shippingData[field]?.trim()) {
        setError(`${field.replace(/([A-Z])/g, ' $1').trim()} is required`)
        return false
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    return true
  }

  const validateCard = () => {
    if (!cardData.cardNumber.replace(/\s/g, '')) {
      setError('Card number is required')
      return false
    }
    if (!cardData.month || !cardData.year) {
      setError('Expiration date is required')
      return false
    }
    if (!cardData.cardCode) {
      setError('Security code is required')
      return false
    }
    return true
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)

    if (!validateShipping() || !validateCard()) return

    if (!scriptReady || !window.Accept) {
      setError('Payment processor not loaded. Please refresh.')
      return
    }

    setProcessing(true)

    const secureData = {
      authData: { clientKey, apiLoginID: apiLoginId },
      cardData: {
        cardNumber: cardData.cardNumber.replace(/\s/g, ''),
        month: cardData.month.padStart(2, '0'),
        year: cardData.year,
        cardCode: cardData.cardCode
      }
    }

    window.Accept.dispatchData(secureData, async response => {
      if (response.messages.resultCode === 'Error') {
        const msg = response.messages.message?.[0]?.text || 'Tokenization failed'
        setError(msg)
        setProcessing(false)
        return
      }

      try {
        const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

        const payloadItems = items.map(item => ({
          productId:
            typeof item.productId === 'object' ? item.productId._id : item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          brand: item.brand,
          size: item.size,
          color: item.color,
          measurementId: item.measurementId
        }))

        const res = await axios.post(`${BACKEND}/api/payment/authorizenet/charge`, {
          opaqueData: response.opaqueData,
          items: payloadItems,
          shippingAddress: shippingData,
          userId,
          totalAmount,
          isGuestCheckout: isGuest
        })

        if (isGuest && res.data.newUserData) {
          localStorage.setItem('userId', res.data.newUserData.userId)
          localStorage.setItem('token', res.data.newUserData.token)
        }

        // Normalize shape so CartComponent handleOrderSuccess works the same way
        onSuccess(
          { amount: totalAmount * 100 },
          res.data
        )
      } catch (err) {
        setError(err.response?.data?.msg || err.message || 'Payment failed')
        setProcessing(false)
      }
    })
  }

  return (
    <form className='checkout-form payment-form' onSubmit={handleSubmit}>
      <div className='form-section'>
        <h3 className='section-title'>Contact</h3>
        <input
          type='email'
          name='email'
          placeholder='Email'
          value={shippingData.email}
          onChange={handleShippingChange}
          required
          className='form-input'
        />
      </div>

      <div className='form-section'>
        <h3 className='section-title'>Shipping Information</h3>

        <div className='form-row'>
          <input
            type='text'
            name='firstName'
            placeholder='First name'
            value={shippingData.firstName}
            onChange={handleShippingChange}
            required
            className='form-input'
          />
          <input
            type='text'
            name='lastName'
            placeholder='Last name'
            value={shippingData.lastName}
            onChange={handleShippingChange}
            required
            className='form-input'
          />
        </div>

        <input
          type='text'
          name='address'
          placeholder='Address'
          value={shippingData.address}
          onChange={handleShippingChange}
          required
          className='form-input'
        />

        <input
          type='text'
          name='apartment'
          placeholder='Apartment, suite, etc. (optional)'
          value={shippingData.apartment}
          onChange={handleShippingChange}
          className='form-input'
        />

        <div className='form-row'>
          <input
            type='text'
            name='city'
            placeholder='City'
            value={shippingData.city}
            onChange={handleShippingChange}
            required
            className='form-input'
          />
          <input
            type='text'
            name='state'
            placeholder='State'
            value={shippingData.state}
            onChange={handleShippingChange}
            className='form-input'
          />
        </div>

        <input
          type='text'
          name='postcode'
          placeholder='Postcode'
          value={shippingData.postcode}
          onChange={handleShippingChange}
          required
          className='form-input'
        />

        <input
          type='tel'
          name='phone'
          placeholder='Phone'
          value={shippingData.phone}
          onChange={handleShippingChange}
          required
          className='form-input'
        />
      </div>

      <div className='form-section'>
        <h3 className='section-title'>Payment</h3>
        <p className='secure-text'>All transactions are secure and encrypted.</p>

        <div className='payment-method-box'>
          <div className='payment-method-header'>
            <label className='payment-option'>
              <input type='radio' name='payment' checked readOnly />
              <span>Credit card</span>
            </label>
            <div className='card-icons'>
              <span style={{ fontSize: '11px', color: '#666' }}>
                💳 Visa • Mastercard • Amex
              </span>
            </div>
          </div>

          <div className='card-element-container' style={{ padding: '12px 0' }}>
            <input
              type='text'
              name='cardNumber'
              placeholder='Card number'
              value={cardData.cardNumber}
              onChange={handleCardChange}
              maxLength={19}
              autoComplete='cc-number'
              style={inputStyle}
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                type='text'
                name='month'
                placeholder='MM'
                value={cardData.month}
                onChange={handleCardChange}
                maxLength={2}
                autoComplete='cc-exp-month'
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                type='text'
                name='year'
                placeholder='YYYY'
                value={cardData.year}
                onChange={handleCardChange}
                maxLength={4}
                autoComplete='cc-exp-year'
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                type='text'
                name='cardCode'
                placeholder='CVV'
                value={cardData.cardCode}
                onChange={handleCardChange}
                maxLength={4}
                autoComplete='cc-csc'
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          </div>
        </div>
      </div>

      {error && <div className='error-message'>{error}</div>}

      <button
        type='submit'
        disabled={processing || !scriptReady}
        className='pay-now-btn'
      >
        {processing ? 'Processing...' : 'Pay now'}
      </button>
    </form>
  )
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: 6,
  fontSize: 15,
  color: '#424770',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
}
