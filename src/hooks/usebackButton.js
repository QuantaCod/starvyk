import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function useBackButton() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const stepRef    = useRef(0)
  const timerRef   = useRef(null)

  useEffect(() => {
    // Push a dummy state so we can catch popstate
    window.history.pushState({ intercepted: true }, '')

    const handlePopState = () => {
      // Always re-push so next back press is also caught
      window.history.pushState({ intercepted: true }, '')

      // Reset step after 4 seconds of no presses
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => { stepRef.current = 0 }, 4000)

      if (stepRef.current === 0) {
        // First press — scroll to top
        if (window.scrollY > 50) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
          stepRef.current = 1
        } else {
          // Already at top, go to step 2 directly
          stepRef.current = 1
          if (location.pathname !== '/') {
            navigate('/')
            stepRef.current = 2
          }
        }
      } else if (stepRef.current === 1) {
        // Second press — go to homepage
        if (location.pathname !== '/') {
          navigate('/')
        }
        stepRef.current = 2
      } else {
        // Third press — actually go back
        stepRef.current = 0
        window.history.go(-2)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [navigate, location.pathname])
}