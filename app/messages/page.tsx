"use client"
import { Suspense, useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useRealtimeMessages } from "@/lib/hooks/useRealtimeMessages"
import { validateAudioFile, validateFileSize, validateImageFile } from "@/lib/validation"
import ReportButton from "@/components/ReportButton"

// Helper function for relative time formatting
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
  
  // For older messages, show the date
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

type Conversation = {
  id: number
  otherUser: {
    id: number
    name: string | null
    avatarUrl: string | null
  }
  lastMessage?: {
    content: string
    createdAt: string
    senderId: number
  }
  unreadCount: number
}

function MessagesPageInner() {
  const searchParams = useSearchParams()
  const conversationParam = searchParams.get('conversation')
  const userParam = searchParams.get('user')
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null)
  const [creatingConversation, setCreatingConversation] = useState(false)
  
  const { messages, loading: messagesLoading } = useRealtimeMessages(selectedConversationId)

  const MAX_IMAGE_MB = 8
  const MAX_AUDIO_MB = 12

  // Function to fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages")
      const data = await res.json()
      if (data.data) {
        setConversations(data.data)
        return data.data
      }
      return []
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
      return []
    }
  }

  // Handle ?user= parameter - create/find conversation with that user
  useEffect(() => {
    if (userParam && !creatingConversation) {
      const userId = parseInt(userParam)
      if (!isNaN(userId)) {
        setCreatingConversation(true)
        
        // Create FormData for the API
        const formData = new FormData()
        formData.append('sellerId', userId.toString())
        
        fetch('/api/conversations/create', {
          method: 'POST',
          body: formData
        })
          .then(res => res.json())
          .then(async (data) => {
            if (data.redirect) {
              // Extract conversation ID from redirect URL and set it
              const match = data.redirect.match(/conversation=(\d+)/)
              if (match) {
                const convId = parseInt(match[1])
                // Refetch conversations to include the new/found one
                await fetchConversations()
                setSelectedConversationId(convId)
                // Update URL without the user param
                window.history.replaceState({}, '', `/messages?conversation=${convId}`)
              }
            }
          })
          .catch(console.error)
          .finally(() => setCreatingConversation(false))
      }
    }
  }, [userParam])

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations().then(convs => {
      // Auto-select conversation from URL parameter
      if (conversationParam) {
        const convId = parseInt(conversationParam)
        if (!isNaN(convId) && convs.some((c: Conversation) => c.id === convId)) {
          setSelectedConversationId(convId)
        }
      }
    })
  }, [conversationParam])

  // Auto-scroll to bottom only when user is near bottom or sending
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const previousMessagesLengthRef = useRef(0)
  const lastMessageIdRef = useRef<number | null>(null)

  useEffect(() => {
    // Only auto-scroll if:
    // 1. User is near bottom
    // 2. There's a genuinely NEW message (different last message ID)
    const lastMessage = messages[messages.length - 1]
    const hasNewMessage = lastMessage && lastMessage.id !== lastMessageIdRef.current
    
    if (isNearBottom && hasNewMessage && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
    
    // Update refs
    if (lastMessage) {
      lastMessageIdRef.current = lastMessage.id
    }
    previousMessagesLengthRef.current = messages.length
  }, [messages, isNearBottom])

  // Track scroll position to determine if user is reading history
  const handleScroll = () => {
    if (!messagesContainerRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    
    // If user is within 100px of bottom, enable auto-scroll
    setIsNearBottom(distanceFromBottom < 100)
  }

  const selectedConversation = conversations.find(c => c.id === selectedConversationId)

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedConversationId || sending) return

    // If there's a photo selected, send the photo instead
    if (selectedPhoto) {
      await sendPhoto()
      return
    }

    // If there's no text, don't send
    if (!newMessage.trim()) return

    setSending(true)
    // Force scroll to bottom when sending a message
    setIsNearBottom(true)
    try {
      await fetch(`/api/messages/${selectedConversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage })
      })
      setNewMessage("")
    } catch (err) {
      console.error("Failed to send message:", err)
    } finally {
      setSending(false)
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !selectedConversationId) return

    // Create preview URL
    if (!validateImageFile(file)) {
      alert('Please choose a JPG, PNG, GIF, or WEBP image.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (!validateFileSize(file, MAX_IMAGE_MB)) {
      alert(`Images must be ${MAX_IMAGE_MB}MB or less.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
    }

    const previewUrl = URL.createObjectURL(file)
    setSelectedPhoto(file)
    setPhotoPreview(previewUrl)
  }

  async function sendPhoto() {
    if (!selectedPhoto || !selectedConversationId) return

    setUploading(true)
    // Force scroll to bottom when sending media
    setIsNearBottom(true)
    try {
      // Upload file
      const formData = new FormData()
      formData.append('file', selectedPhoto)
      formData.append('type', 'photo')

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      if (!uploadRes.ok) {
        const errorPayload = await uploadRes.json().catch(() => ({}))
        throw new Error(errorPayload.error || 'Upload failed')
      }

      const uploadData = await uploadRes.json()

      if (!uploadData.data?.url) {
        throw new Error('Failed to upload photo')
      }

      // Send message with photo URL and optional text content
      const res = await fetch(`/api/messages/${selectedConversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageType: 'PHOTO',
          mediaUrl: uploadData.data.url,
          content: newMessage.trim() || undefined  // Include text if provided
        })
      })

      if (res.ok) {
        // Clear preview, selection, and message text
        cancelPhoto()
        setNewMessage("")
      }
    } catch (error) {
      console.error('Photo upload failed:', error)
      const message = error instanceof Error ? error.message : 'Failed to send photo'
      alert(message)
    } finally {
      setUploading(false)
    }
  }

  function cancelPhoto() {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
    }
    setSelectedPhoto(null)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: Blob[] = []
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Update recording time every second
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Failed to access microphone. Please grant permission.')
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  async function sendVoiceMessage() {
    if (!audioBlob || !selectedConversationId) return

    setUploading(true)
    // Force scroll to bottom when sending media
    setIsNearBottom(true)
    try {
      // Create a File object from the Blob
      const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' })

      if (!validateAudioFile(audioFile)) {
        throw new Error('Unsupported audio type. Please record in webm, mp3, wav, or ogg.')
      }

      if (!validateFileSize(audioFile, MAX_AUDIO_MB)) {
        throw new Error(`Voice messages must be ${MAX_AUDIO_MB}MB or less.`)
      }
      
      // Upload file
      const formData = new FormData()
      formData.append('file', audioFile)
      formData.append('type', 'voice')

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      if (!uploadRes.ok) {
        const errorPayload = await uploadRes.json().catch(() => ({}))
        throw new Error(errorPayload.error || 'Upload failed')
      }

      const uploadData = await uploadRes.json()

      if (!uploadData.data?.url) {
        throw new Error('Failed to upload voice message')
      }

      // Send message with audio URL
      const res = await fetch(`/api/messages/${selectedConversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageType: 'VOICE',
          mediaUrl: uploadData.data.url
        })
      })

      if (res.ok) {
        cancelVoiceMessage()
      }
    } catch (error) {
      console.error('Voice message upload failed:', error)
      const message = error instanceof Error ? error.message : 'Failed to send voice message'
      alert(message)
    } finally {
      setUploading(false)
    }
  }

  function cancelVoiceMessage() {
    setAudioBlob(null)
    setRecordingTime(0)
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
  }

  async function unsendMessage(messageId: number) {
    if (!confirm('Are you sure you want to unsend this message?')) return

    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error('Failed to unsend message')
      }

      // Message will be removed via realtime update
    } catch (error) {
      console.error('Failed to unsend message:', error)
      alert('Failed to unsend message')
    }
  }

  // Format recording time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full flex flex-col pb-20 md:pb-0 px-3 md:px-0 h-[calc(100vh-120px)] md:h-[calc(100vh-140px)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 h-full min-h-0">
        {/* Conversations List */}
        <div className={`${selectedConversationId ? 'hidden md:block' : 'block'} md:col-span-1 bg-[var(--card-bg)] rounded-xl border border-border flex flex-col overflow-hidden h-full`}>
          <div className="p-3 md:p-4 border-b border-border flex-shrink-0">
            <h2 className="text-lg md:text-xl font-bold text-foreground">Messages</h2>
          </div>
          
          {conversations.length === 0 ? (
            <div className="p-6 md:p-8 text-center text-foreground-secondary overflow-y-auto">
              <p className="text-sm md:text-base">No conversations yet</p>
              <p className="text-xs md:text-sm mt-2">Start chatting by viewing a listing</p>
            </div>
          ) : (
            <div className="divide-y divide-border overflow-y-auto flex-1 min-h-0">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`w-full p-3 md:p-4 text-left hover:bg-[var(--background-elevated)] transition-colors ${
                    selectedConversationId === conv.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {conv.otherUser.avatarUrl ? (
                        <img 
                          src={conv.otherUser.avatarUrl} 
                          alt={conv.otherUser.name || 'User'}
                          className="w-11 h-11 md:w-12 md:h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-base md:text-lg">
                          {(conv.otherUser.name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      {/* Online indicator placeholder - could be used later */}
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-[var(--card-bg)]" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-semibold truncate text-sm md:text-base ${conv.unreadCount > 0 ? 'text-foreground' : 'text-foreground'}`}>
                          {conv.otherUser.name || 'User'}
                        </p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {conv.lastMessage && (
                            <span className="text-[10px] md:text-xs text-foreground-secondary">
                              {formatRelativeTime(conv.lastMessage.createdAt)}
                            </span>
                          )}
                          {conv.unreadCount > 0 && (
                            <span className="bg-primary text-white text-[10px] md:text-xs font-medium rounded-full min-w-[18px] h-[18px] md:min-w-[20px] md:h-[20px] flex items-center justify-center px-1">
                              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className={`text-xs md:text-sm truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-foreground-secondary font-medium' : 'text-foreground-secondary/70'}`}>
                        {conv.lastMessage ? (
                          conv.lastMessage.content.startsWith('[Image]') || conv.lastMessage.content.startsWith('[Audio]') 
                            ? conv.lastMessage.content 
                            : conv.lastMessage.content
                        ) : (
                          <span className="italic">No messages yet</span>
                        )}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Messages Thread */}
        <div className={`${selectedConversationId ? 'block' : 'hidden md:block'} md:col-span-2 bg-[var(--card-bg)] rounded-xl border border-border flex flex-col h-full overflow-hidden`}>
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center text-foreground-secondary">
              <div className="text-center px-4">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-base md:text-lg font-medium text-foreground mb-1">Select a conversation</p>
                <p className="text-xs md:text-sm text-foreground-secondary">Choose a chat from the list to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-3 md:p-4 border-b border-border flex items-center gap-2 md:gap-3">
                {/* Back button for mobile */}
                <button
                  onClick={() => setSelectedConversationId(null)}
                  className="md:hidden p-1.5 hover:bg-[var(--background-elevated)] rounded-lg transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <Link href={`/profile/${selectedConversation.otherUser.id}`} className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition">
                  {selectedConversation.otherUser.avatarUrl ? (
                    <img 
                      src={selectedConversation.otherUser.avatarUrl} 
                      alt={selectedConversation.otherUser.name || 'User'}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm md:text-base">
                      {(selectedConversation.otherUser.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground text-sm md:text-base hover:text-primary transition">{selectedConversation.otherUser.name || 'User'}</h3>
                  </div>
                </Link>
              </div>

              {/* Messages */}
              <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 min-h-0"
              >
                {messagesLoading ? (
                  <div className="text-center text-foreground-secondary text-sm md:text-base">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-foreground-secondary text-sm md:text-base">No messages yet. Start the conversation!</div>
                ) : (
                  <>
                    {messages.map((msg) => {
                      const isOwn = msg.sender.id !== selectedConversation.otherUser.id
                      return (
                        <div 
                          key={msg.id} 
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                          onMouseEnter={() => setHoveredMessageId(msg.id)}
                          onMouseLeave={() => setHoveredMessageId(null)}
                        >
                          <div className="relative">
                            <div className={`rounded-lg p-2 md:p-3 max-w-[85%] md:max-w-none ${
                              isOwn ? 'bg-primary text-white' : 'bg-[var(--background-elevated)] text-foreground'
                            }`}>
                              {/* Display based on message type */}
                              {msg.messageType === 'PHOTO' && msg.mediaUrl && (
                                <img 
                                  src={msg.mediaUrl} 
                                  alt="Photo message" 
                                  className="rounded max-w-full h-auto mb-2"
                                  style={{ maxWidth: '250px' }}
                                />
                              )}
                              {msg.messageType === 'VOICE' && msg.mediaUrl && (
                                <audio controls className="mb-2 w-full" style={{ maxWidth: '250px' }}>
                                  <source src={msg.mediaUrl} />
                                </audio>
                              )}
                              {msg.content && <p className="text-xs md:text-sm break-words">{msg.content}</p>}
                              <p className={`text-xs mt-1 ${isOwn ? 'text-white/80' : 'text-foreground-secondary'}`}>
                                {(() => {
                                  // Ensure proper UTC parsing - if timestamp doesn't end in Z, add it
                                  let timestampStr = msg.createdAt
                                  if (!timestampStr.endsWith('Z') && !timestampStr.includes('+') && !timestampStr.includes('T')) {
                                    timestampStr = timestampStr.replace(' ', 'T') + 'Z'
                                  } else if (timestampStr.includes('T') && !timestampStr.endsWith('Z') && !timestampStr.includes('+')) {
                                    timestampStr += 'Z'
                                  }
                                  
                                  const messageDate = new Date(timestampStr)
                                  const now = new Date()
                                  const isToday = messageDate.toDateString() === now.toDateString()
                                  
                                  if (isToday) {
                                    return messageDate.toLocaleString('en-US', { 
                                      hour: 'numeric', 
                                      minute: '2-digit',
                                      hour12: true
                                    })
                                  } else {
                                    return messageDate.toLocaleString('en-US', { 
                                      month: 'short',
                                      day: 'numeric',
                                      hour: 'numeric', 
                                      minute: '2-digit',
                                      hour12: true
                                    })
                                  }
                                })()}
                              </p>
                            </div>
                            {/* Unsend button - only show for own messages on hover */}
                            {isOwn && hoveredMessageId === msg.id && (
                              <button
                                onClick={() => unsendMessage(msg.id)}
                                className="hidden md:block absolute -left-20 top-1/2 -translate-y-1/2 text-xs text-foreground-secondary hover:text-error px-2 py-1 rounded hover:bg-[var(--background-elevated)] transition"
                                title="Unsend message"
                              >
                                Unsend
                              </button>
                            )}
                            {/* Report button - only show for other user's messages on hover */}
                            {!isOwn && hoveredMessageId === msg.id && (
                              <div className="hidden md:block absolute -right-16 top-1/2 -translate-y-1/2">
                                <ReportButton 
                                  contentType="message" 
                                  contentId={msg.id} 
                                  size="sm"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Photo Preview */}
              {photoPreview && (
                <div className="p-3 md:p-4 border-t border-border bg-[var(--background-elevated)]">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="h-16 w-16 md:h-20 md:w-20 rounded-lg object-cover border-2 border-primary"
                      />
                      <button
                        type="button"
                        onClick={cancelPhoto}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center hover:bg-red-600 transition shadow-lg text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Photo attached</p>
                      <p className="text-xs text-foreground-secondary mt-0.5">Add a message below and press Send</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Voice Recording Preview */}
              {audioBlob && !isRecording && (
                <div className="p-3 md:p-4 border-t border-border bg-[var(--background-elevated)]">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
                    <audio controls src={URL.createObjectURL(audioBlob)} className="flex-1 w-full" />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={cancelVoiceMessage}
                        className="flex-1 sm:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-border hover:bg-[var(--background-elevated)] text-foreground transition text-sm md:text-base"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={sendVoiceMessage}
                        disabled={uploading}
                        className="flex-1 sm:flex-none bg-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-md font-medium text-sm md:text-base"
                      >
                        {uploading ? 'Sending...' : 'Send Voice'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Recording Indicator */}
              {isRecording && (
                <div className="p-3 md:p-4 border-t border-border bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-red-600 dark:text-red-400 font-medium text-xs md:text-sm">Recording... {formatTime(recordingTime)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="bg-red-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-red-700 font-medium text-sm md:text-base"
                    >
                      Stop
                    </button>
                  </div>
                </div>
              )}

              {/* Input */}
              <form onSubmit={sendMessage} className="p-3 md:p-4 border-t dark:border-gray-700">
                <div className="flex gap-1.5 md:gap-2">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  
                  {/* Photo upload button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || sending || isRecording}
                    className="px-2 md:px-4 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    title="Send photo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>

                  {/* Voice recording button */}
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={uploading || sending}
                    className={`px-2 md:px-4 py-2 rounded-lg border transition ${
                      isRecording 
                        ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/50' 
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isRecording ? "Stop recording" : "Record voice message"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={uploading ? "Uploading..." : isRecording ? "Recording..." : selectedPhoto ? "Add a caption (optional)..." : "Type a message..."}
                    className="flex-1 rounded-lg border dark:border-gray-700 px-3 md:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 text-sm md:text-base"
                    disabled={sending || uploading || isRecording}
                  />
                  <button
                    type="submit"
                    disabled={(!newMessage.trim() && !selectedPhoto) || sending || uploading || isRecording}
                    className="bg-blue-600 text-white px-3 md:px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm md:text-base"
                  >
                    <span className="hidden sm:inline">{sending ? 'Sending...' : uploading ? 'Uploading...' : 'Send'}</span>
                    <span className="sm:hidden">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-[60vh] place-items-center p-8 text-foreground-secondary">
          <p>Loading messages…</p>
        </main>
      }
    >
      <MessagesPageInner />
    </Suspense>
  )
}
