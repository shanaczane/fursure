# FurSure 🐾

A web platform that connects pet owners with trusted pet care service providers.

**Live Demo:** [fursure-theta.vercel.app](https://fursure-theta.vercel.app)

---

## What is FurSure?

FurSure makes it easy for pet owners to find and book services like grooming, veterinary care, training, boarding, and more — all in one place. Service providers can manage their listings, bookings, and client pet records through their own dedicated dashboard.

---

## What You Can Do

### As a Pet Owner
- Create an account and manage your profile
- Add your pets with their breed, age, and medical notes
- Browse and search for pet care services near you
- Book appointments with your preferred provider
- Track your booking status from pending to confirmed to completed
- Edit or cancel bookings based on the provider's policy
- View your pet's vaccination records and medical history
- Get notified when a vaccination is coming up or overdue

### As a Service Provider
- Set up your provider profile and list your services
- Accept, decline, or reschedule booking requests
- Set your own booking and cancellation policies
- Access pet health records for booked clients
- Add verified vaccination records and medical notes to a pet's profile

### As an Admin
- View and manage all user accounts
- Verify service providers before they go live
- Moderate platform content

---
 
## Getting Started
 
### Creating an Account
 
1. Go to the live demo or your local instance.
2. Click **Register** and fill in your name, email, and password.
3. Choose your role: **Pet Owner** or **Service Provider**.
4. Confirm your email if prompted, then log in.
> **Note:** Provider accounts must be verified by an admin before your services are visible to pet owners.
 
### Logging In
 
- Visit the login page and enter your email and password.
- Forgot your password? Use the **Forgot Password** link to receive a reset email.
---
 
## Pet Owner Guide
 
Once logged in as a pet owner, you'll land on your **Owner Dashboard**.
 
### Managing Your Profile
 
- Go to **Profile** in the sidebar to update your name, email, phone number, and avatar.
- You can also change your password from the profile settings page.
### Adding and Managing Pets
 
1. Navigate to **My Pets** in the sidebar.
2. Click **Add Pet** and fill in your pet's details: name, type (dog, cat, bird, rabbit, or other), breed, age, weight, gender, color, and any medical notes.
3. You can edit or remove pets at any time.
Each pet has a health record that tracks:
- **Vaccinations** — name, date given, next due date, vet name, and notes.
- **Medical History** — diagnoses, treatments, prescriptions, and provider notes.
### Browsing Services
 
- Go to **Services** to browse all available pet care services.
- Filter by category: Grooming, Veterinary, Training, Boarding, Walking, or Daycare.
- Click on a service to view details, pricing, and the provider's booking and cancellation policies.
### Booking a Service
 
1. Open a service listing and click **Book Now**.
2. Fill in the booking form: select your pet, choose a date and time, and add any notes for the provider.
3. Review the provider's policies (down payment requirements, cancellation window, etc.) before confirming.
4. Submit the booking — it will appear as **Pending** until the provider responds.
### Tracking Your Bookings
 
Go to **My Bookings** to see two sections:
 
**Upcoming Bookings** — active bookings with one of the following statuses:
 
| Status | Meaning |
|---|---|
| Pending | Waiting for the provider to accept or decline |
| Awaiting Down Payment | Provider accepted — pay the deposit to confirm your slot |
| Payment Submitted | Down payment submitted, waiting for provider to confirm receipt |
| Confirmed | Booking is locked in |
| Rescheduled | Provider proposed a new date/time — awaiting your response |
 
**Booking History** — past bookings marked as Completed or Cancelled.
 
### Editing or Cancelling a Booking
 
- You can request an **edit** (date, time, or notes) or **cancellation** on active bookings, subject to the provider's policy.
- Requests are sent to the provider for approval; you'll be notified of the outcome.
- Some providers allow a short grace period after booking during which edits and cancellations are automatic.
### Down Payments
 
If a provider requires a down payment:
- You'll be notified after the provider accepts your booking.
- A deadline is shown — pay the cash deposit to the provider directly within that window.
- Once paid, mark it as submitted in the app. The provider will confirm receipt.
- If the deadline passes without payment, the booking may be automatically cancelled.
### Reschedule Proposals
 
When a provider proposes a new date or time:
- You'll see the proposal under your upcoming bookings.
- You can **Confirm** or **Decline** the reschedule from the bookings page.
### Leaving a Review
 
After a booking is marked as Completed, you can leave a star rating and written review for the service. This helps other pet owners make informed decisions.
 
### Vaccination Reminders
 
- FurSure tracks upcoming and overdue vaccinations for your pets.
- You'll receive in-app notifications when a vaccine is due soon or overdue.
- Providers can also add verified vaccination records when they treat your pet.
### Notifications
 
The notification bell in the top navigation shows alerts for:
- Booking confirmations, declines, and reschedule proposals
- Down payment requirements and confirmations
- Edit and cancellation request outcomes
- Vaccination reminders
---
 
## Service Provider Guide
 
Once logged in as a provider (and verified by an admin), you'll land on your **Provider Dashboard**.
 
### Setting Up Your Profile
 
- Go to **Profile** in the sidebar.
- Fill in your business name, contact details, and a description of your services.
- Your profile is shown to pet owners when they view your service listings.
### Managing Your Services
 
1. Go to **My Services** and click **Add New Service**.
2. Fill in the service name, category, price, description, and any other details.
3. Published services appear in the pet owner's service browser immediately.
4. You can **edit** or **remove** services at any time.
### Setting Your Availability
 
- Go to **Schedule** to set your available days and hours.
- Pet owners can only book within the time slots you've marked as open.
### Setting Policies
 
Go to **Policies** to configure the terms shown to pet owners before they confirm a booking:
 
- **Down Payment** — toggle whether a deposit is required, set the percentage (e.g. 25%, 50%, 100%), choose whether it's refundable, and set the payment deadline (1 to 72 hours).
- **Cancellation Policy** — set the minimum notice required for a free cancellation.
- **Additional Notes** — any extra terms or instructions for clients.
> Policies are snapshotted at booking time, so changing your policy won't affect existing bookings.
 
> All payments are cash only — pet owners pay you directly. There are no online payment integrations.
 
### Managing Bookings
 
Go to **Manage Bookings** to see all incoming and past bookings. You can filter and search by status, pet owner name, service, or date.
 
**Actions available per booking:**
 
| Action | When available |
|---|---|
| Accept | Booking is Pending |
| Decline | Booking is Pending |
| Reschedule | Booking is Pending or Confirmed |
| Complete | Booking is Confirmed |
| Confirm Down Payment | Owner has submitted payment |
| Approve / Reject Edit Request | Owner requested a change |
| Approve / Reject Cancel Request | Owner requested a cancellation |
 
### Accessing Pet Health Records
 
When you have a confirmed booking with a pet owner, you can:
- View the pet's vaccination history and medical records.
- Add new **vaccination records** (name, date given, next due date, vet name, notes).
- Add **medical history entries** (diagnosis, treatment, prescription, notes).
- Records you add are marked as provider-verified and are visible to the pet owner.
---
 
## Admin Guide
 
Admin accounts have access to a separate **Admin Dashboard**.
 
### User Management
 
- Go to **Users** to view all registered accounts.
- You can review account details and manage user access.
### Provider Verification
 
- Go to **Providers** to see all provider accounts pending verification.
- Review the provider's profile and click **Verify** to approve them.
- Only verified providers are visible to pet owners in the service browser.
### Moderation
 
- Go to **Moderation** to review flagged or reported content on the platform.
### Activity Log
 
- Go to **Activity** to see a log of recent platform actions.
---
 
## Built With
 
- **Next.js** — React framework for the frontend and API routes
- **Supabase** — Authentication and PostgreSQL database
- **Tailwind CSS** — Utility-first styling
- **Vercel** — Deployment and hosting
---
 
## Local Development
 
```bash
# Clone the repository
git clone https://github.com/your-org/fursure.git
cd fursure
 
# Install dependencies
npm install
 
# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key to .env.local
 
# Run the development server
npm run dev
```
 
Open [http://localhost:3000](http://localhost:3000) in your browser.
 