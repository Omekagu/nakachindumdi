'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function DropDown ({ onClose }) {
  const [token, setToken] = useState(null)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'))
    }
  }, [])

  if (!mounted) return null

  const navLink = (href, label) => {
    const isActive = pathname === href || pathname.startsWith(href.split('%')[0])
    return (
      <Link
        href={href}
        onClick={onClose}
        className={isActive ? 'nav-link--active' : 'nav-link--inactive'}
      >
        {label}
      </Link>
    )
  }

  return (
    <div className='menu-overlay'>
      <div className='menu-columns'>
        <div className='menu-col'>
          <div className='menu-col-header'>Products</div>
          <div className='menu-col-group'>
            {navLink('/Products/category/Shirts', 'Shirts')}
            {navLink('/Products/category/Jackets%20%26%20Blousons', 'Jackets & Blousons')}
            {navLink('/Products/category/Coats%20%26%20Blazers', 'Coats & Blazers')}
            {navLink('/Products/category/Trousers', 'Trousers')}
          </div>
          <div className='menu-col-group'>
            {navLink('/Products/category/Bags%20%26%20Small%20Leather%20Goods', 'Bags')}
            {navLink('/Products/category/Shoes', 'Shoes')}
            {navLink('/Products/category/Accessories', 'Accessories')}
          </div>
        </div>

        <div className='menu-col'>
          <div className='menu-col-header'>Explore</div>
          <div className='menu-col-group'>
            {navLink('/archive', 'Archive')}
            {navLink('/projects', 'Projects')}
            {navLink('/playlists', 'Playlists')}
            {navLink('/readings', 'Readings')}
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
