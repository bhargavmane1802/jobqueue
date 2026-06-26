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
- Payment processing queue
- Redis-backed persistent job storage

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

## 🔄 Job Queue Usage

The application uses BullMQ for background job processing:

- **Payment Queue**: Handles payment processing
- **Test Queue**: Demo queue for testing
- **Dead Queue**: Stores failed jobs for analysis

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
