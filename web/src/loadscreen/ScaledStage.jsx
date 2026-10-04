import { useLayoutEffect, useRef, useState } from 'react'

export const STAGE_HEIGHT = 1080

/** Lays the children out on a 1080 px tall canvas scaled to the container, so the game and the panel preview match. */
export function ScaledStage({ children, className = '' }) {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const el = ref.current
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const scale = size.height / STAGE_HEIGHT

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {scale > 0 && (
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: size.width / scale, height: STAGE_HEIGHT, transform: `scale(${scale})` }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
