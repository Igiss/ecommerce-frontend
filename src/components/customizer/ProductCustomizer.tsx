import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import type { Product } from '@/types/product'
import CupModel from './CupModel'
import CustomizerPanel from './CustomizerPanel'

const modelAliases = {
  '/models/classic-cup.glb': '/models/simple_mug.glb',
  '/models/thermo-cup.glb': '/models/coffee-mug.glb'
}

interface ProductCustomizerProps {
  product: Product
  onBack: () => void
}

export default function ProductCustomizer({
  product,
  onBack
}: ProductCustomizerProps) {
  const modelUrl = product.modelUrl
    ? modelAliases[product.modelUrl as keyof typeof modelAliases] || product.modelUrl
    : undefined

  return (
    <main className="customizer-shell">
      <button className="back-btn" onClick={onBack}>
        Back
      </button>
      <section className="viewer">
        <Canvas camera={{ position: [0, 0.35, 3.4], fov: 42 }} shadows>
          <Suspense fallback={null}>
            <CupModel modelUrl={modelUrl} />
          </Suspense>
        </Canvas>
      </section>
      <CustomizerPanel product={product} />
    </main>
  )
}
