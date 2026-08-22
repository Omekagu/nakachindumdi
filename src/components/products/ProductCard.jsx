import Link from 'next/link'
import React from 'react'

export default function ProductCard ({
  img1,
  img2,
  title,
  price,
  id,
  quantity,
  colors
}) {
  return (
    <div className='productCard'>
      <div className='imageWrapper'>
        {quantity === 0 && <div className='reserve-overlay'>Reserved</div>}

        <Link href={`/Products/id/${id}`} className='card'>
          <img src={img1} alt={title} className='img' />
        </Link>
      </div>

      <Link href={`/Products/id/${id}`} className='info'>
        <p className='product-title'>{title}</p>
        <span className='product-price'>{price}</span>

        {colors && colors.length > 0 && (
          <div className='product-colors'>
            {colors.map((color, i) => (
              <span
                key={i}
                className='color-swatch'
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}
      </Link>
    </div>
  )
}
