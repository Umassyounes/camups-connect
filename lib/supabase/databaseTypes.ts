/**
 * Supabase Database Types
 * Generated from Prisma schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Profile: {
        Row: {
          id: number
          supabaseId: string | null
          name: string | null
          avatarUrl: string | null
          createdAt: string
          updatedAt: string
          year: string | null
          major: string | null
          bio: string | null
          phone: string | null
          campusArea: string | null
          isVerified: boolean
          verifiedEmail: string | null
          role: 'user' | 'admin' | 'moderator'
          isAdmin: boolean
          isSuspended: boolean
          suspendedUntil: string | null
          suspensionReason: string | null
          isPro: boolean
          proStatus: 'none' | 'active' | 'grace' | 'past_due' | 'cancelled'
          proPlan: 'pro_monthly' | null
          proActivatedAt: string | null
          proRenewalDate: string | null
          proCancelledAt: string | null
          proAutoRenew: boolean
          proHomepageEligible: boolean
          proUnlimitedBoosts: boolean
          proFeaturedCredits: number
          proBoostCredits: number
        }
        Insert: {
          id?: number
          supabaseId?: string | null
          name?: string | null
          avatarUrl?: string | null
          createdAt?: string
          updatedAt?: string
          year?: string | null
          major?: string | null
          bio?: string | null
          phone?: string | null
          campusArea?: string | null
          isVerified?: boolean
          verifiedEmail?: string | null
          role?: 'user' | 'admin' | 'moderator'
          isAdmin?: boolean
          isSuspended?: boolean
          suspendedUntil?: string | null
          suspensionReason?: string | null
          isPro?: boolean
          proStatus?: 'none' | 'active' | 'grace' | 'past_due' | 'cancelled'
          proPlan?: 'pro_monthly' | null
          proActivatedAt?: string | null
          proRenewalDate?: string | null
          proCancelledAt?: string | null
          proAutoRenew?: boolean
          proHomepageEligible?: boolean
          proUnlimitedBoosts?: boolean
          proFeaturedCredits?: number
          proBoostCredits?: number
        }
        Update: {
          id?: number
          supabaseId?: string | null
          name?: string | null
          avatarUrl?: string | null
          createdAt?: string
          updatedAt?: string
          year?: string | null
          major?: string | null
          bio?: string | null
          phone?: string | null
          campusArea?: string | null
          isVerified?: boolean
          verifiedEmail?: string | null
          role?: 'user' | 'admin' | 'moderator'
          isAdmin?: boolean
          isSuspended?: boolean
          suspendedUntil?: string | null
          suspensionReason?: string | null
          isPro?: boolean
          proStatus?: 'none' | 'active' | 'grace' | 'past_due' | 'cancelled'
          proPlan?: 'pro_monthly' | null
          proActivatedAt?: string | null
          proRenewalDate?: string | null
          proCancelledAt?: string | null
          proAutoRenew?: boolean
          proHomepageEligible?: boolean
          proUnlimitedBoosts?: boolean
          proFeaturedCredits?: number
          proBoostCredits?: number
        }
      }
      SavedListing: {
        Row: {
          id: number
          userId: number
          listingId: number
          createdAt: string
        }
        Insert: {
          id?: number
          userId: number
          listingId: number
          createdAt?: string
        }
        Update: {
          id?: number
          userId?: number
          listingId?: number
          createdAt?: string
        }
      }
      Category: {
        Row: {
          id: number
          name: string
          slug: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
        }
      }
      Listing: {
        Row: {
          id: number
          title: string
          description: string
          priceCents: number
          condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR'
          imageUrl: string | null
          images: string[]
          imageCount: number
          campus: string | null
          isSold: boolean
          sellerId: number
          categoryId: number | null
          createdAt: string
          updatedAt: string
          boostedUntil: string | null
          boostedByPro: boolean
        }
        Insert: {
          id?: number
          title: string
          description: string
          priceCents: number
          condition?: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR'
          imageUrl?: string | null
          images?: string[]
          imageCount?: number
          campus?: string | null
          isSold?: boolean
          sellerId: number
          categoryId?: number | null
          createdAt?: string
          updatedAt?: string
          boostedUntil?: string | null
          boostedByPro?: boolean
        }
        Update: {
          id?: number
          title?: string
          description?: string
          priceCents?: number
          condition?: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR'
          imageUrl?: string | null
          images?: string[]
          imageCount?: number
          campus?: string | null
          isSold?: boolean
          sellerId?: number
          categoryId?: number | null
          createdAt?: string
          updatedAt?: string
          boostedUntil?: string | null
          boostedByPro?: boolean
        }
      }
      Conversation: {
        Row: {
          id: number
          user1Id: number
          user2Id: number
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          user1Id: number
          user2Id: number
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          user1Id?: number
          user2Id?: number
          createdAt?: string
          updatedAt?: string
        }
      }
      Message: {
        Row: {
          id: number
          conversationId: number
          senderId: number
          receiverId: number
          content: string
          isRead: boolean
          createdAt: string
          messageType: 'TEXT' | 'PHOTO' | 'VOICE'
          mediaUrl: string | null
        }
        Insert: {
          id?: number
          conversationId: number
          senderId: number
          receiverId: number
          content: string
          isRead?: boolean
          createdAt?: string
          messageType?: 'TEXT' | 'PHOTO' | 'VOICE'
          mediaUrl?: string | null
        }
        Update: {
          id?: number
          conversationId?: number
          senderId?: number
          receiverId?: number
          content?: string
          isRead?: boolean
          createdAt?: string
          messageType?: 'TEXT' | 'PHOTO' | 'VOICE'
          mediaUrl?: string | null
        }
      }
      Event: {
        Row: {
          id: number
          title: string
          description: string
          eventDate: string
          startTime: string
          endTime: string | null
          location: string
          imageUrl: string | null
          capacity: number | null
          category: string | null
          organizerId: number
          isExternal: boolean
          externalSource: string | null
          isSponsored: boolean
          sponsoredSlotId: number | null
          sponsoredBadge: string | null
          sponsoredPriority: number | null
          sponsoredUntil: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          title: string
          description: string
          eventDate: string
          startTime: string
          endTime?: string | null
          location: string
          imageUrl?: string | null
          capacity?: number | null
          category?: string | null
          organizerId: number
          isExternal?: boolean
          externalSource?: string | null
          isSponsored?: boolean
          sponsoredSlotId?: number | null
          sponsoredBadge?: string | null
          sponsoredPriority?: number | null
          sponsoredUntil?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string
          eventDate?: string
          startTime?: string
          endTime?: string | null
          location?: string
          imageUrl?: string | null
          capacity?: number | null
          category?: string | null
          organizerId?: number
          isExternal?: boolean
          externalSource?: string | null
          isSponsored?: boolean
          sponsoredSlotId?: number | null
          sponsoredBadge?: string | null
          sponsoredPriority?: number | null
          sponsoredUntil?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      EventAttendee: {
        Row: {
          id: number
          eventId: number
          userId: number
          createdAt: string
        }
        Insert: {
          id?: number
          eventId: number
          userId: number
          createdAt?: string
        }
        Update: {
          id?: number
          eventId?: number
          userId?: number
          createdAt?: string
        }
      }
      SponsoredEventSlot: {
        Row: {
          id: number
          eventId: number
          sponsorUserId: number | null
          sponsorName: string
          contactEmail: string | null
          contactPhone: string | null
          promoUrl: string | null
          priceCents: number
          tier: string
          status: 'pending_payment' | 'scheduled' | 'active' | 'expired' | 'cancelled'
          startsAt: string
          endsAt: string
          approvedBy: number | null
          notes: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          eventId: number
          sponsorUserId?: number | null
          sponsorName: string
          contactEmail?: string | null
          contactPhone?: string | null
          promoUrl?: string | null
          priceCents: number
          tier: string
          status?: 'pending_payment' | 'scheduled' | 'active' | 'expired' | 'cancelled'
          startsAt: string
          endsAt: string
          approvedBy?: number | null
          notes?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          eventId?: number
          sponsorUserId?: number | null
          sponsorName?: string
          contactEmail?: string | null
          contactPhone?: string | null
          promoUrl?: string | null
          priceCents?: number
          tier?: string
          status?: 'pending_payment' | 'scheduled' | 'active' | 'expired' | 'cancelled'
          startsAt?: string
          endsAt?: string
          approvedBy?: number | null
          notes?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      ProhibitedItem: {
        Row: {
          id: number
          type: 'keyword' | 'regex' | 'category' | 'url_pattern'
          pattern: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          action: 'flag' | 'auto_reject' | 'warn'
          category: string | null
          description: string | null
          isActive: boolean
          createdBy: number | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          type: 'keyword' | 'regex' | 'category' | 'url_pattern'
          pattern: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          action?: 'flag' | 'auto_reject' | 'warn'
          category?: string | null
          description?: string | null
          isActive?: boolean
          createdBy?: number | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          type?: 'keyword' | 'regex' | 'category' | 'url_pattern'
          pattern?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          action?: 'flag' | 'auto_reject' | 'warn'
          category?: string | null
          description?: string | null
          isActive?: boolean
          createdBy?: number | null
          createdAt?: string
          updatedAt?: string
        }
      }
      FlaggedContent: {
        Row: {
          id: number
          contentType: 'listing' | 'message' | 'profile' | 'event'
          contentId: number
          userId: number
          reason: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: 'pending' | 'approved' | 'rejected' | 'deleted'
          source: 'auto' | 'user_report' | 'admin'
          details: Json | null
          reviewedBy: number | null
          reviewedAt: string | null
          reviewNotes: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          contentType: 'listing' | 'message' | 'profile' | 'event'
          contentId: number
          userId: number
          reason: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'pending' | 'approved' | 'rejected' | 'deleted'
          source?: 'auto' | 'user_report' | 'admin'
          details?: Json | null
          reviewedBy?: number | null
          reviewedAt?: string | null
          reviewNotes?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          contentType?: 'listing' | 'message' | 'profile' | 'event'
          contentId?: number
          userId?: number
          reason?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'pending' | 'approved' | 'rejected' | 'deleted'
          source?: 'auto' | 'user_report' | 'admin'
          details?: Json | null
          reviewedBy?: number | null
          reviewedAt?: string | null
          reviewNotes?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      UserStrike: {
        Row: {
          id: number
          userId: number
          reason: string
          severity: 'minor' | 'major' | 'severe'
          flaggedContentId: number | null
          issuedBy: number | null
          notes: string | null
          isActive: boolean
          createdAt: string
        }
        Insert: {
          id?: number
          userId: number
          reason: string
          severity?: 'minor' | 'major' | 'severe'
          flaggedContentId?: number | null
          issuedBy?: number | null
          notes?: string | null
          isActive?: boolean
          createdAt?: string
        }
        Update: {
          id?: number
          userId?: number
          reason?: string
          severity?: 'minor' | 'major' | 'severe'
          flaggedContentId?: number | null
          issuedBy?: number | null
          notes?: string | null
          isActive?: boolean
          createdAt?: string
        }
      }
      ModerationLog: {
        Row: {
          id: number
          adminId: number
          action: string
          targetType: string
          targetId: number
          details: Json | null
          createdAt: string
        }
        Insert: {
          id?: number
          adminId: number
          action: string
          targetType: string
          targetId: number
          details?: Json | null
          createdAt?: string
        }
        Update: {
          id?: number
          adminId?: number
          action?: string
          targetType?: string
          targetId?: number
          details?: Json | null
          createdAt?: string
        }
      }
      UserReport: {
        Row: {
          id: number
          reporterId: number
          contentType: 'listing' | 'message' | 'profile' | 'event'
          contentId: number
          category: string
          description: string | null
          status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
          flaggedContentId: number | null
          resolvedBy: number | null
          resolvedAt: string | null
          resolution: string | null
          createdAt: string
        }
        Insert: {
          id?: number
          reporterId: number
          contentType: 'listing' | 'message' | 'profile' | 'event'
          contentId: number
          category: string
          description?: string | null
          status?: 'pending' | 'investigating' | 'resolved' | 'dismissed'
          flaggedContentId?: number | null
          resolvedBy?: number | null
          resolvedAt?: string | null
          resolution?: string | null
          createdAt?: string
        }
        Update: {
          id?: number
          reporterId?: number
          contentType?: 'listing' | 'message' | 'profile' | 'event'
          contentId?: number
          category?: string
          description?: string | null
          status?: 'pending' | 'investigating' | 'resolved' | 'dismissed'
          flaggedContentId?: number | null
          resolvedBy?: number | null
          resolvedAt?: string | null
          resolution?: string | null
          createdAt?: string
        }
      }
      PaymentMethod: {
        Row: {
          id: number
          userId: number
          methodType: 'venmo' | 'cashapp' | 'zelle' | 'cash'
          paymentHandle: string | null
          displayName: string | null
          isActive: boolean
          isPreferred: boolean
          notes: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          userId: number
          methodType: 'venmo' | 'cashapp' | 'zelle' | 'cash'
          paymentHandle?: string | null
          displayName?: string | null
          isActive?: boolean
          isPreferred?: boolean
          notes?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          userId?: number
          methodType?: 'venmo' | 'cashapp' | 'zelle' | 'cash'
          paymentHandle?: string | null
          displayName?: string | null
          isActive?: boolean
          isPreferred?: boolean
          notes?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      ListingPaymentOption: {
        Row: {
          id: number
          listingId: number
          paymentMethodType: 'venmo' | 'cashapp' | 'zelle' | 'cash'
          createdAt: string
        }
        Insert: {
          id?: number
          listingId: number
          paymentMethodType: 'venmo' | 'cashapp' | 'zelle' | 'cash'
          createdAt?: string
        }
        Update: {
          id?: number
          listingId?: number
          paymentMethodType?: 'venmo' | 'cashapp' | 'zelle' | 'cash'
          createdAt?: string
        }
      }
      PaymentTransaction: {
        Row: {
          id: number
          listingId: number
          buyerId: number
          sellerId: number
          paymentMethodType: 'venmo' | 'cashapp' | 'zelle' | 'cash'
          amount: number
          status: 'pending_payment' | 'payment_sent' | 'payment_confirmed' | 'completed' | 'disputed' | 'cancelled'
          paymentSentAt: string | null
          paymentConfirmedAt: string | null
          completedAt: string | null
          cancelledAt: string | null
          buyerNotes: string | null
          sellerNotes: string | null
          disputeReason: string | null
          disputedBy: number | null
          disputedAt: string | null
          meetingLocation: string | null
          meetingTime: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          listingId: number
          buyerId: number
          sellerId: number
          paymentMethodType: 'venmo' | 'cashapp' | 'zelle' | 'cash'
          amount: number
          status?: 'pending_payment' | 'payment_sent' | 'payment_confirmed' | 'completed' | 'disputed' | 'cancelled'
          paymentSentAt?: string | null
          paymentConfirmedAt?: string | null
          completedAt?: string | null
          cancelledAt?: string | null
          buyerNotes?: string | null
          sellerNotes?: string | null
          disputeReason?: string | null
          disputedBy?: number | null
          disputedAt?: string | null
          meetingLocation?: string | null
          meetingTime?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          listingId?: number
          buyerId?: number
          sellerId?: number
          paymentMethodType?: 'venmo' | 'cashapp' | 'zelle' | 'cash'
          amount?: number
          status?: 'pending_payment' | 'payment_sent' | 'payment_confirmed' | 'completed' | 'disputed' | 'cancelled'
          paymentSentAt?: string | null
          paymentConfirmedAt?: string | null
          completedAt?: string | null
          cancelledAt?: string | null
          buyerNotes?: string | null
          sellerNotes?: string | null
          disputeReason?: string | null
          disputedBy?: number | null
          disputedAt?: string | null
          meetingLocation?: string | null
          meetingTime?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      PaymentTransactionHistory: {
        Row: {
          id: number
          transactionId: number
          statusFrom: 'pending_payment' | 'payment_sent' | 'payment_confirmed' | 'completed' | 'disputed' | 'cancelled' | null
          statusTo: 'pending_payment' | 'payment_sent' | 'payment_confirmed' | 'completed' | 'disputed' | 'cancelled'
          changedBy: number
          notes: string | null
          ipAddress: string | null
          createdAt: string
        }
        Insert: {
          id?: number
          transactionId: number
          statusFrom?: 'pending_payment' | 'payment_sent' | 'payment_confirmed' | 'completed' | 'disputed' | 'cancelled' | null
          statusTo: 'pending_payment' | 'payment_sent' | 'payment_confirmed' | 'completed' | 'disputed' | 'cancelled'
          changedBy: number
          notes?: string | null
          ipAddress?: string | null
          createdAt?: string
        }
        Update: {
          id?: number
          transactionId?: number
          statusFrom?: 'pending_payment' | 'payment_sent' | 'payment_confirmed' | 'completed' | 'disputed' | 'cancelled' | null
          statusTo?: 'pending_payment' | 'payment_sent' | 'payment_confirmed' | 'completed' | 'disputed' | 'cancelled'
          changedBy?: number
          notes?: string | null
          ipAddress?: string | null
          createdAt?: string
        }
      }
      ProSubscription: {
        Row: {
          id: number
          userId: number
          plan: 'pro_monthly'
          status: 'none' | 'active' | 'grace' | 'past_due' | 'cancelled'
          provider: string
          providerCustomerId: string | null
          providerSubscriptionId: string | null
          priceCents: number
          currency: string
          billingInterval: string
          currentPeriodStart: string
          currentPeriodEnd: string
          cancelAtPeriodEnd: boolean
          canceledAt: string | null
          metadata: Json | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          userId: number
          plan: 'pro_monthly'
          status?: 'none' | 'active' | 'grace' | 'past_due' | 'cancelled'
          provider?: string
          providerCustomerId?: string | null
          providerSubscriptionId?: string | null
          priceCents?: number
          currency?: string
          billingInterval?: string
          currentPeriodStart: string
          currentPeriodEnd: string
          cancelAtPeriodEnd?: boolean
          canceledAt?: string | null
          metadata?: Json | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          userId?: number
          plan?: 'pro_monthly'
          status?: 'none' | 'active' | 'grace' | 'past_due' | 'cancelled'
          provider?: string
          providerCustomerId?: string | null
          providerSubscriptionId?: string | null
          priceCents?: number
          currency?: string
          billingInterval?: string
          currentPeriodStart?: string
          currentPeriodEnd?: string
          cancelAtPeriodEnd?: boolean
          canceledAt?: string | null
          metadata?: Json | null
          createdAt?: string
          updatedAt?: string
        }
      }
      FeaturedListingSlot: {
        Row: {
          id: number
          listingId: number
          userId: number
          slotType: string
          startsAt: string
          endsAt: string
          createdAt: string
          createdBySubscriptionId: number | null
        }
        Insert: {
          id?: number
          listingId: number
          userId: number
          slotType?: string
          startsAt: string
          endsAt: string
          createdAt?: string
          createdBySubscriptionId?: number | null
        }
        Update: {
          id?: number
          listingId?: number
          userId?: number
          slotType?: string
          startsAt?: string
          endsAt?: string
          createdAt?: string
          createdBySubscriptionId?: number | null
        }
      }
      ListingBoost: {
        Row: {
          id: number
          listingId: number
          userId: number
          priceCents: number
          currency: string
          source: string
          status: string
          startsAt: string
          endsAt: string
          createdAt: string
          metadata: Json | null
        }
        Insert: {
          id?: number
          listingId: number
          userId: number
          priceCents?: number
          currency?: string
          source?: string
          status?: string
          startsAt: string
          endsAt: string
          createdAt?: string
          metadata?: Json | null
        }
        Update: {
          id?: number
          listingId?: number
          userId?: number
          priceCents?: number
          currency?: string
          source?: string
          status?: string
          startsAt?: string
          endsAt?: string
          createdAt?: string
          metadata?: Json | null
        }
      }
    }
    Views: {
      ActivePaymentTransactionsView: {
        Row: {
          id: number
          listingId: number
          buyerId: number
          sellerId: number
          paymentMethodType: 'venmo' | 'cashapp' | 'zelle' | 'cash'
          amount: number
          status: 'pending_payment' | 'payment_sent' | 'payment_confirmed' | 'completed' | 'disputed' | 'cancelled'
          paymentSentAt: string | null
          paymentConfirmedAt: string | null
          completedAt: string | null
          cancelledAt: string | null
          buyerNotes: string | null
          sellerNotes: string | null
          disputeReason: string | null
          disputedBy: number | null
          disputedAt: string | null
          meetingLocation: string | null
          meetingTime: string | null
          createdAt: string
          updatedAt: string
          listingTitle: string
          listingPriceCents: number
          listingImageUrl: string | null
          listingImages: string[]
          buyerName: string | null
          buyerAvatar: string | null
          sellerName: string | null
          sellerAvatar: string | null
        }
      }
    }
    Functions: {}
    Enums: {
      Condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR'
      MessageType: 'TEXT' | 'PHOTO' | 'VOICE'
      PaymentMethodType: 'venmo' | 'cashapp' | 'zelle' | 'cash'
      TransactionStatus: 'pending_payment' | 'payment_sent' | 'payment_confirmed' | 'completed' | 'disputed' | 'cancelled'
      ProPlanType: 'pro_monthly'
      ProSubscriptionStatus: 'none' | 'active' | 'grace' | 'past_due' | 'cancelled'
      SponsoredEventStatus: 'pending_payment' | 'scheduled' | 'active' | 'expired' | 'cancelled'
    }
  }
}

export const databaseSchema = {} as Database