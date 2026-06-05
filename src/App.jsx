import React, { useState } from 'react'
import Home from './pages/Home'
import ProductCustomizer from './pages/ProductCustomizer'

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState(null)

  if (selectedProduct) {
    return (
      <ProductCustomizer
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
      />
    )
  }

  return <Home onCustomize={setSelectedProduct} />
}
