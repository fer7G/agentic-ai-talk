import { useCallback, useEffect, useState } from 'react'

export function useElementSize<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  // A callback ref (rather than useRef + useEffect(..., [])) is required here:
  // these panels render a loading/error state before the measured element
  // exists, so a mount-once effect would capture a null ref and never
  // re-attach once the real element appears later in the same component.
  const ref = useCallback((el: T | null) => {
    setNode(el)
  }, [])

  useEffect(() => {
    if (!node) return

    const rect = node.getBoundingClientRect()
    if (rect.width > 0 || rect.height > 0) {
      setSize({ width: rect.width, height: rect.height })
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  return { ref, size }
}
