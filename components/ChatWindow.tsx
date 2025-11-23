'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Send, Smile, Mic, X, UserPlus, ArrowLeft } from 'lucide-react'
import EmojiPicker, { Theme } from 'emoji-picker-react'

interface ChatWindowProps {
  user: User
  selectedChat: { type: 'dm' | 'group'; id: string; name: string } | null
  isAdmin: boolean
  onBackToSidebar?: () => void
}

interface Message {
  id: string
  content: string
  message_type: 'text' | 'emoji' | 'voice'
  sender_id: string
  sender_username?: string
  created_at: string
  group_id?: string
  recipient_id?: string
}

export default function ChatWindow({ user, selectedChat, isAdmin, onBackToSidebar }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [groupMembers, setGroupMembers] = useState<string[]>([])
  const [showAddMembers, setShowAddMembers] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; username: string }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (selectedChat) {
      loadMessages()
      subscribeToMessages()
      if (selectedChat.type === 'group') {
        loadGroupMembers()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    if (!selectedChat) return

    let query = supabase
      .from('messages')
      .select('*, profiles(username)')
      .order('created_at', { ascending: true })

    if (selectedChat.type === 'dm') {
      // Fix: Use proper PostgREST filter syntax for DM messages
      // Get messages where user is sender and other is recipient, OR user is recipient and other is sender
      const { data: sentData } = await supabase
        .from('messages')
        .select('*, profiles(username)')
        .eq('sender_id', user.id)
        .eq('recipient_id', selectedChat.id)
        .order('created_at', { ascending: true })

      const { data: receivedData } = await supabase
        .from('messages')
        .select('*, profiles(username)')
        .eq('sender_id', selectedChat.id)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: true })

      const allMessages = [
        ...(sentData || []),
        ...(receivedData || [])
      ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

      setMessages(
        allMessages.map((msg: any) => ({
          ...msg,
          sender_username: msg.profiles?.username || 'Unknown',
        }))
      )
      return
    } else {
      query = query.eq('group_id', selectedChat.id)
    }

    const { data } = await query

    if (data) {
      setMessages(
        data.map((msg: any) => ({
          ...msg,
          sender_username: msg.profiles?.username || 'Unknown',
        }))
      )
    }
  }

  const loadGroupMembers = async () => {
    if (!selectedChat || selectedChat.type !== 'group') return

    const { data } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', selectedChat.id)

    if (data) {
      setGroupMembers(data.map((m) => m.user_id))

      // Load available users for adding to group (if admin)
      if (isAdmin) {
        const { data: allUsers } = await supabase
          .from('profiles')
          .select('id, username')
          .neq('id', user.id)

        if (allUsers) {
          setAvailableUsers(allUsers.filter(u => !data.some(m => m.user_id === u.id)))
        }
      }
    } else if (isAdmin) {
      // If no members yet, all users are available
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id, username')
        .neq('id', user.id)

      if (allUsers) {
        setAvailableUsers(allUsers)
      }
    }
  }

  const subscribeToMessages = () => {
    if (!selectedChat) return

    const channel = supabase
      .channel(`messages:${selectedChat.type}:${selectedChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: selectedChat.type === 'dm'
            ? `or(and(sender_id.eq.${user.id},recipient_id.eq.${selectedChat.id}),and(sender_id.eq.${selectedChat.id},recipient_id.eq.${user.id}))`
            : `group_id=eq.${selectedChat.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', newMsg.sender_id)
            .single()

          setMessages((prev) => [
            ...prev,
            {
              ...newMsg,
              sender_username: profile?.username || 'Unknown',
            },
          ])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const sendMessage = async (type: 'text' | 'emoji' | 'voice' = 'text', content?: string) => {
    if (!selectedChat) return

    const messageContent = content || newMessage.trim()
    if (!messageContent && type !== 'voice') return

    const messageData: any = {
      sender_id: user.id,
      content: messageContent,
      message_type: type,
    }

    if (selectedChat.type === 'dm') {
      messageData.recipient_id = selectedChat.id
    } else {
      messageData.group_id = selectedChat.id
    }

    const { error } = await supabase.from('messages').insert(messageData)

    if (error) {
      console.error('Error sending message:', error)
      return
    }

    setNewMessage('')
    setShowEmojiPicker(false)
  }

  const handleVoiceMessage = () => {
    if (!('MediaRecorder' in window)) {
      alert('Voice recording is not supported in your browser')
      return
    }

    if (isRecording) {
      // Stop recording logic would go here
      setIsRecording(false)
      // For now, we'll just send a placeholder
      sendMessage('voice', '🎤 Voice message')
    } else {
      setIsRecording(true)
      // Start recording logic would go here
      // This is a simplified version - full implementation would require audio recording
    }
  }

  const handleLeaveGroup = async () => {
    if (!selectedChat || selectedChat.type !== 'group') return

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', selectedChat.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error leaving group:', error)
    } else {
      // Redirect or clear selection
      window.location.reload()
    }
  }

  const handleAddUserToGroup = async (userId: string) => {
    if (!selectedChat || selectedChat.type !== 'group' || !isAdmin) return

    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: selectedChat.id,
        user_id: userId,
      })

    if (error) {
      console.error('Error adding user to group:', error)
    } else {
      loadGroupMembers()
      setShowAddMembers(false)
    }
  }

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black text-gray-400">
        <div className="text-center">
          <p className="text-lg">Select a chat to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-black">
      <div className="bg-gray-900 border-b border-gray-800 p-2 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {onBackToSidebar && (
              <button
                onClick={onBackToSidebar}
                className="md:hidden p-1 hover:bg-gray-800 rounded-lg transition flex-shrink-0"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="min-w-0">
              <h2 className="text-base md:text-lg font-semibold truncate">{selectedChat.name}</h2>
            {selectedChat.type === 'group' && (
              <p className="text-xs text-gray-400">{groupMembers.length} members</p>
            )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedChat.type === 'group' && isAdmin && (
              <button
                onClick={() => setShowAddMembers(!showAddMembers)}
                className="p-1.5 md:p-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                title="Add members"
              >
                <UserPlus size={16} className="md:w-5 md:h-5" />
              </button>
            )}
            {selectedChat.type === 'group' && (
              <button
                onClick={handleLeaveGroup}
                className="px-2 md:px-4 py-1 md:py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs md:text-sm font-medium transition"
              >
                Leave
              </button>
            )}
          </div>
        </div>
        {showAddMembers && isAdmin && selectedChat.type === 'group' && (
          <div className="mt-2 p-2 bg-gray-800 rounded-lg border border-gray-700 max-h-40 overflow-y-auto">
            {availableUsers.length === 0 ? (
              <p className="text-xs text-gray-400 text-center">All users are already in this group</p>
            ) : (
              <div className="space-y-1">
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleAddUserToGroup(u.id)}
                    className="w-full text-left px-2 py-1.5 hover:bg-gray-700 rounded text-xs md:text-sm transition"
                  >
                    + {u.username}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-xs lg:max-w-md px-3 md:px-4 py-2 rounded-lg ${
                message.sender_id === user.id
                  ? 'bg-blue-600'
                  : 'bg-gray-800'
              }`}
            >
              {message.sender_id !== user.id && (
                <p className="text-xs font-semibold mb-1 opacity-80">
                  {message.sender_username}
                </p>
              )}
              {message.message_type === 'voice' ? (
                <div className="flex items-center gap-2">
                  <Mic size={16} />
                  <span>{message.content}</span>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              )}
              <p className="text-xs opacity-60 mt-1">
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-gray-900 border-t border-gray-800 p-2 md:p-4 relative">
        {showEmojiPicker && (
          <div className="absolute bottom-full mb-2 left-0 md:left-4 right-0 md:right-auto">
            <div className="relative max-w-full">
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="absolute top-2 right-2 z-10 p-1 bg-gray-800 rounded-full hover:bg-gray-700"
              >
                <X size={16} />
              </button>
              <div className="overflow-hidden">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    sendMessage('emoji', emojiData.emoji)
                  }}
                  theme={Theme.DARK}
                  width="100%"
                />
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
            title="Emoji"
          >
            <Smile size={20} />
          </button>
          <button
            onClick={handleVoiceMessage}
            className={`p-2 hover:bg-gray-800 rounded-lg transition ${
              isRecording ? 'bg-red-600' : ''
            }`}
            title="Voice"
          >
            <Mic size={20} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-2 md:px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          />
          <button
            onClick={() => sendMessage()}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            title="Send"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

