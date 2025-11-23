'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import Sidebar from './Sidebar'
import ChatWindow from './ChatWindow'
import { useRouter } from 'next/navigation'

interface ChatAppProps {
  user: User
}

export default function ChatApp({ user }: ChatAppProps) {
  const [selectedChat, setSelectedChat] = useState<{ type: 'dm' | 'group'; id: string; name: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const checkAdminStatus = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (data) {
      setIsAdmin(data.is_admin)
    }
  }, [user.id, supabase])

  useEffect(() => {
    checkAdminStatus()
  }, [checkAdminStatus])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-black text-white overflow-hidden">
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} flex-shrink-0`}>
        <Sidebar
          user={user}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow
          user={user}
          selectedChat={selectedChat}
          isAdmin={isAdmin}
          onBackToSidebar={() => setSelectedChat(null)}
        />
      </div>
    </div>
  )
}


