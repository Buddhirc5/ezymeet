import { useEffect, useRef, useState } from 'react'
import { Camera, Lock, Mic, MicOff, PhoneOff, Video, VideoOff, Volume2 } from 'lucide-react'
import { useApp } from '../store'
import { getTopic } from '../data/services'
import advisorImg from '../assets/advisor.jpg'

export default function VideoCall({ topicId }: { topicId: string }) {
  const { back, toast } = useApp()
  const topic = getTopic(topicId)
  const [connected, setConnected] = useState(false)
  const [secs, setSecs] = useState(0)
  const [muted, setMuted] = useState(false)
  const [camOn, setCamOn] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setConnected(true), 2600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!connected) return
    const i = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(i)
  }, [connected])

  const stopCam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }
  useEffect(() => stopCam, [])

  const toggleCam = async () => {
    if (camOn) {
      stopCam()
      setCamOn(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = stream
      setCamOn(true)
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream
      })
    } catch {
      toast('Camera not available')
    }
  }

  const end = () => {
    stopCam()
    back()
    toast(connected ? `Call ended · ${fmt(secs)}` : 'Call cancelled')
  }

  return (
    <div className="call">
      <div className="call__remote"><img src={advisorImg} alt="Advisor" /></div>
      {!connected && (
        <div className="call__connecting">
          <img src={advisorImg} alt="" />
          <b>Connecting to an advisor…</b>
          <span>{topic?.name ?? 'Virtual Advisory'} · Pan Asia Bank</span>
        </div>
      )}

      <div className="call__top">
        <div className="call__who">
          <b>Nimali Perera</b>
          <span>Virtual Advisor · {connected ? fmt(secs) : 'Calling…'}</span>
        </div>
        <span className="call__secure"><Lock size={11} /> Encrypted</span>
      </div>

      {connected && (
        <div className="call__self">
          {camOn ? <video ref={videoRef} autoPlay playsInline muted /> : <span><Camera size={20} style={{ display: 'block', margin: '0 auto 6px' }} />Tap camera<br />to show you</span>}
        </div>
      )}

      {connected && topicId === 'video-kyc' && (
        <div className="call__panel">
          <b>Video KYC · Step 1 of 3</b>
          Please hold your National ID (front) up to the camera. Your advisor will guide you through the verification.
        </div>
      )}

      <div className="call__controls">
        <button className={muted ? 'off' : ''} aria-label="Mute" onClick={() => setMuted((m) => !m)}>{muted ? <MicOff size={24} /> : <Mic size={24} />}</button>
        <button className={camOn ? '' : 'off'} aria-label="Camera" onClick={toggleCam}>{camOn ? <Video size={24} /> : <VideoOff size={24} />}</button>
        <button aria-label="Speaker"><Volume2 size={24} /></button>
        <button className="end" aria-label="End call" onClick={end}><PhoneOff size={24} /></button>
      </div>
    </div>
  )
}

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
