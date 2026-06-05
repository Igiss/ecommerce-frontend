import React, { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useSnapshot } from 'valtio'
import { customizerState } from '../../store/customizerState'

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

export default function BasicCoffeeMug(props) {
  const snap = useSnapshot(customizerState)
  const { nodes, materials } = useGLTF('/models/basic_coffee_mug.glb')
  const cupTexture = useCupTexture(
    snap.baseColor,
    snap.designImage,
    snap.printX,
    snap.printY,
    snap.printSize
  )

  const accentMaterial = useMemo(() => materials.material.clone(), [materials])
  const cupMaterial = useMemo(() => materials.White.clone(), [materials])

  useEffect(() => {
    accentMaterial.color.set(snap.accentColor)
    accentMaterial.roughness = 0.45
    accentMaterial.metalness = 0.02
    accentMaterial.needsUpdate = true

    cupMaterial.color.set('#ffffff')
    cupMaterial.map = cupTexture
    cupMaterial.roughness = 0.45
    cupMaterial.metalness = 0.02
    cupMaterial.side = THREE.FrontSide
    cupMaterial.needsUpdate = true
  }, [accentMaterial, cupMaterial, cupTexture, snap.accentColor])

  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={0.008}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <group rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Mug_Red_0.geometry}
              material={accentMaterial}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Mug_White_0.geometry}
              material={cupMaterial}
            />
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/basic_coffee_mug.glb')
