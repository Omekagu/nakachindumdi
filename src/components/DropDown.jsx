'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function DropDown ({ onClose }) {
  const [token, setToken] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'))
    }
  }, [])

  if (!mounted) return null

  return (
    <div className='menu-overlay'>
      <div className='menu-columns'>
        <div className='menu-col'>
          <div className='menu-col-header'>Products</div>
          <div className='menu-col-group'>
            <Link href='/Products/category/Shirts' onClick={onClose}>Shirts</Link>
            <Link href='/Products/category/Jackets%20%26%20Blousons' onClick={onClose}>Jackets & Blousons</Link>
            <Link href='/Products/category/Coats%20%26%20Blazers' onClick={onClose}>Coats & Blazers</Link>
            <Link href='/Products/category/Trousers' onClick={onClose}>Trousers</Link>
          </div>
          <div className='menu-col-group'>
            <Link href='/Products/category/Bags%20%26%20Small%20Leather%20Goods' onClick={onClose}>Bags</Link>
            <Link href='/Products/category/Shoes' onClick={onClose}>Shoes</Link>
            <Link href='/Products/category/Accessories' onClick={onClose}>Accessories</Link>
          </div>
        </div>

        <div className='menu-col'>
          <div className='menu-col-header'>Explore</div>
          <div className='menu-col-group'>
            <Link href='/archive' onClick={onClose}>Archive</Link>
            <Link href='/projects' onClick={onClose}>Projects</Link>
            <Link href='/playlists' onClick={onClose}>Playlists</Link>
            <Link href='/readings' onClick={onClose}>Readings</Link>
          </div>
        </div>
      </div>

      <div className='menu-account'>
        <Link href={token ? '/user/user-profile' : '/auth/login'} onClick={onClose}>
          {token ? 'Profile' : 'Account'}
        </Link>
      </div>
    </div>
  )
}
