'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import DropDown from './DropDown'
import CartComponent from './products/CartComponent'
import { Search, X, Menu } from 'lucide-react'
import SearchComponent from './SearchComponent'

const navMenu = [
  {
    label: 'Ready To Wear',
    dropdown: [
      { label: 'Shirts', href: '/Products/category/Shirts' },
      {
        label: 'Jackets & Blousons',
        href: '/Products/category/Jackets%20%26%20Blousons'
      },
      {
        label: 'Coats & Blazers',
        href: '/Products/category/Coats%20%26%20Blazers'
      },
      { label: 'Trousers', href: '/Products/category/Trousers' }
    ]
  },
  {
    label: 'Bags and small leather',
    dropdown: [
      {
        label: 'Bags & Small Leather Goods',
        href: '/Products/category/Bags%20%26%20Small%20Leather%20Goods'
      }
    ]
  },
  {
    label: 'Shoes',
    dropdown: [{ label: 'Shoes', href: '/Products/category/Shoes' }]
  },
  {
    label: 'Accessories',
    dropdown: [{ label: 'Accessories', href: '/Products/category/Accessories' }]
  }
]

const HandbagIcon = ({ size = 19, strokeWidth = 1 }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={strokeWidth}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M6 6h12l1 14H5L6 6z' />
    <path d='M9 6V5a3 3 0 0 1 6 0v1' />
  </svg>
)

export default function Header () {
  const [activePanel, setActivePanel] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [cartCount, setCartCount] = useState(0)
  const [token, setToken] = useState(null)
  const [mounted, setMounted] = useState(false)

  const togglePanel = panel => {
    setActivePanel(prev => (prev === panel ? null : panel))
  }

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'))
    }
  }, [])

  const refreshCartCount = () => {
    if (typeof window === 'undefined') return
    const uid = localStorage.getItem('userId')
    const tok = localStorage.getItem('token')
    if (uid && tok) {
      const stored = parseInt(localStorage.getItem('cartCount') || '0', 10)
      setCartCount(stored)
    } else {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
      setCartCount(guestCart.length)
    }
  }

  useEffect(() => {
    refreshCartCount()
    const handleCartUpdated = e => {
      if (e.detail?.count !== undefined) {
        setCartCount(e.detail.count)
        localStorage.setItem('cartCount', String(e.detail.count))
      } else {
        refreshCartCount()
      }
    }
    const handleStorage = e => {
      if (e.key === 'guestCart' || e.key === 'cartCount') refreshCartCount()
    }
    window.addEventListener('cartUpdated', handleCartUpdated)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdated)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  if (!mounted) return null

  const accountMenu = [
    {
      label: token ? 'Profile' : 'Login',
      href: token ? '/user/user-profile' : '/auth/login'
    },
    { label: 'Search', action: () => togglePanel('search') },
    {
      label: cartCount > 0 ? `Cart (${cartCount})` : 'Cart',
      action: () => togglePanel('cart')
    }
  ]

  return (
    <>
      <header>
        <nav className='site-header'>
          {/* LEFT */}
          <div className='nav-left'>
            <div
              className='hamburger-menu'
              onClick={() => togglePanel('menu')}
              aria-label={activePanel === 'menu' ? 'Close menu' : 'Open menu'}
            >
              {activePanel === 'menu' ? (
                <X strokeWidth={2} size={19} />
              ) : (
                <Menu strokeWidth={1} size={19} />
              )}
            </div>

            <ul>
              {navMenu.map((item, idx) => (
                <li
                  key={item.label}
                  onMouseEnter={() => setDropdownOpen(idx)}
                  onMouseLeave={() => setDropdownOpen(null)}
                  className='nav-item'
                >
                  <span>{item.label}</span>
                  {dropdownOpen === idx && (
                    <ul className='dropdown'>
                      {item.dropdown.map((sub, subIdx) => (
                        <li key={subIdx}>
                          <Link href={sub.href}>{sub.label}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* CENTER LOGO — absolutely centered, never pushed by flex siblings */}
          <div className='logo'>
            <Link href='/'>NAKACHI NDUMDI</Link>
          </div>

          {/* RIGHT */}
          <div className='nav-right'>
            <ul>
              {accountMenu.map(item => (
                <li key={item.label}>
                  {item.action ? (
                    <span onClick={item.action} className='nav-action'>
                      {item.label}
                    </span>
                  ) : (
                    <a href={item.href}>{item.label}</a>
                  )}
                </li>
              ))}
            </ul>

            {/* Mobile icons */}
            <div className='mobile-icon'>
              <div
                className='search-icon'
                onClick={() => togglePanel('search')}
              >
                {activePanel === 'search' ? (
                  <X strokeWidth={1} size={19} />
                ) : (
                  <Search strokeWidth={1} size={19} />
                )}
              </div>

              <div
                className='cart-icon-wrap'
                onClick={() => togglePanel('cart')}
              >
                {activePanel === 'cart' ? (
                  <X strokeWidth={1} size={19} />
                ) : (
                  <>
                    <HandbagIcon />
                    {cartCount > 0 && (
                      <span className='cart-badge'>{cartCount}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {activePanel === 'cart' && (
        <CartComponent onClose={() => setActivePanel(null)} />
      )}
      {activePanel === 'search' && (
        <SearchComponent onClose={() => setActivePanel(null)} />
      )}
      {activePanel === 'menu' && (
        <DropDown onClose={() => setActivePanel(null)} isOpen />
      )}
    </>
  )
}
