# CineMax - Movie Booking Application

A modern, responsive movie booking application built with React, Vite, and Tailwind CSS.

## Features

- 🎬 Browse and search movies
- 🎫 Book movie tickets with seat selection
- 👤 User authentication and authorization
- 📱 Responsive design for all devices
- ✨ Beautiful UI with glassmorphism effects
- 🔄 Real-time seat availability
- 📋 View and manage your bookings

## Tech Stack

- **Frontend Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS 4
- **Routing:** React Router DOM
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Date Formatting:** date-fns

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API server running on `http://localhost:8080` (or configure via environment variables)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd movie-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (use `.env.example` as a template):
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=CineMax
VITE_MAX_SEATS_PER_BOOKING=10
VITE_ENABLE_DEBUG_LOGGING=false
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
movie-frontend/
├── src/
│   ├── api/              # API client and endpoints
│   ├── auth/             # Authentication context and protected routes
│   ├── components/       # Reusable components
│   │   ├── ui/          # UI components (Button, Input, Modal, etc.)
│   │   ├── Layout.jsx   # Main layout wrapper
│   │   └── MovieCard.jsx # Movie card component
│   ├── config/          # Configuration and constants
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # App entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── .env.example         # Environment variables template
└── package.json         # Dependencies and scripts
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080` |
| `VITE_APP_NAME` | Application name | `CineMax` |
| `VITE_MAX_SEATS_PER_BOOKING` | Maximum seats per booking | `10` |
| `VITE_ENABLE_DEBUG_LOGGING` | Enable API debug logging | `false` |

## API Endpoints

The application expects the following API endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie details

### Showtimes
- `GET /api/showtimes/:id` - Get showtime details

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `DELETE /api/bookings/:id/cancel` - Cancel booking

## Features in Detail

### Authentication
- Secure JWT-based authentication
- Token stored in localStorage
- Auto-redirect for protected routes
- Role-based access control support

### Movie Browsing
- Search movies by title
- Filter by genre
- Debounced search for better performance
- Responsive grid layout

### Booking System
- Interactive seat selection
- Real-time seat availability
- Maximum 10 seats per booking
- Booking confirmation with reference number

### UI/UX
- Glassmorphism design
- Smooth animations with Framer Motion
- Loading skeletons for better perceived performance
- Toast notifications for user feedback
- Error boundaries for graceful error handling

## Code Quality

The project follows best practices:

- ✅ Component-based architecture
- ✅ Custom hooks for reusable logic
- ✅ Centralized constants and configuration
- ✅ Error handling and validation
- ✅ Loading states and skeletons
- ✅ Responsive design
- ✅ Code splitting with lazy loading
- ✅ Memoization for performance

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### API Connection Issues
- Ensure the backend server is running
- Check the `VITE_API_BASE_URL` in your `.env` file
- Verify CORS is properly configured on the backend

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Clear Vite cache: `rm -rf .vite`

### Authentication Issues
- Clear localStorage: Open DevTools → Application → Local Storage → Clear
- Check token expiration
- Verify backend authentication endpoints

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.
