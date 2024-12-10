'use client'

import React, { useState, useRef, useEffect } from 'react'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 rounded-lg border border-[var(--border)] 
          focus:ring-2 focus:ring-blue-100 outline-none overflow-hidden"
      >
        <div
          className="w-full h-full"
          style={{ backgroundColor: color }}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 rounded-xl border 
          border-[var(--border)] bg-white shadow-lg z-10"
        >
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-48 h-48"
          />
        </div>
      )}
    </div>
  )
} 