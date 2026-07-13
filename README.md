# JobQueue

A full-stack job marketplace application built with **React**, **Node.js**, and **Express**, featuring job posting, order management, and payment processing with a robust job queue system powered by BullMQ.

## 🚀 Project Overview

JobQueue is a comprehensive platform that connects buyers and sellers for job services. The application is actively in development with a solid foundation of core features and identified areas for enhancement.

### Current Status
- **Development Stage**: MVP with core functionality implemented
- **Last Updated**: June 28, 2026
- **Repository**: Public, accepting contributions
- **Open Issues**: 9 critical features and improvements tracked

### Core Features Implemented
- **User Authentication**: Secure login and registration with role-based access (Buyer/Seller)
- **Job Management**: Create, browse, and manage job listings
- **Order System**: Handle job orders with status tracking
- **Payment Processing**: Stripe integration for secure payments
- **Job Queue System**: BullMQ-powered background job processing using Redis
- **Cloud Storage**: Cloudinary integration for media uploads
- **Database**: PostgreSQL for persistent data storage

## 📁 Project Structure

```
jobqueue/
├── Backend/                      # Node.js/Express backend server
│   ├── src/
│   │   ├── app.js               # Express application setup with Stripe webhooks
│   │   ├── config/              # Database & environment configuration
│   │   ├── controllers/         # API request handlers
│   │   ├── middleware/          # Auth, role-based access control
│   │   ├── models/              # Database query functions
│   │   ├── queues/              # BullMQ job queue definitions
│   │   │   ├── payment.queue.js
│   │   │   ├── order.queue.js
│   │   │   ├── email.queue.js
│   │   │   ├── inventory.queue.js
│   │   │   ├── shipment.queue.js
│   │   │   ├── analytics.queue.js
│   │   │   ├── dead.queue.js    # Failed jobs storage
│   │   │   └── test.js
│   │   ├── routes/              # API endpoint definitions
│   │   │   ├── auth.router.js
│   │   │   ├── buyer.router.js
│   │   │   ├── seller.router.js
│   │   │   ├── order.router.js
│   │   │   ├── cart.router.js
│   │   │   ├── profile.router.js
│   │   │   └── user.router.js
│   │   ├── schema/              # Data validation schemas
│   │   ├── services/            # Business logic layer
│   │   ├── workers/             # Queue job processors
│   │   │   ├── payment.worker.js
│   │   │   ├── email.worker.js
│   │   │   ├── inventory.worker.js
│   │   │   ├── order.worker.js
│   │   │   ├── shipment.worker.js
│   │   │   └── index.worker.js
│   │   └── utils/               # Helper functions (Redis, etc.)
│   ├── index.js                 # Server entry point
│   └── package.json
├── Frontend/                     # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   ├── pages/               # Page components
│   │   │   ├── auth/            # Login, Register, OTP verification
│   │   │   ├── buyer/           # Product listing, cart, orders
│   │   │   ├── seller/          # Dashboard, create product
│   │   │   ├── payment/         # Payment success/cancel pages
│   │   │   └── Landing.jsx
│   │   ├── context/             # React context (AuthContext)
│   │   ├── api/                 # API integration layer
│   │   ├── App.jsx              # Main app component with routing
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── package.json
└── package.json                 # Root package configuration
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (v16+)
- **Framework**: Express 5.2
- **Database**: PostgreSQL
- **Cache/Queue**: Redis + BullMQ 5.78
- **Authentication**: JWT (jsonwebtoken)
- **Payment**: Stripe API
- **File Storage**: Cloudinary
- **Security**: Bcrypt, Helmet, CORS, express-rate-limit
- **Utilities**: Multer, dotenv, ioredis, googleapis

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 8
- **HTTP Client**: Axios
- **Routing**: React Router DOM 7
- **UI Components**: Lucide React
- **Notifications**: React Hot Toast
- **Development**: ESLint, TypeScript types

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Redis server (for job queue)
- Cloudinary account (for file uploads)
- Stripe account (for payment processing)

### Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory:
```bash
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/jobqueue
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key
STRIPE=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

```bash
cd Frontend
npm install
```

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Frontend Scripts
- `npm run dev` - Start Vite development server with HMR
- `npm run build` - Build for production
- `npm run lint` - Run ESLint checks
- `npm run preview` - Preview production build

## 🔑 Key Features

### Authentication & Authorization
- User registration and login with JWT tokens
- Role-based access control (Buyer/Seller)
- Password encryption with Bcrypt
- Session management with JWT

### Buyer Features
- Browse available jobs/services with product listing
- Create and manage shopping cart
- Place orders with payment processing
- Order history and tracking
- Secure payment via Stripe

### Seller Features
- Create and manage job listings
- View incoming orders
- Dashboard for order management
- Payment tracking

### Job Queue System
The application uses **BullMQ** with **Redis** for scalable background job processing:

- **Payment Queue**: Process Stripe payments, handle retries, manage payment status updates
- **Email Queue**: Send confirmation emails, receipts, notifications
- **Order Queue**: Order creation and status updates
- **Inventory Queue**: Manage stock levels, handle cancellations
- **Shipment Queue**: Shipment creation and delivery tracking
- **Analytics Queue**: Collect usage statistics and analytics
- **Dead Letter Queue**: Store and manage failed jobs

Each queue includes:
- Automatic retry logic with exponential backoff
- Error handling and dead letter queue support
- Configurable job processing with concurrency control
- Persistent job storage in Redis

### Additional Features
- File uploads to Cloudinary with public URL management
- Stripe webhook integration for payment status updates
- Real-time notifications with React Hot Toast
- Database health checks
- Comprehensive error handling
- Rate limiting on API endpoints

## 📚 API Endpoints

### Authentication Routes
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/change-password` - Change password

### Buyer Routes
- `GET /auth/buyer/home` - Get buyer dashboard with product listings
- `GET /auth/buyer/order` - View all orders
- `POST /auth/buyer/order` - Create new order
- `GET /auth/buyer/cart` - View shopping cart
- `POST /auth/buyer/cart` - Add items to cart

### Seller Routes
- `GET /auth/seller` - Seller dashboard
- `POST /auth/seller/jobs` - Create job listing
- `GET /auth/seller/jobs` - View seller's listings
- `PUT /auth/seller/product/:id` - Update product
- `DELETE /auth/seller/product/:id` - Delete product (⚠️ needs safety check)

### User Routes
- `GET /user/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### System Routes
- `GET /health/db` - Database connection status
- `GET /` - Server health check
- `GET /test` - Dead queue inspection

## 🔄 How the Job Queue Works

### Queue Processing Flow
1. **Job Creation**: Jobs are added to appropriate queue (e.g., `paymentQueue.add('paymentSuccess', data)`)
2. **Queue Storage**: BullMQ stores jobs in Redis with job ID and metadata
3. **Worker Processing**: Dedicated workers listen to their queues and process jobs
4. **Job Completion**: Completed jobs are removed from queue
5. **Error Handling**: Failed jobs are retried with exponential backoff or moved to dead letter queue

### Example: Payment Processing
```javascript
// Backend receives Stripe webhook
app.post('/stripe/webhook', async (req, res) => {
  if (event.type === 'checkout.session.completed') {
    // Add payment job to queue
    await paymentQueue.add('paymentSuccess', metadata, {
      attempts: 5,           // Total retry attempts
      backoff: {
        type: 'exponential',
        delay: 2000          // Initial 2s delay
      },
      removeOnComplete: true,
      removeOnFail: false    // Keep failed jobs in dead queue
    });
  }
});

// Worker processes the job
payment.worker.js: {
  processes('paymentSuccess', (job) => {
    // Update payment status in database
    // Send confirmation email
    // Update order status
  })
}
```

## 📊 Current Status & Known Issues

### Implemented ✅
- Core authentication and authorization
- Product listing and search (basic)
- Order creation and management
- Payment processing with Stripe
- Email notifications via BullMQ
- Inventory management
- Cart functionality
- Database persistence

### In Progress / Planned 🚧
See [Open Issues](#open-issues) for detailed tracking

### Open Issues

```list type="issue" id=bbc39ed2-9d09-48a2-8dab-e0531029b4f8
```

**Critical Issues Being Tracked:**
1. **Product Images Table** - Need to refactor image storage for better scalability
2. **Pagination & Search** - Product display needs improved filtering
3. **Session Renewal** - JWT token refresh mechanism needed
4. **Logging Feature** - System-wide logging implementation
5. **Admin Dashboard** - Dead queue management and admin role
6. **Product Reviews** - Rating and review system
7. **Database Connection Pool** - Connection pooling for transaction safety
8. **Product Deletion Safety** - Prevent deletion of products with active orders
9. **Stripe Idempotency** - Add client_reference_id to prevent duplicate sessions

## 🔐 Security Features

- **Helmet**: HTTP security headers
- **CORS**: Cross-origin resource sharing configuration
- **Bcrypt**: Password hashing
- **JWT**: Secure token-based authentication
- **Rate Limiting**: API endpoint rate limiting with Redis
- **Role-based Middleware**: Fine-grained access control
- **Stripe Webhooks**: Signature verification for payment events

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Before submitting a PR:**
- Check [Open Issues](https://github.com/bhargavmane1802/jobqueue/issues) to see if your work addresses any tracked items
- Test your changes thoroughly
- Run linting: `npm run lint` (Frontend)
- Update relevant documentation

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

**Bhargav Mane**

## 📧 Support & Issues

For issues, feature requests, and questions, please visit the [GitHub Issues](https://github.com/bhargavmane1802/jobqueue/issues) page.

---

**Last Updated**: July 13, 2026  
**Project Age**: 38+ days in development  
**Language Composition**: JavaScript 85.3%, CSS 14.4%, HTML 0.3%

**Happy Coding! 🎉**
