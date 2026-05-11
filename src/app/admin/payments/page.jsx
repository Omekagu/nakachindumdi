'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL

export default function PaymentSettingsPage () {
  const [settings, setSettings] = useState({ stripe: true, authorizenet: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    axios
      .get(`${BACKEND}/api/payment/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setSettings({ stripe: res.data.stripe, authorizenet: res.data.authorizenet })
      })
      .catch(err => {
        setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to load settings' })
      })
      .finally(() => setLoading(false))
  }, [])

  const toggle = gateway => {
    setSettings(prev => {
      const next = { ...prev, [gateway]: !prev[gateway] }
      // prevent disabling both
      if (!next.stripe && !next.authorizenet) return prev
      return next
    })
  }

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${BACKEND}/api/payment/settings`,
        settings,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessage({ type: 'success', text: 'Payment settings saved.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Payment Gateways</h2>
        <p style={styles.subtitle}>
          Choose which payment processors are available at checkout. At least one must remain active.
        </p>

        <div style={styles.gatewayList}>
          {/* Stripe */}
          <div style={styles.gatewayRow}>
            <div style={styles.gatewayInfo}>
              <div style={styles.gatewayName}>
                <span style={styles.gatewayIcon}>💳</span> Stripe
              </div>
              <div style={styles.gatewayDesc}>
                Credit / debit card, Apple Pay, Google Pay.
                <br />
                <span style={styles.envNote}>
                  Keys: <code>STRIPE_SECRET_KEY</code>, <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>
                </span>
              </div>
            </div>
            <button
              onClick={() => toggle('stripe')}
              style={{
                ...styles.toggle,
                background: settings.stripe ? '#111' : '#e0e0e0',
                color: settings.stripe ? '#fff' : '#555'
              }}
              title={settings.stripe ? 'Disable Stripe' : 'Enable Stripe'}
            >
              {settings.stripe ? 'Active' : 'Inactive'}
            </button>
          </div>

          <div style={styles.divider} />

          {/* Authorize.Net */}
          <div style={styles.gatewayRow}>
            <div style={styles.gatewayInfo}>
              <div style={styles.gatewayName}>
                <span style={styles.gatewayIcon}>🔒</span> Authorize.Net
              </div>
              <div style={styles.gatewayDesc}>
                Credit / debit card via Accept.js tokenization.
                <br />
                <span style={styles.envNote}>
                  Keys: <code>AUTHORIZENET_API_LOGIN_ID</code>, <code>AUTHORIZENET_TRANSACTION_KEY</code>,{' '}
                  <code>AUTHORIZENET_CLIENT_KEY</code>
                </span>
              </div>
            </div>
            <button
              onClick={() => toggle('authorizenet')}
              style={{
                ...styles.toggle,
                background: settings.authorizenet ? '#111' : '#e0e0e0',
                color: settings.authorizenet ? '#fff' : '#555'
              }}
              title={settings.authorizenet ? 'Disable Authorize.Net' : 'Enable Authorize.Net'}
            >
              {settings.authorizenet ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>

        {settings.stripe && settings.authorizenet && (
          <div style={styles.bothNote}>
            Both gateways are active — customers will see a tab to choose at checkout.
          </div>
        )}

        {message && (
          <div
            style={{
              ...styles.message,
              background: message.type === 'success' ? '#e6f4ea' : '#fdecea',
              color: message.type === 'success' ? '#1e7e34' : '#c0392b'
            }}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={save}
          disabled={saving}
          style={{ ...styles.saveBtn, opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        <div style={styles.envSection}>
          <h3 style={styles.envTitle}>Credential Setup</h3>
          <p style={styles.envBody}>
            API keys are stored in <code>server/.env</code> — not in the database.
            Set the variables below, then restart the server.
          </p>
          <table style={styles.envTable}>
            <tbody>
              {[
                ['STRIPE_SECRET_KEY', 'Stripe secret key (starts with sk_ or rk_)'],
                ['STRIPE_WEBHOOK_SECRET', 'Stripe webhook signing secret (starts with whsec_)'],
                ['AUTHORIZENET_API_LOGIN_ID', 'Authorize.Net API Login ID'],
                ['AUTHORIZENET_TRANSACTION_KEY', 'Authorize.Net Transaction Key'],
                ['AUTHORIZENET_CLIENT_KEY', 'Authorize.Net Public Client Key'],
                ['AUTHORIZENET_TEST_MODE', '"true" for sandbox, "false" for production']
              ].map(([key, desc]) => (
                <tr key={key}>
                  <td style={styles.envKey}><code>{key}</code></td>
                  <td style={styles.envVal}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    padding: '32px',
    minHeight: '100vh',
    background: '#f5f5f5',
    fontFamily: 'system-ui, sans-serif'
  },
  card: {
    maxWidth: 680,
    background: '#fff',
    borderRadius: 12,
    padding: '32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  title: {
    margin: '0 0 6px',
    fontSize: 22,
    fontWeight: 700,
    color: '#111'
  },
  subtitle: {
    margin: '0 0 28px',
    color: '#666',
    fontSize: 14
  },
  gatewayList: {
    border: '1px solid #e8e8e8',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16
  },
  gatewayRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    gap: 16
  },
  gatewayInfo: { flex: 1 },
  gatewayName: {
    fontSize: 16,
    fontWeight: 600,
    color: '#111',
    marginBottom: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  gatewayIcon: { fontSize: 18 },
  gatewayDesc: { fontSize: 13, color: '#666', lineHeight: 1.5 },
  envNote: { fontSize: 12, color: '#999' },
  divider: { height: 1, background: '#f0f0f0', margin: '0 24px' },
  toggle: {
    padding: '8px 20px',
    borderRadius: 20,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    minWidth: 80,
    transition: 'all 0.2s'
  },
  bothNote: {
    background: '#fffbe6',
    border: '1px solid #ffe58f',
    borderRadius: 6,
    padding: '10px 14px',
    fontSize: 13,
    color: '#7c6000',
    marginBottom: 16
  },
  message: {
    padding: '10px 14px',
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 16
  },
  saveBtn: {
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 28px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    marginBottom: 32
  },
  envSection: { borderTop: '1px solid #f0f0f0', paddingTop: 24 },
  envTitle: { margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#111' },
  envBody: { fontSize: 13, color: '#666', marginBottom: 16 },
  envTable: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  envKey: {
    padding: '6px 0',
    verticalAlign: 'top',
    whiteSpace: 'nowrap',
    paddingRight: 16,
    color: '#333'
  },
  envVal: { padding: '6px 0', color: '#666' }
}
