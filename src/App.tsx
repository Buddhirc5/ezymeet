import { useEffect, useState } from 'react'
import { AppProvider, useApp, type Route } from './store'
import { StatusBar, Toast } from './components/ui'
import Login from './screens/Login'
import Home from './screens/Home'
import MeetHub from './screens/MeetHub'
import BranchSelect from './screens/BranchSelect'
import SlotSelect from './screens/SlotSelect'
import VirtualBook from './screens/VirtualBook'
import Confirmation from './screens/Confirmation'
import Appointments from './screens/Appointments'
import VideoCall from './screens/VideoCall'
import logo from './assets/ezy-logo.png'

function renderRoute(r: Route) {
  switch (r.name) {
    case 'login': return <Login />
    case 'home': return <Home />
    case 'meet': return <MeetHub tab={r.tab} />
    case 'branch': return <BranchSelect serviceId={r.serviceId} rescheduleId={r.rescheduleId} />
    case 'slot': return <SlotSelect serviceId={r.serviceId} branchId={r.branchId} rescheduleId={r.rescheduleId} />
    case 'vbook': return <VirtualBook topicId={r.topicId} rescheduleId={r.rescheduleId} />
    case 'done': return <Confirmation apptId={r.apptId} rescheduled={r.rescheduled} />
    case 'appointments': return <Appointments />
    case 'call': return <VideoCall topicId={r.topicId} />
  }
}

function Screen() {
  const { route } = useApp()
  return (
    <div className="screen">
      <StatusBar dark={route.name === 'call'} />
      <div key={JSON.stringify(route)} style={{ position: 'absolute', inset: 0 }}>
        {renderRoute(route)}
      </div>
      <Toast />
      <div className="home-indicator" style={route.name === 'call' ? { background: '#fff' } : undefined} />
    </div>
  )
}

/** Scale the 956px-tall device frame down to fit shorter desktop windows. */
function useFrameZoom() {
  const calc = () => (window.innerWidth > 560 ? Math.min(1, (window.innerHeight - 40) / 956) : 1)
  const [zoom, setZoom] = useState(calc)
  useEffect(() => {
    const onResize = () => setZoom(calc())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return zoom
}

export default function App() {
  const zoom = useFrameZoom()
  return (
    <AppProvider>
      <main className="stage">
        <aside className="stage__intro">
          <img src={logo} alt="Pan Asia EZY" />
          <h1>Pan Asia<br /><span>EZY Meet</span></h1>
          <p>Smart branch visit scheduling and virtual advisory, inside the Pan Asia EZY mobile banking app.</p>
          <p>Log in → tap <b>EZY Meet</b> → pick a service → book the recommended slot.</p>
          <small>Prototype · designed for iPhone 15 Pro Max (430 × 932). Open on your phone for full screen.</small>
        </aside>
        <div className="device" style={zoom < 1 ? { zoom } : undefined}>
          <Screen />
        </div>
      </main>
    </AppProvider>
  )
}
