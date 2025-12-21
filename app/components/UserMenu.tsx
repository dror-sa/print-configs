'use client'

import { useSession, signOut } from "next-auth/react"

export default function UserMenu() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px', // צד שמאל כי האתר בעברית (RTL)
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: '#f5f5f5',
      padding: '8px 12px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
        <span style={{ fontWeight: 'bold' }}>{session.user?.name}</span>
        <span style={{ color: '#666' }}>{session.user?.email}</span>
      </div>
      {session.user?.image && (
        <img 
          src={session.user.image} 
          alt="Profile" 
          style={{ width: '32px', height: '32px', borderRadius: '50%' }}
        />
      )}
      <button
        onClick={() => signOut()}
        style={{
          background: '#ff4444',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        התנתק
      </button>
    </div>
  )
}

