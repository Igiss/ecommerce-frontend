import React from 'react'

export default function ProductCard({ product, onCustomize }) {
  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <strong>${product.price}</strong>
      <button className="primary-btn" onClick={() => onCustomize(product)}>
        Customize
      </button>
    </div>
  )
}
