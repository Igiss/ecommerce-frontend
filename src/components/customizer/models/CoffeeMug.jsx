import React, { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useCustomizerStore } from '../../../store/customizer.store'

function useCupTexture(baseColor, designImage, printX, printY, printSize) {
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    let active = true
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024

    const context = canvas.getContext('2d')
    context.fillStyle = baseColor
    context.fillRect(0, 0, canvas.width, canvas.height)

    const finish = () => {
      if (!active) return

      const nextTexture = new THREE.CanvasTexture(canvas)
      nextTexture.colorSpace = THREE.SRGBColorSpace
      nextTexture.flipY = false
      nextTexture.wrapS = THREE.ClampToEdgeWrapping
      nextTexture.wrapT = THREE.ClampToEdgeWrapping
      nextTexture.needsUpdate = true
      setTexture((previousTexture) => {
        previousTexture?.dispose()
        return nextTexture
      })
    }

    if (!designImage) {
      finish()
      return () => {
        active = false
      }
    }

    const image = new Image()
    image.onload = () => {
      const printArea = {
        x: printX - printSize / 2,
        y: printY - printSize / 2,
        width: printSize,
        height: printSize
      }

      context.drawImage(
        image,
        printArea.x,
        printArea.y,
        printArea.width,
        printArea.height
      )
      finish()
    }
    image.src = designImage

    return () => {
      active = false
    }
  }, [baseColor, designImage, printX, printY, printSize])

  return texture
}

export default function CoffeeMug(props) {
  const snap = useCustomizerStore()
  const { nodes, materials } = useGLTF('/models/coffee-mug.glb')
  const cupTexture = useCupTexture(
    snap.baseColor,
    snap.designImage,
    snap.printX,
    snap.printY,
    snap.printSize
  )

  const handleMaterial = useMemo(() => materials['AR3DMat PBR Ceramic White'].clone(), [materials])
  const cupMaterial = useMemo(() => {
    const material = materials['AR3DMat PBR Ceramic White'].clone()
    material.roughness = 0.45
    material.metalness = 0.02
    return material
  }, [materials])

  useEffect(() => {
    cupMaterial.color.set('#ffffff')
    cupMaterial.map = cupTexture
    cupMaterial.roughness = 0.45
    cupMaterial.metalness = 0.02
    cupMaterial.side = THREE.FrontSide
    cupMaterial.needsUpdate = true

    handleMaterial.color.set(snap.baseColor)
    handleMaterial.roughness = 0.45
    handleMaterial.metalness = 0.02
    handleMaterial.side = THREE.FrontSide
    handleMaterial.needsUpdate = true
  }, [cupMaterial, cupTexture, handleMaterial, snap.baseColor])

  return (
    <group {...props} dispose={null}>
      <group name="Scene">
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cylinder.geometry}
          material={cupMaterial}
          position={[0, 1.136, 0]}
          userData={{ name: 'Cylinder' }}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Torus.geometry}
          material={handleMaterial}
          position={[0, 1.246, -0.921]}
          rotation={[1.537, 0, Math.PI / 2]}
          scale={[0.589, 0.593, 0.633]}
          userData={{ name: 'Torus' }}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/models/coffee-mug.glb')
