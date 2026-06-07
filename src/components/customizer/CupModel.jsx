import React, { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Bounds, Center, Decal, OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import { useCustomizerStore } from '../../store/customizer.store'
import CoffeeMug from './models/CoffeeMug'
import BasicCoffeeMug from './models/BasicCoffeeMug'

function ImageDecal({ image }) {
  const texture = useTexture(image)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.flipY = false
  texture.needsUpdate = true

  return (
    <Decal
      position={[0, 0.05, 0.91]}
      rotation={[0, 0, 0]}
      scale={[1.45, 1.35, 0.7]}
      map={texture}
      depthTest
      depthWrite={false}
    />
  )
}

function ArtworkPlane({ image }) {
  const texture = useTexture(image)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true

  return (
    <mesh position={[0, 0.08, 0.9]} rotation={[0, 0, 0]}>
      <planeGeometry args={[1.35, 1.15]} />
      <meshBasicMaterial
        map={texture}
        transparent
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  )
}

function UploadedCup({ modelUrl }) {
  const snap = useCustomizerStore()
  const { scene } = useGLTF(modelUrl)
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)

    clone.traverse((child) => {
      if (!child.isMesh) return

      child.castShadow = true
      child.receiveShadow = true

      if (Array.isArray(child.material)) {
        child.material = child.material.map((material) => material.clone())
      } else if (child.material) {
        child.material = child.material.clone()
      }
    })

    return clone
  }, [scene])

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (!child.isMesh || !child.material) return

      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((material) => {
        if (!material.color) return

        material.color.set(snap.baseColor)
        material.roughness = 0.45
        material.metalness = 0.02
        material.needsUpdate = true
      })
    })
  }, [clonedScene, snap.baseColor])

  return (
    <group rotation={[0, -0.25, 0]}>
      <Center>
        <group>
          <primitive object={clonedScene} />
          {snap.designImage ? <ArtworkPlane image={snap.designImage} /> : null}
        </group>
      </Center>
    </group>
  )
}

function FallbackCup() {
  const snap = useCustomizerStore()

  return (
    <group>
      <group rotation={[0, -0.25, 0]} position={[0, -0.15, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.82, 0.68, 1.55, 96, 1, true]} />
          <meshStandardMaterial
            color={snap.baseColor}
            roughness={0.42}
            metalness={0.02}
            side={2}
          />
          {snap.designImage ? <ImageDecal image={snap.designImage} /> : null}
        </mesh>

        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <torusGeometry args={[0.75, 0.045, 24, 96]} />
          <meshStandardMaterial color={snap.accentColor} roughness={0.35} />
        </mesh>

        <mesh position={[0, -0.8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.69, 0.69, 0.08, 96]} />
          <meshStandardMaterial color={snap.accentColor} roughness={0.4} />
        </mesh>

        <mesh position={[0.82, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 0.72, 1]}>
          <torusGeometry args={[0.48, 0.06, 24, 64, Math.PI * 1.35]} />
          <meshStandardMaterial color={snap.baseColor} roughness={0.42} />
        </mesh>
      </group>
    </group>
  )
}

export default function CupModel({ modelUrl }) {
  const isCoffeeMug = modelUrl === '/models/coffee-mug.glb'
  const isBasicCoffeeMug = modelUrl === '/models/basic_coffee_mug.glb'

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 4]} intensity={1.8} />
      {isCoffeeMug ? (
        <Bounds fit clip observe margin={1.35}>
          <Center>
            <CoffeeMug rotation={[0, -0.25, 0]} />
          </Center>
        </Bounds>
      ) : isBasicCoffeeMug ? (
        <Bounds fit clip observe margin={1.35}>
          <Center>
            <BasicCoffeeMug rotation={[0, -0.25, 0]} />
          </Center>
        </Bounds>
      ) : modelUrl ? (
        <Bounds fit clip observe margin={1.35}>
          <UploadedCup modelUrl={modelUrl} />
        </Bounds>
      ) : (
        <FallbackCup />
      )}
      <OrbitControls enablePan={false} minDistance={2.4} maxDistance={4.8} />
    </>
  )
}
