# JobQueue

A full-stack job marketplace application built with **React**, **Node.js**, and **Express**, featuring job posting, order management, and payment processing with a robust job queue system.

## 🚀 Project Overview

JobQueue is a comprehensive platform that connects buyers and sellers for job services. The application includes:

- **User Authentication**: Secure login and registration with role-based access (Buyer/Seller)
- **Job Management**: Create, browse, and manage job listings
- **Order System**: Handle job orders with real-time status tracking
- **Payment Processing**: Stripe integration for secure payments
- **Job Queue**: BullMQ-powered background job processing using Redis
- **Cloud Storage**: Cloudinary integration for media uploads
- **Database**: PostgreSQL for persistent data storage

## 📁 Project Structure

```
jobqueue/
├── Backend/                  # Node.js/Express backend server
│   ├── src/
│   │   ├── app.js           # Express application setup
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Custom middleware (auth, role-based)
│   │   ├── queues/          # BullMQ job queues
│   │   ├── workers/         # Queue job processors
│   │   ├── config/          # Database & environment configuration
│   │   └── utils/           # Utility functions (Redis, etc.)
│   ├── index.js             # Server entry point
│   └── package.json
├── Frontend/                # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   └── App.jsx          # Main app component
│   ├── index.html
│   └── package.json
└── package.json             # Root package configuration
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.2
- **Database**: PostgreSQL
- **Cache/Queue**: Redis + BullMQ 5.78
- **Authentication**: JWT (jsonwebtoken)
- **Payment**: Stripe API
- **File Storage**: Cloudinary
- **Security**: Bcrypt, Helmet, CORS
- **Utilities**: Multer, dotenv

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 8
- **HTTP Client**: Axios
- **Routing**: React Router DOM 7
- **UI Components**: Lucide React
- **Notifications**: React Hot Toast
- **Linting**: ESLint

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Redis server
- Cloudinary account
- Stripe account

### Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory with the following variables:
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/jobqueue
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the development server:
```bash
npm run dev
```

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

## 🔧 Available Scripts

### Backend
- `npm run dev` - Start development server with nodemon auto-reload

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🔑 Key Features

### Authentication & Authorization
- User registration and login
- Role-based access control (Buyer/Seller)
- JWT-based session management
- Password encryption with Bcrypt

### Buyer Features
- Browse available jobs/services
- Create and manage orders
- Shopping cart functionality
- Order history and tracking
- Secure payment processing

### Seller Features
- Create and manage job listings
- View incoming orders
- Order management dashboard
- Payment tracking

### Job Queue System
- Background job processing with BullMQ
- Dead letter queue for failed jobs
- Redis-backed persistent job storage
- Multiple specialized queues for different operations

### Additional Features
- File uploads to Cloudinary
- Payment processing via Stripe
- Real-time notifications
- Database health checks
- Comprehensive error handling

## 📚 API Endpoints

### Authentication Routes
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Buyer Routes
- `GET /auth/buyer/home` - Get buyer dashboard
- `GET /auth/buyer/order` - View orders
- `POST /auth/buyer/order` - Create order
- `GET /auth/buyer/cart` - View cart
- `POST /auth/buyer/cart` - Add to cart

### Seller Routes
- `GET /auth/seller` - Seller dashboard
- `POST /auth/seller/jobs` - Create job listing
- `GET /auth/seller/jobs` - View listings

### User Routes
- `GET /user/profile` - Get user profile
- `PUT /auth/profile` - Update profile

### Health Checks
- `GET /health/db` - Database connection status
- `GET /` - Server status

## 🔄 Job Queue System - Detailed

The application uses **BullMQ** with **Redis** to manage various background jobs asynchronously. This ensures reliable, scalable job processing across the application.

### Queue Architecture

Each queue has:
- **Queue Definition** (`Backend/src/queues/*.queue.js`): Initializes the queue with Redis connection
- **Worker** (`Backend/src/workers/*.worker.js`): Processes jobs from the queue
- **Job Functions**: Business logic for handling specific job types

### Available Queues

#### 1. **Payment Queue** (`paymentQueue`)
- **Location**: `Backend/src/queues/payment.queue.js`
- **Worker**: `Backend/src/workers/payment.worker.js`
- **Purpose**: Handles payment processing jobs
- **Job Type**: `payment`
- **Responsibility**: 
  - Process Stripe payments
  - Update payment status in database
  - Handle payment failures and retries
  - Send payment confirmations

**Queue Definition:**
```javascript
const paymentQueue = new Queue('paymentQueue', { connection: redis });
const addToPaymentQueue = () => {
    paymentQueue.add('payment', {}, { connection: redis });
};
```

#### 2. **Order Queue** (`orderQueue`)
- **Location**: `Backend/src/queues/order.queue.js`
- **Worker**: `Backend/src/workers/order.worker.js`
- **Purpose**: Manages order processing operations
- **Job Type**: `order`
- **Responsibility**:
  - Create orders
  - Update order status
  - Manage order workflows
  - Validate order data

**Queue Definition:**
```javascript
const orderQueue = new Queue('orderQueue', { connection: redis });
```

#### 3. **Email Queue** (`emailQueue`)
- **Location**: `Backend/src/queues/email.queue.js`
- **Worker**: `Backend/src/workers/email.worker.js`
- **Purpose**: Handles asynchronous email sending
- **Job Type**: `email`
- **Responsibility**:
  - Send order confirmation emails
  - Send payment receipts
  - Send notification emails
  - Handle email delivery retries
  - Track email delivery status

**Queue Definition:**
```javascript
const emailQueue = new Queue('emailQueue', { connection: redis });
const addToEmailQueue = () => {
    emailQueue.add('email', {});
};
```

#### 4. **Inventory Queue** (`inventoryQueue`)
- **Location**: `Backend/src/queues/inventory.queue.js`
- **Worker**: `Backend/src/workers/inventory.worker.js`
- **Purpose**: Manages inventory updates and stock management
- **Job Type**: `inventory`
- **Responsibility**:
  - Update inventory counts
  - Track stock levels
  - Handle low stock alerts
  - Manage inventory synchronization
  - Process inventory adjustments

**Queue Definition:**
```javascript
const inventoryQueue = new Queue('inventoryQueue', { connection: redis });
const addToInventoryQueue = () => {
    inventoryQueue.add('inventory', {});
};
```

#### 5. **Shipment Queue** (`shipmentQueue`)
- **Location**: `Backend/src/queues/shipment.queue.js`
- **Worker**: `Backend/src/workers/shipment.worker.js`
- **Purpose**: Handles shipment and logistics operations
- **Job Type**: `shipment`
- **Responsibility**:
  - Create shipment records
  - Update shipment status
  - Generate shipping labels
  - Track delivery status
  - Handle shipment notifications

**Queue Definition:**
```javascript
const shipmentQueue = new Queue('shipmentQueue', { connection: redis });
```

#### 6. **Analytics Queue** (`analyticsQueue`)
- **Location**: `Backend/src/queues/analytics.queue.js`
- **Worker**: N/A (analytics tracking)
- **Purpose**: Collects analytics and tracking data
- **Job Type**: `inventory`
- **Responsibility**:
  - Track user events
  - Collect analytics data
  - Store usage statistics
  - Generate reports

**Queue Definition:**
```javascript
const analyticsQueue = new Queue('analyticsQueue', { connection: redis });
const addToAnalyticsQueue = () => {
    analyticsQueue.add('inventory', {});
};
```

#### 7. **Dead Letter Queue** (`Dead Queue`)
- **Location**: `Backend/src/queues/dead.queue.js`
- **Purpose**: Stores failed jobs for analysis and recovery
- **Responsibility**:
  - Hold jobs that failed after max retries
  - Facilitate job recovery
  - Enable debugging and monitoring
  - Track failure patterns

**Queue Definition:**
```javascript
const deadQueue = new Queue('DQ', { connection: redis });
```

### Queue Workers

Workers process jobs from their respective queues:

| Worker | Queue | Processes |
|--------|-------|-----------|
| `email.worker.js` | Email Queue | Email sending operations |
| `inventory.worker.js` | Inventory Queue | Inventory updates & management |
| `order.worker.js` | Order Queue | Order processing |
| `payment.worker.js` | Payment Queue | Payment transactions |
| `shipment.worker.js` | Shipment Queue | Shipment handling |

### How Queues Work

1. **Job Creation**: Jobs are added to a queue (e.g., `paymentQueue.add('payment', jobData)`)
2. **Queue Storage**: BullMQ stores jobs in Redis
3. **Worker Processing**: Workers listen for jobs in their queue and process them
4. **Job Completion**: Upon completion, jobs are removed from the queue
5. **Error Handling**: Failed jobs are retried or moved to the dead letter queue

### Example Usage

Adding a job to the payment queue:
```javascript
import { paymentQueue, addToPaymentQueue } from './src/queues/payment.queue.js';

// Add a payment job
paymentQueue.add('payment', {
    userId: 123,
    amount: 99.99,
    currency: 'USD'
});
```

## 🔐 Security Features

- **Helmet**: HTTP security headers
- **CORS**: Cross-origin resource sharing configuration
- **Bcrypt**: Password hashing
- **JWT**: Secure token-based authentication
- **Role-based Middleware**: Fine-grained access control

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

**Bhargav Mane**

## 📧 Support

For issues and questions, please open an issue on the [GitHub repository](https://github.com/bhargavmane1802/jobqueue/issues).

---

**Happy Coding! 🎉**
