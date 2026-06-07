import React, { useState } from 'react'
import { useCustomizerStore } from '../../store/customizer.store'

const swatches = ['#f7f1e8', '#ffffff', '#b9d8c2', '#f4b860', '#e56b6f', '#30343f']

export default function CustomizerPanel({ product }) {
  const snap = useCustomizerStore()
  const [status, setStatus] = useState('')

  const handleFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      useCustomizerStore.setState({
        designImage: reader.result,
        designName: file.name.replace(/\.[^.]+$/, '') || 'My cup design',
        printX: 512,
        printY: 610,
        printSize: 520
      })
    }
    reader.readAsDataURL(file)
  }

  const saveDesign = async () => {
    setStatus('Saving...')
    try {
      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          name: snap.designName,
          baseColor: snap.baseColor,
          accentColor: snap.accentColor,
          printX: snap.printX,
          printY: snap.printY,
          printSize: snap.printSize,
          hasImage: Boolean(snap.designImage)
        })
      })

      if (!response.ok) throw new Error('Save failed')
      setStatus('Saved draft')
    } catch {
      setStatus('Could not save yet')
    }
  }

  return (
    <aside className="customizer-panel">
      <div>
        <p className="eyebrow">3D Customizer</p>
        <h1>{product.name}</h1>
        <p className="muted">{product.description}</p>
      </div>

      <label className="field">
        <span>Design name</span>
        <input
          value={snap.designName}
          onChange={(event) => {
            useCustomizerStore.setState({ designName: event.target.value })
          }}
        />
      </label>

      <div className="field">
        <span>Cup color</span>
        <div className="swatches">
          {swatches.map((color) => (
            <button
              key={color}
              className={snap.baseColor === color ? 'swatch active' : 'swatch'}
              style={{ backgroundColor: color }}
              onClick={() => {
                useCustomizerStore.setState({ baseColor: color })
              }}
              aria-label={`Use color ${color}`}
            />
          ))}
        </div>
      </div>

      <label className="field">
        <span>Upload artwork</span>
        <input type="file" accept="image/*" onChange={handleFile} />
      </label>

      <button
        className="secondary-btn"
        onClick={() => useCustomizerStore.setState({ designImage: '' })}
      >
        Clear artwork
      </button>

      <div className="field">
        <span>Artwork position</span>
        <div className="slider-row">
          <label>
            X
            <input
              type="range"
              min="120"
              max="900"
              value={snap.printX}
              onChange={(event) => {
                useCustomizerStore.setState({ printX: Number(event.target.value) })
              }}
            />
          </label>
          <label>
            Y
            <input
              type="range"
              min="120"
              max="900"
              value={snap.printY}
              onChange={(event) => {
                useCustomizerStore.setState({ printY: Number(event.target.value) })
              }}
            />
          </label>
          <label>
            Size
            <input
              type="range"
              min="120"
              max="1024"
              value={snap.printSize}
              onChange={(event) => {
                useCustomizerStore.setState({ printSize: Number(event.target.value) })
              }}
            />
          </label>
        </div>
      </div>

      <button className="primary-btn wide" onClick={saveDesign}>
        Save draft
      </button>

      {status ? <p className="status">{status}</p> : null}
    </aside>
  )
}
