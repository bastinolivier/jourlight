'use client'

import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="w-full text-left text-xs px-3 py-2 rounded-lg transition-colors hover:text-white"
      style={{ color: '#6b6b88', background: '#0a0a0f' }}
    >
      Se déconnecter
    </button>
  )
}
