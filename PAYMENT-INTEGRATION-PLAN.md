# Payment Integration Implementation Plan

## Overview
Implementing secure payment method integration for Venmo, Cash App, Zelle, and Cash transactions. This is a **facilitation system** - we connect buyers and sellers but DO NOT process payments directly.

## Security Model
- **No Direct Payment Processing**: Platform does not handle money transfers
- **Encrypted Storage**: Payment handles stored with encryption
- **Controlled Disclosure**: Payment info only revealed after purchase commitment
- **Transaction Verification**: Both parties confirm transaction completion
- **Audit Trail**: All payment-related actions logged

---

## Phase 1: Database Schema (CURRENT)

### Tables to Create:

#### 1. `payment_methods`
```sql
- id (uuid, primary key)
- user_id (uuid, references profiles)
- method_type (enum: 'venmo', 'cashapp', 'zelle', 'cash')
- payment_handle (text, encrypted) -- Username/phone for digital methods
- is_active (boolean)
- is_preferred (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 2. `listing_payment_options`
```sql
- id (uuid, primary key)
- listing_id (uuid, references listings)
- payment_method_id (uuid, references payment_methods)
- created_at (timestamp)
```

#### 3. `transactions`
```sql
- id (uuid, primary key)
- listing_id (uuid, references listings)
- buyer_id (uuid, references profiles)
- seller_id (uuid, references profiles)
- payment_method_type (text)
- status (enum: 'pending_payment', 'payment_sent', 'payment_confirmed', 'completed', 'disputed', 'cancelled')
- buyer_confirmed_at (timestamp)
- seller_confirmed_at (timestamp)
- amount (decimal)
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 4. `transaction_history`
```sql
- id (uuid, primary key)
- transaction_id (uuid, references transactions)
- status_from (text)
- status_to (text)
- changed_by (uuid, references profiles)
- notes (text)
- created_at (timestamp)
```

### RLS Policies:
- Users can only view their own payment methods
- Users can only create/update/delete their own payment methods
- Payment info only visible to buyer after transaction initiated
- Sellers can see their transaction history
- Buyers can see their transaction history

---

## Phase 2: Backend API Routes

### Payment Methods Management
- `POST /api/payment-methods` - Add new payment method
- `GET /api/payment-methods` - Get user's payment methods
- `PUT /api/payment-methods/:id` - Update payment method
- `DELETE /api/payment-methods/:id` - Delete payment method

### Transaction Flow
- `POST /api/transactions/initiate` - Buyer initiates purchase
- `GET /api/transactions/:id/payment-info` - Get seller's payment details (buyer only)
- `PUT /api/transactions/:id/confirm-payment` - Buyer confirms payment sent
- `PUT /api/transactions/:id/confirm-receipt` - Seller confirms payment received
- `PUT /api/transactions/:id/dispute` - Either party disputes transaction
- `GET /api/transactions/my-purchases` - Buyer's transactions
- `GET /api/transactions/my-sales` - Seller's transactions

---

## Phase 3: UI Components

### Seller Flow:
1. **Payment Settings Page** (`/profile/payment-methods`)
   - Add/edit/remove payment methods
   - Set preferred payment method
   - Enable/disable methods per listing

2. **Listing Creation/Edit**
   - Select which payment methods to accept for this listing
   - Default to all enabled methods

3. **Transaction Management** (`/my/sales`)
   - View pending transactions
   - Confirm payment received
   - Dispute handling
   - Transaction history

### Buyer Flow:
1. **Listing View**
   - "Buy Now" button
   - Shows accepted payment methods (icons only, no details yet)

2. **Purchase Initiation** (`/listings/:id/purchase`)
   - Select payment method
   - Review purchase details
   - Commit to purchase

3. **Payment Instructions** (`/transactions/:id/pay`)
   - Shows seller's payment handle
   - Instructions for completing payment
   - "I've Sent Payment" button

4. **Transaction Tracking** (`/my/purchases`)
   - View pending transactions
   - Track payment status
   - Dispute handling
   - Purchase history

---

## Phase 4: Notifications

### Email Notifications:
- Seller: New purchase initiated
- Buyer: Payment instructions
- Seller: Buyer confirmed payment sent
- Buyer: Seller confirmed payment received
- Both: Transaction completed
- Both: Dispute raised

### In-App Notifications:
- Real-time updates on transaction status
- Payment reminders (24h, 48h if no confirmation)

---

## Phase 5: Security Enhancements

### Rate Limiting:
- Limit transaction initiations per user per day
- Limit payment info access attempts

### Fraud Prevention:
- Flag suspicious patterns (too many disputes)
- Require email/phone verification before first transaction
- Transaction limits for new users

### Data Encryption:
- Encrypt payment handles at rest
- Use Supabase Vault for sensitive data
- HTTPS only for all payment-related pages

---

## Phase 6: Testing & Deployment

### Testing Checklist:
- [ ] Unit tests for API routes
- [ ] Integration tests for transaction flow
- [ ] RLS policy verification
- [ ] UI/UX testing on mobile and desktop
- [ ] Security audit
- [ ] Load testing

### Deployment Steps:
1. Run migrations on staging database
2. Deploy to staging environment
3. Conduct thorough testing
4. Run migrations on production
5. Deploy to production
6. Monitor for issues

---

## Future Enhancements (Post-MVP)

- **Reputation System**: Ratings for transaction reliability
- **Escrow Service**: Optional third-party escrow for high-value items
- **Direct Integration**: Venmo/Cash App API integration (requires business accounts)
- **Cryptocurrency**: Add crypto payment options
- **Payment Receipts**: Upload payment confirmation screenshots
- **Auto-cancellation**: Cancel transaction if no action after X days
- **Shipping Integration**: For non-cash transactions with shipping

---

## Implementation Timeline

- **Week 1**: Database schema, RLS policies, basic API routes
- **Week 2**: UI components for payment method management
- **Week 3**: Transaction flow UI and logic
- **Week 4**: Notifications, testing, bug fixes
- **Week 5**: Security audit, final testing, deployment prep

---

## Notes

- Start with MVP: Basic transaction flow with manual confirmation
- Keep it simple: No complex payment processing initially
- Focus on security: Better to launch slower but secure
- User education: Clear instructions on how payment system works
- Legal considerations: Terms of service updates, liability disclaimers
