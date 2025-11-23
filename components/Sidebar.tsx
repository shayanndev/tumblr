'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Plus, LogOut, MessageCircle, Users } from 'lucide-react'

interface SidebarProps {
  user: User
  selectedChat: { type: 'dm' | 'group'; id: string; name: string } | null
  onSelectChat: (chat: { type: 'dm' | 'group'; id: string; name: string } | null) => void
  isAdmin: boolean
  onLogout: () => void
}

interface OnlineUser {
  id: string
  username: string
  email: string
  is_online: boolean
}

interface Group {
  id: string
  name: string
  created_by: string
}

export default function Sidebar({ user, selectedChat, onSelectChat, isAdmin, onLogout }: SidebarProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
    loadGroups()
    subscribeToPresence()
    subscribeToGroups()

    // Set user as online
    updatePresence(true)

    // Cleanup on unmount
    return () => {
      updatePresence(false)
    }
  }, [user])

  const updatePresence = async (isOnline: boolean) => {
    await supabase
      .from('profiles')
      .update({ is_online: isOnline, last_seen: new Date().toISOString() })
      .eq('id', user.id)
  }

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, email, is_online')
      .neq('id', user.id)
      .order('username')

    if (data) {
      setOnlineUsers(data)
    }
  }

  const loadGroups = async () => {
    const { data } = await supabase
      .from('group_members')
      .select('group_id, groups(id, name, created_by)')
      .eq('user_id', user.id)

    if (data) {
      const groupList = data
        .map((item: any) => item.groups)
        .filter(Boolean) as Group[]
      setGroups(groupList)
    }
  }

  const subscribeToPresence = () => {
    const channel = supabase
      .channel('presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          loadUsers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const subscribeToGroups = () => {
    const channel = supabase
      .channel('groups')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_members',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadGroups()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return

    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        name: newGroupName,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating group:', error)
      return
    }

    // Add creator as member
    await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
      })

    setNewGroupName('')
    setShowCreateGroup(false)
    loadGroups()
  }

  return (
    <div className="w-full md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen">
      <div className="p-2 md:p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <h2 className="text-base md:text-lg font-bold">tumblR</h2>
          <button
            onClick={onLogout}
            className="p-1.5 md:p-2 hover:bg-gray-800 rounded-lg transition"
            title="Logout"
          >
            <LogOut size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateGroup(!showCreateGroup)}
            className="w-full flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs md:text-sm font-medium transition"
          >
            <Plus size={14} className="md:w-4 md:h-4" />
            <span className="hidden md:inline">Create Group</span>
            <span className="md:hidden">New</span>
          </button>
        )}
        {showCreateGroup && (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
            />
            <button
              onClick={handleCreateGroup}
              className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-green-600 hover:bg-green-700 rounded-lg text-xs md:text-sm font-medium transition"
            >
              Create
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-1 md:p-2">
          <h3 className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase px-1 md:px-2 mb-1 md:mb-2">Direct Messages</h3>
          {onlineUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => onSelectChat({ type: 'dm', id: u.id, name: u.username })}
              className={`w-full flex items-center gap-1.5 md:gap-2 px-1.5 md:px-2 py-1.5 md:py-2 rounded-lg mb-0.5 md:mb-1 transition ${
                selectedChat?.type === 'dm' && selectedChat.id === u.id
                  ? 'bg-blue-600'
                  : 'hover:bg-gray-800'
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-700 flex items-center justify-center text-[10px] md:text-xs font-medium">
                  {u.username[0].toUpperCase()}
                </div>
                {u.is_online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                )}
              </div>
              <span className="text-xs md:text-sm flex-1 text-left truncate">{u.username}</span>
            </button>
          ))}
        </div>

        <div className="p-1 md:p-2 border-t border-gray-800">
          <h3 className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase px-1 md:px-2 mb-1 md:mb-2">Groups</h3>
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => onSelectChat({ type: 'group', id: group.id, name: group.name })}
              className={`w-full flex items-center gap-1.5 md:gap-2 px-1.5 md:px-2 py-1.5 md:py-2 rounded-lg mb-0.5 md:mb-1 transition ${
                selectedChat?.type === 'group' && selectedChat.id === group.id
                  ? 'bg-blue-600'
                  : 'hover:bg-gray-800'
              }`}
            >
              <Users size={14} className="md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs md:text-sm flex-1 text-left truncate">{group.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


