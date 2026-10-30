import { useState } from 'react'
import { BookOpen, Eye, EyeOff, Fingerprint, QrCode, ScanFace } from 'lucide-react'
import { useApp } from '../store'
import branchImg from '../assets/branch.jpg'

export default function Login() {
  const { reset, toast } = useApp()
  const [show, setShow] = useState(false)
  const [pwd, setPwd] = useState('ezymeet2026')
  const login = () => reset({ name: 'home' })
  const soon = () => toast('Not part of the EZY Meet prototype')

  return (
    <div className="view">
      <div className="login">
        <div className="login__banner">
          <img src={branchImg} alt="" />
          <div>
            <h2>WELCOME TO<br />PAN ASIA</h2>
            <strong>EZY</strong>
            <p>Built For More...</p>
          </div>
        </div>
        <div className="dots"><span className="on" /><span /><span /></div>

        <div className="login__who">
          <div>
            <small>Welcome back</small>
            <h2>Sandeepa</h2>
          </div>
          <button className="bio-btn" aria-label="Log in with biometrics" onClick={login}>
            <Fingerprint size={26} strokeWidth={1.6} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); login() }}>
          <label className="field">
            <input type={show ? 'text' : 'password'} value={pwd} onChange={(e) => setPwd(e.target.value)} aria-label="Password" autoComplete="current-password" />
            <button type="button" aria-label="Show password" onClick={() => setShow((s) => !s)}>
              {show ? <EyeOff size={20} strokeWidth={1.6} /> : <Eye size={20} strokeWidth={1.6} />}
            </button>
          </label>
          <div className="login__links">
            <button type="button" onClick={() => toast('Demo: any password works')}>Forgot Login Details?</button>
            <button type="button" onClick={soon}>Contact Us</button>
          </div>
        </form>

        <div style={{ flex: 1 }} />
        <button className="btn" onClick={login}>Log In</button>
        <p className="login__logout">Log me out</p>
        <div className="quick-bar">
          <button onClick={soon}><BookOpen size={17} strokeWidth={1.6} /> ePassbook</button>
          <button className="mid" onClick={soon}><QrCode size={18} strokeWidth={1.6} /> Pay</button>
          <button onClick={soon}><ScanFace size={17} strokeWidth={1.6} /> Peek Balance</button>
        </div>
      </div>
    </div>
  )
}
