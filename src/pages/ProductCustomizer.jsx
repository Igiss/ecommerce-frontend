import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import CupModel from '../components/CupModel'
import CustomizerPanel from '../components/CustomizerPanel'

const modelAliases = {
  '/models/classic-cup.glb': '/models/simple_mug.glb',
  '/models/thermo-cup.glb': '/models/coffee-mug.glb'
}

export default function ProductCustomizer({ product, onBack }) {
  const modelUrl = modelAliases[product.modelUrl] || product.modelUrl

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
