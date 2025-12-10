/**
 * API Route: /api/admin/user-reports
 * View and manage user-submitted reports
 * Admin/Moderator only
 */

import { NextRequest, NextResponse } from 'next/server'
import { sbServer } from '@/lib/supabase/server'
import { requireAdmin, logAdminAction } from '@/lib/admin-middleware'

export const runtime = 'nodejs'

// GET /api/admin/user-reports - List user reports
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdmin(req)
    if (authResult instanceof NextResponse) return authResult

    const supabase = await sbServer()
    const url = new URL(req.url)
    
    const status = url.searchParams.get('status')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let query = supabase
      .from('UserReport')
      .select(`
        *,
        reporter:Profile!UserReport_reporterId_fkey (
          id,
          name
        )
      `)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Failed to fetch user reports:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user reports', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      data,
      pagination: {
        total: count,
        limit,
        offset,
      }
    })
  } catch (error) {
    console.error('GET /api/admin/user-reports error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/user-reports - Review a user report
export async function PATCH(req: NextRequest) {
  try {
    const authResult = await requireAdmin(req)
    if (authResult instanceof NextResponse) return authResult
    const { admin } = authResult

    const supabase = await sbServer()
    const body = await req.json()
    const { id, action, notes } = body

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: id, action' },
        { status: 400 }
      )
    }

    // Get the report
    const { data: report, error: reportError } = await supabase
      .from('UserReport')
      .select('*')
      .eq('id', id)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    if (action === 'reviewed' || action === 'dismissed') {
      // Update report status
      const { error: updateError } = await supabase
        .from('UserReport')
        .update({
          status: action,
          reviewedAt: new Date().toISOString(),
          reviewedBy: admin.id,
          reviewNotes: notes || null,
        })
        .eq('id', id)

      if (updateError) {
        console.error('Failed to update report:', updateError)
        return NextResponse.json(
          { error: 'Failed to update report' },
          { status: 500 }
        )
      }

      // Log the action
      await logAdminAction(admin.id, `report_${action}`, 'UserReport', id, { notes })

      return NextResponse.json({ success: true, action })
    }

    if (action === 'escalate') {
      // Get content owner
      let contentOwnerId = null
      if (report.contentType === 'listing') {
        const { data } = await supabase
          .from('Listing')
          .select('sellerId')
          .eq('id', report.contentId)
          .single()
        contentOwnerId = data?.sellerId
      } else if (report.contentType === 'message') {
        const { data } = await supabase
          .from('Message')
          .select('senderId')
          .eq('id', report.contentId)
          .single()
        contentOwnerId = data?.senderId
      } else if (report.contentType === 'event') {
        const { data } = await supabase
          .from('Event')
          .select('organizerId')
          .eq('id', report.contentId)
          .single()
        contentOwnerId = data?.organizerId
      } else if (report.contentType === 'profile') {
        contentOwnerId = report.contentId
      }

      // Create flagged content item
      const { error: flagError } = await supabase.from('FlaggedContent').insert({
        contentType: report.contentType,
        contentId: report.contentId,
        userId: contentOwnerId || report.reporterId,
        reason: `User report escalated: ${report.category}${report.description ? ` - ${report.description}` : ''}`,
        severity: 'high',
        status: 'pending',
        source: 'user_report',
        details: {
          originalReportId: report.id,
          reporterId: report.reporterId,
          category: report.category,
          description: report.description,
          escalatedBy: admin.id,
          escalatedAt: new Date().toISOString(),
        },
      })

      if (flagError) {
        console.error('Failed to create flagged content:', flagError)
        return NextResponse.json(
          { error: 'Failed to escalate report' },
          { status: 500 }
        )
      }

      // Update report status
      await supabase
        .from('UserReport')
        .update({
          status: 'reviewed',
          reviewedAt: new Date().toISOString(),
          reviewedBy: admin.id,
          reviewNotes: notes || 'Escalated to flagged content queue',
        })
        .eq('id', id)

      // Log the action
      await logAdminAction(admin.id, 'report_escalated', 'UserReport', id, { 
        notes,
        contentType: report.contentType,
        contentId: report.contentId,
      })

      return NextResponse.json({ success: true, action: 'escalated' })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('PATCH /api/admin/user-reports error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
