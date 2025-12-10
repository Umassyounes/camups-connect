'use client'

export const runtime = 'nodejs'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FlaggedContentItem {
  id: number
  contentType: 'listing' | 'message' | 'profile' | 'event'
  contentId: number
  userId: number
  reason: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'approved' | 'rejected' | 'deleted'
  source: 'auto' | 'user_report' | 'admin'
  details: any
  createdAt: string
  user?: {
    id: number
    name: string | null
  }
}

interface ModerationLogItem {
  id: number
  adminId: number
  action: string
  targetType: string
  targetId: number
  details: any
  createdAt: string
  admin?: {
    id: number
    name: string | null
  }
}

interface Stats {
  overview: {
    totalFlags: number
    pendingFlags: number
    rejectedFlags: number
    deletedContent: number
    totalStrikes: number
    activeStrikes: number
    suspendedUsers: number
    totalReports: number
    pendingReports: number
    flagsToday: number
  }
  severity: Record<string, number>
  contentType: Record<string, number>
  recentActions?: ModerationLogItem[]
}

interface UserReportItem {
  id: number
  reporterId: number
  contentType: 'listing' | 'message' | 'profile' | 'event'
  contentId: number
  category: string
  description: string | null
  status: 'pending' | 'reviewed' | 'dismissed'
  createdAt: string
  reporter?: {
    id: number
    name: string | null
  }
}

export default function AdminModerationPage() {
  const router = useRouter()
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContentItem[]>([])
  const [userReports, setUserReports] = useState<UserReportItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [severityFilter, setSeverityFilter] = useState<string>('')
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<FlaggedContentItem | null>(null)
  const [selectedReport, setSelectedReport] = useState<UserReportItem | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<'flags' | 'reports' | 'log'>('flags')

  useEffect(() => {
    fetchData()
  }, [statusFilter, severityFilter, contentTypeFilter])

  async function fetchData() {
    try {
      setLoading(true)
      
      // Fetch flagged content
      const params = new URLSearchParams()
      // Only add filters if they have a non-empty value
      if (statusFilter && statusFilter !== '') params.append('status', statusFilter)
      if (severityFilter && severityFilter !== '') params.append('severity', severityFilter)
      if (contentTypeFilter && contentTypeFilter !== '') params.append('contentType', contentTypeFilter)
      
      const flagsRes = await fetch(`/api/admin/flagged-content?${params}`)
      const flagsData = await flagsRes.json()
      
      if (flagsRes.status === 403) {
        alert('You do not have admin access')
        router.push('/')
        return
      }
      
      if (flagsRes.ok) {
        setFlaggedContent(flagsData.data || [])
      }

      // Fetch stats
      const statsRes = await fetch('/api/admin/stats')
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }

      // Fetch user reports
      const reportsRes = await fetch('/api/admin/user-reports')
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json()
        setUserReports(reportsData.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleReviewReport(reportId: number, action: 'reviewed' | 'dismissed' | 'escalate') {
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/user-reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reportId,
          action,
          notes: reviewNotes,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to process report')
      }

      alert(`Report ${action} successfully!`)
      setSelectedReport(null)
      setReviewNotes('')
      fetchData()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setProcessing(false)
    }
  }

  async function handleDeleteFromQueue(id: number) {
    if (!confirm('Are you sure you want to remove this from the flagged content queue? This will not delete the actual content.')) {
      return
    }
    
    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/flagged-content?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to remove from queue')
      }

      alert('Removed from queue successfully!')
      setSelectedItem(null)
      fetchData()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setProcessing(false)
    }
  }

  async function handleReview(
    id: number,
    status: 'approved' | 'rejected' | 'deleted',
    deleteContent: boolean = false,
    issueStrike: boolean = false
  ) {
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/flagged-content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          reviewNotes,
          deleteContent,
          issueStrike,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to review content')
      }

      alert(`Content ${status} successfully!`)
      setSelectedItem(null)
      setReviewNotes('')
      fetchData()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setProcessing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-foreground">Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/admin"
            className="text-primary hover:underline mb-2 inline-block"
          >
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            🛡️ Moderation Dashboard
          </h1>
          <p className="text-foreground-secondary">
            Review flagged content, user reports, and moderation history.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push('/admin/users')}
            className="px-4 py-2 border border-border text-sm font-medium rounded-md hover:bg-background-secondary transition-colors text-foreground"
          >
            User Management
          </button>
          <button
            onClick={() => router.push('/admin/prohibited-items')}
            className="px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 transition-colors font-medium"
          >
            Manage Prohibited Items
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.overview.pendingFlags}</div>
            <div className="text-sm text-foreground-secondary">Pending Flags</div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overview.deletedContent}</div>
            <div className="text-sm text-foreground-secondary">Deleted Content</div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.overview.activeStrikes}</div>
            <div className="text-sm text-foreground-secondary">Active Strikes</div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.overview.suspendedUsers}</div>
            <div className="text-sm text-foreground-secondary">Suspended Users</div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.overview.pendingReports}</div>
            <div className="text-sm text-foreground-secondary">Pending Reports</div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.overview.flagsToday}</div>
            <div className="text-sm text-foreground-secondary">Flags Today</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('flags')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'flags'
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground-secondary hover:text-foreground'
            }`}
          >
            Flagged Content ({flaggedContent.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'reports'
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground-secondary hover:text-foreground'
            }`}
          >
            User Reports ({userReports.length})
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'log'
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground-secondary hover:text-foreground'
            }`}
          >
            Moderation Log
          </button>
        </nav>
      </div>

      {/* Flagged Content Tab */}
      {activeTab === 'flags' && (
        <>
          {/* Filters */}
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Severity</label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="">All</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Content Type</label>
                <select
                  value={contentTypeFilter}
                  onChange={(e) => setContentTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="">All</option>
                  <option value="listing">Listings</option>
                  <option value="message">Messages</option>
                  <option value="profile">Profiles</option>
                  <option value="event">Events</option>
                </select>
              </div>
            </div>
          </div>

          {/* Flagged Content List */}
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Flagged Content Queue ({flaggedContent.length})</h2>
            </div>
            
            <div className="divide-y divide-border">
              {flaggedContent.length === 0 ? (
                <div className="p-8 text-center text-foreground-secondary">
                  No flagged content found with current filters
                </div>
              ) : (
                flaggedContent.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-background-secondary/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(item.severity)}`}>
                            {item.severity.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-background-secondary text-foreground-secondary">
                            {item.contentType}
                          </span>
                          <span className="text-xs text-foreground-secondary">
                            Source: {item.source}
                          </span>
                        </div>
                        <div className="font-medium text-foreground mb-1">
                          {item.reason}
                        </div>
                        <div className="text-sm text-foreground-secondary">
                          User: {item.user?.name || 'Unknown'} (ID: {item.userId}) • 
                          Content ID: {item.contentId} • 
                          {formatDate(item.createdAt)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm transition-colors font-medium"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleDeleteFromQueue(item.id)}
                          className="px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-sm transition-colors"
                          title="Remove from queue"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* User Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">User Reports ({userReports.length})</h2>
            <p className="text-sm text-foreground-secondary mt-1">Reports submitted by users about problematic content or behavior</p>
          </div>
          
          {/* Stats */}
          <div className="p-4 border-b border-border">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-background-secondary rounded-lg p-4">
                <div className="text-2xl font-bold text-foreground">{stats?.overview.totalReports || 0}</div>
                <div className="text-sm text-foreground-secondary">Total Reports</div>
              </div>
              <div className="bg-background-secondary rounded-lg p-4">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats?.overview.pendingReports || 0}</div>
                <div className="text-sm text-foreground-secondary">Pending Review</div>
              </div>
              <div className="bg-background-secondary rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{(stats?.overview.totalReports || 0) - (stats?.overview.pendingReports || 0)}</div>
                <div className="text-sm text-foreground-secondary">Resolved</div>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="divide-y divide-border">
            {userReports.length === 0 ? (
              <div className="p-8 text-center text-foreground-secondary">
                <div className="text-4xl mb-4">📭</div>
                <p>No user reports have been submitted yet.</p>
                <p className="text-sm mt-2">Reports from users will appear here for review.</p>
              </div>
            ) : (
              userReports.map((report) => (
                <div key={report.id} className="p-4 hover:bg-background-secondary/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          report.status === 'pending' 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            : report.status === 'reviewed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {report.status.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {report.category}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-background-secondary text-foreground-secondary">
                          {report.contentType}
                        </span>
                      </div>
                      <div className="font-medium text-foreground mb-1">
                        {report.contentType.charAt(0).toUpperCase() + report.contentType.slice(1)} #{report.contentId}
                      </div>
                      {report.description && (
                        <div className="text-sm text-foreground-secondary mb-1 italic">
                          &quot;{report.description}&quot;
                        </div>
                      )}
                      <div className="text-sm text-foreground-secondary">
                        Reported by: {report.reporter?.name || 'Unknown'} (ID: {report.reporterId}) • 
                        {formatDate(report.createdAt)}
                      </div>
                    </div>
                    {report.status === 'pending' && (
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm transition-colors font-medium"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Moderation Log Tab */}
      {activeTab === 'log' && (
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Moderation Activity Log</h2>
            <p className="text-sm text-foreground-secondary mt-1">Audit trail of all admin and moderator actions</p>
          </div>
          
          <div className="divide-y divide-border">
            {!stats?.recentActions || stats.recentActions.length === 0 ? (
              <div className="p-8 text-center text-foreground-secondary">
                <div className="text-4xl mb-4">📋</div>
                <p>No moderation actions recorded yet.</p>
                <p className="text-sm mt-2">Actions like content deletion, user suspension, and reviews will be logged here.</p>
              </div>
            ) : (
              stats.recentActions.map((action) => (
                <div key={action.id} className="p-4 hover:bg-background-secondary/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">
                          {action.admin?.name || 'Admin'}
                        </span>
                        <span className="text-foreground-secondary">performed</span>
                        <span className="px-2 py-0.5 bg-background-secondary rounded text-sm font-mono text-foreground">
                          {action.action}
                        </span>
                      </div>
                      <div className="text-sm text-foreground-secondary">
                        Target: {action.targetType} #{action.targetId}
                        {action.details && (
                          <span className="ml-2 text-xs">
                            • {typeof action.details === 'string' ? action.details : JSON.stringify(action.details).slice(0, 50)}...
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-foreground-secondary">
                      {formatDate(action.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div 
            className="rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{
              backgroundColor: 'var(--card, #ffffff)',
              border: '1px solid var(--border, #e5e7eb)',
              color: 'var(--foreground, #111827)'
            }}
          >
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground, #111827)' }}>Review Flagged Content</h3>
            
            <div className="space-y-3 mb-6" style={{ color: 'var(--foreground, #111827)' }}>
              <div>
                <span className="font-medium">Content Type:</span> {selectedItem.contentType}
              </div>
              <div>
                <span className="font-medium">Content ID:</span> {selectedItem.contentId}
              </div>
              <div>
                <span className="font-medium">User:</span> {selectedItem.user?.name} (ID: {selectedItem.userId})
              </div>
              <div>
                <span className="font-medium">Reason:</span> {selectedItem.reason}
              </div>
              <div>
                <span className="font-medium">Severity:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${getSeverityColor(selectedItem.severity)}`}>
                  {selectedItem.severity}
                </span>
              </div>
              <div>
                <span className="font-medium">Details:</span>
                <pre 
                  className="mt-1 p-2 rounded text-xs overflow-auto"
                  style={{
                    backgroundColor: 'var(--background, #f9fafb)',
                    color: 'var(--foreground-secondary, #6b7280)'
                  }}
                >
                  {JSON.stringify(selectedItem.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-2" style={{ color: 'var(--foreground, #111827)' }}>Review Notes</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-md"
                style={{
                  backgroundColor: 'var(--background, #ffffff)',
                  color: 'var(--foreground, #111827)',
                  border: '1px solid var(--border, #e5e7eb)'
                }}
                rows={3}
                placeholder="Add notes about your decision..."
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleReview(selectedItem.id, 'approved', false, false)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                disabled={processing}
              >
                ✅ Approve
              </button>
              <button
                onClick={() => handleReview(selectedItem.id, 'rejected', false, false)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                disabled={processing}
              >
                ⚠️ Reject
              </button>
              <button
                onClick={() => handleReview(selectedItem.id, 'rejected', false, true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                disabled={processing}
              >
                🚨 Reject + Strike
              </button>
              <button
                onClick={() => handleReview(selectedItem.id, 'deleted', true, true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                disabled={processing}
              >
                🗑️ Delete + Strike
              </button>
              <button
                onClick={() => handleDeleteFromQueue(selectedItem.id)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                disabled={processing}
              >
                Remove from Queue
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                style={{
                  border: '1px solid var(--border, #e5e7eb)',
                  color: 'var(--foreground, #111827)'
                }}
                disabled={processing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Report Review Modal */}
      {selectedReport && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div 
            className="rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{
              backgroundColor: 'var(--card, #ffffff)',
              border: '1px solid var(--border, #e5e7eb)',
              color: 'var(--foreground, #111827)'
            }}
          >
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground, #111827)' }}>Review User Report</h3>
            
            <div className="space-y-3 mb-6" style={{ color: 'var(--foreground, #111827)' }}>
              <div>
                <span className="font-medium">Content Type:</span> {selectedReport.contentType}
              </div>
              <div>
                <span className="font-medium">Content ID:</span> {selectedReport.contentId}
              </div>
              <div>
                <span className="font-medium">Reported by:</span> {selectedReport.reporter?.name || 'Unknown'} (ID: {selectedReport.reporterId})
              </div>
              <div>
                <span className="font-medium">Category:</span> 
                <span className="ml-2 px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {selectedReport.category}
                </span>
              </div>
              {selectedReport.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p 
                    className="mt-1 p-2 rounded text-sm italic"
                    style={{
                      backgroundColor: 'var(--background, #f9fafb)',
                      color: 'var(--foreground-secondary, #6b7280)'
                    }}
                  >
                    &quot;{selectedReport.description}&quot;
                  </p>
                </div>
              )}
              <div>
                <span className="font-medium">Reported:</span> {formatDate(selectedReport.createdAt)}
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-2" style={{ color: 'var(--foreground, #111827)' }}>Review Notes</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-md"
                style={{
                  backgroundColor: 'var(--background, #ffffff)',
                  color: 'var(--foreground, #111827)',
                  border: '1px solid var(--border, #e5e7eb)'
                }}
                rows={3}
                placeholder="Add notes about your decision..."
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleReviewReport(selectedReport.id, 'reviewed')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                disabled={processing}
              >
                ✅ Mark Reviewed
              </button>
              <button
                onClick={() => handleReviewReport(selectedReport.id, 'escalate')}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                disabled={processing}
              >
                🚨 Escalate to Flagged
              </button>
              <button
                onClick={() => handleReviewReport(selectedReport.id, 'dismissed')}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                disabled={processing}
              >
                ❌ Dismiss
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                style={{
                  border: '1px solid var(--border, #e5e7eb)',
                  color: 'var(--foreground, #111827)'
                }}
                disabled={processing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

