import { Bell, CalendarClock, ChartColumn, CircleUser, Heart, LogOut, Mail, Phone, Settings, WalletCards } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useApp } from '../store'
import { BottomNav, NavRow } from '../components/ui'

function Item({ icon: Icon, label, onClick, danger }: { icon: LucideIcon; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <NavRow
      onClick={onClick}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 16, color: danger ? 'var(--red)' : undefined, fontWeight: 400 }}>
          <Icon size={22} strokeWidth={1.6} color={danger ? 'var(--red)' : '#3866d6'} /> {label}
        </span>
      }
    />
  )
}

export default function Menu() {
  const { push, reset, toast } = useApp()
  const soon = () => toast('Not part of the EZY Meet prototype')
  return (
    <div className="view">
      <div className="menu-head">
        <div className="avatar">S<i /></div>
        <b>Hi, Sandeepa</b>
        <Heart size={24} strokeWidth={1.7} />
        <Bell size={24} strokeWidth={1.7} />
        <Mail size={24} strokeWidth={1.7} />
      </div>
      <div className="view__scroll">
        <div className="body">
          <Item icon={CircleUser} label="Profile" onClick={soon} />
          <Item icon={CalendarClock} label="EZY Meet Appointments" onClick={() => push({ name: 'appointments' })} />
          <Item icon={ChartColumn} label="Scheduled Transactions" onClick={soon} />
          <Item icon={WalletCards} label="Service Requests" onClick={soon} />
          <Item icon={Settings} label="Settings" onClick={soon} />
          <Item icon={Phone} label="Contact Us" onClick={soon} />
          <div style={{ height: 1, background: '#eee', margin: '22px 0' }} />
          <Item icon={LogOut} label="Log Out" danger onClick={() => reset({ name: 'login' })} />
          <p className="menu-foot">EZY Meet prototype<span>Last Login 15 hours ago</span></p>
        </div>
      </div>
      <BottomNav active="menu" />
    </div>
  )
}
