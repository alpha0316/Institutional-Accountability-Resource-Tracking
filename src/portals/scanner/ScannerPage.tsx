import { useEffect, useRef, useState, useCallback } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { QRCodeSVG } from 'qrcode.react'
import { Icon } from '../../components/ui/Icon'
import api from '../../lib/axios'
import type { ApiResponse } from '../../lib/axios'
import type { ScanResult } from '../../types'
import { MOCK_CARDS } from '../../lib/mockData'

const DINING_HALL_ID = 'hall-a'
const SCAN_COOLDOWN_MS = 3000

// Mirrors MOCK_CARDS — the backend's DemoScanDataSeeder (dev profile) seeds each of
// these as a real student+card in Postgres, keyed by the student ID as the QR code
// (physical cards encode the student ID directly), so any card shown here scans as
// the same student in Student Registry / Card Management.
const DEMO_CARDS = MOCK_CARDS.map(c => ({ studentName: c.studentName, qrCode: c.studentId }))

interface Stats {
  served: number
  duplicates: number
  flagged: number
}

export default function ScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stats, setStats] = useState<Stats>({ served: 0, duplicates: 0, flagged: 0 })
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [showDemoCards, setShowDemoCards] = useState(false)
  const lastCode = useRef('')
  const onCooldown = useRef(false)
  const scanLoopId = useRef<number>(0)

  const handleScan = useCallback(async (qrCode: string) => {
    try {
      const res = await api.post<ApiResponse<ScanResult>>('/scanner/scan', { qrCode, diningHallId: DINING_HALL_ID })
      const result = res.data.data
      if (result.status === 'served') {
        setStats(s => ({ ...s, served: s.served + 1 }))
        toast.success(`Served — ${result.studentName}`, { duration: 2000 })
      } else if (result.status === 'duplicate_scan') {
        setStats(s => ({ ...s, duplicates: s.duplicates + 1 }))
        toast.error('Duplicate scan', { duration: 2000 })
      } else if (result.status === 'inactive_student' || result.status === 'unknown_card') {
        setStats(s => ({ ...s, flagged: s.flagged + 1 }))
        toast.error(result.status === 'unknown_card' ? 'Unknown card' : 'Inactive student', { duration: 2000 })
      }
    } catch {
      toast.error('Scan failed — check connection')
    }
  }, [])

  // Camera setup
  useEffect(() => {
    let stream: MediaStream | null = null
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then(s => {
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
        }
      })
      .catch(() => setCameraError('Camera access denied. Please allow camera permission.'))

    return () => {
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [])

  // QR scan loop
  useEffect(() => {
    if (!('BarcodeDetector' in window)) return

    const detector = new (window as unknown as { BarcodeDetector: new (opts: object) => { detect(src: HTMLVideoElement): Promise<Array<{ rawValue: string }>> } }).BarcodeDetector({ formats: ['qr_code'] })

    const tick = async () => {
      const video = videoRef.current
      if (video && video.readyState >= 2 && !onCooldown.current) {
        try {
          const codes = await detector.detect(video)
          if (codes.length > 0) {
            const code = codes[0].rawValue
            if (code !== lastCode.current) {
              lastCode.current = code
              onCooldown.current = true
              handleScan(code)
              setTimeout(() => {
                onCooldown.current = false
                lastCode.current = ''
              }, SCAN_COOLDOWN_MS)
            }
          }
        } catch {
          // detector throws when video frame isn't ready yet — silently ignore
        }
      }
      scanLoopId.current = requestAnimationFrame(tick)
    }

    scanLoopId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(scanLoopId.current)
  }, [handleScan])

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-7 px-6 py-10">
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#1f2937', color: '#f9fafb', fontSize: '14px' },
        }}
      />

      {/* Status badge */}
      <div className="bg-gray-700/60 text-gray-300 text-sm font-medium px-4 py-1.5 rounded-full select-none">
        Dining Hall A — Active
      </div>

      {/* Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-white text-4xl font-bold leading-tight tracking-tight">
          Scan Your<br />Student Card
        </h1>
        <p className="text-gray-400 text-sm">Hold your QR code up to the camera</p>
      </div>

      {/* Camera viewport */}
      <div className="relative w-[370px] h-[370px] rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center">
        {cameraError ? (
          <p className="text-gray-500 text-sm text-center px-6">{cameraError}</p>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Corner bracket overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute top-4 left-4 w-10 h-10 border-l-[3px] border-t-[3px] border-white rounded-tl-lg" />
          <span className="absolute top-4 right-4 w-10 h-10 border-r-[3px] border-t-[3px] border-white rounded-tr-lg" />
          <span className="absolute bottom-4 left-4 w-10 h-10 border-l-[3px] border-b-[3px] border-white rounded-bl-lg" />
          <span className="absolute bottom-4 right-4 w-10 h-10 border-r-[3px] border-b-[3px] border-white rounded-br-lg" />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-10 mt-2">
        <div className="text-center">
          <div className="text-white text-4xl font-bold tabular-nums">{stats.served}</div>
          <div className="text-gray-400 text-xs mt-1">Served</div>
        </div>

        <div className="w-px h-12 bg-gray-700" />

        <div className="text-center">
          <div className="text-orange-400 text-4xl font-bold tabular-nums">{stats.duplicates}</div>
          <div className="text-gray-400 text-xs mt-1">Duplicates</div>
        </div>

        <div className="w-px h-12 bg-gray-700" />

        <div className="text-center">
          <div className="text-red-500 text-4xl font-bold tabular-nums">{stats.flagged}</div>
          <div className="text-gray-400 text-xs mt-1">Flagged</div>
        </div>
      </div>

      {!('BarcodeDetector' in window) && (
        <p className="text-gray-600 text-xs text-center mt-2">
          QR scanning requires Chrome or Edge. Safari is not supported.
        </p>
      )}

      {/* Demo cards — presentation-only, lets this kiosk be demoed on a single machine
          by pointing the camera at another screen/device showing these codes. */}
      <div className="fixed bottom-5 right-5 z-50">
        {showDemoCards && (
          <div className="absolute bottom-14 right-0 w-64 bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[12px] font-semibold text-gray-100">Demo cards</p>
              <button onClick={() => setShowDemoCards(false)} className="text-gray-500 hover:text-gray-300 transition-colors">
                <Icon name="x" size={14} />
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mb-3 leading-snug">
              For presentation only — point this camera at one of these codes on another screen.
            </p>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {DEMO_CARDS.map(card => (
                <div key={card.qrCode} className="flex items-center gap-3 bg-white rounded-lg p-2">
                  <QRCodeSVG value={card.qrCode} size={56} />
                  <p className="text-[11px] font-medium text-gray-900 leading-tight">{card.studentName}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setShowDemoCards(v => !v)}
          className="w-11 h-11 rounded-full bg-gray-700 hover:bg-gray-600 text-white shadow-lg flex items-center justify-center transition-colors"
          title="Demo cards"
        >
          <Icon name={showDemoCards ? 'x' : 'qrcode'} size={18} />
        </button>
      </div>
    </div>
  )
}
