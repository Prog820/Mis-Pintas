import { useEffect, useRef } from 'react'
import './StarsBackground.css'

const StarsBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.7 + 0.1,
      sp: Math.random() * 0.008 + 0.002,
      ph: Math.random() * Math.PI * 2,
    }))

    let animId
    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        const a = s.a * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph))
        ctx.beginPath()
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 180, 255, ${a})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="stars-canvas" />
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />
    </>
  )
}

export default StarsBackground
