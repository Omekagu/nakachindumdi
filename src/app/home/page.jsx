import ImageSection from '../../components/sections/ImageSection.jsx'
import React from 'react'
import NewsletterComp from '@/components/NewsletterComp.jsx'

export default function page () {
  return (
    <div className='home-page'>
      <ImageSection
        images={[
          {
            src: '/nakachi_landing.jpeg',
            width: '80%',
            height: '80%'
          },
          {
            src: '/nakachi_landing.jpeg',
            width: '80%',
            height: '80%'
          }
        ]}
      />

      <div style={{ marginTop: '2rem', width: '100%' }}>
        <NewsletterComp />
      </div>
    </div>
  )
}
