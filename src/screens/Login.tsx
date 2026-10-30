import { useState } from 'react'
import { BookOpen, CalendarClock, Eye, EyeOff, Fingerprint, QrCode, ScanFace } from 'lucide-react'
import { useApp } from '../store'
import branchImg from '../assets/branch.jpg'

export default function Login() {
  const { reset, toast } = useApp()
  const [show, setShow] = useState(false)
  const [pwd, setPwd] = useState('ezymeet2026')
  const login = () => reset({ name: 'home' })

  return (
    <div className="view view--white">
      <div className="login">
        <div className="login__banner">
          <img className="bg" src={branchImg} alt="" />
          <span className="login__banner-badge">
            <CalendarClock size={13} /> New: EZY Meet
          </span>
          <div className="login__banner-text">
            <h2>WELCOME TO<br />PAN ASIA</h2>
            <div className="ezy">EZY</div>
            <p>Built For More...</p>
          </div>
        </div>
        <div className="dots"><span className="on" /><span /><span /></div>

        <div className="login__who">
          <div>
            <small>Welcome back</small>
            <h2>Sandeepa</h2>
          </div>
          <button className="bio-btn" aria-label="Log in with Face ID" onClick={login}>
            <Fingerprint size={28} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            login()
          }}
        >
          <label className="field">
            <input
              type={show ? 'text' : 'password'}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              aria-label="Password"
              autoComplete="current-password"
            />
            <button type="button" className="icon-btn" aria-label="Show password" onClick={() => setShow((s) => !s)}>
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </label>
          <div className="login__links">
            <button type="button" onClick={() => toast('Demo: any password works')}>Forgot Login Details?</button>
            <button type="button" onClick={() => toast('Call 011 2 565 565')}>Contact Us</button>
          </div>
        </form>

        <div className="login__spacer" />
        <button className="btn" onClick={login}>Log In</button>
        <p className="login__logout">Log me out</p>

        <div className="quick-bar">
          <button onClick={() => toast('Not part of the EZY Meet prototype')}><BookOpen size={17} /> ePassbook</button>
          <button className="mid" onClick={() => toast('Not part of the EZY Meet prototype')}><QrCode size={18} /> Pay</button>
          <button onClick={() => toast('Not part of the EZY Meet prototype')}><ScanFace size={17} /> Peek Balance</button>
        </div>
      </div>
    </div>
  )
}
