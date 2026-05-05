import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaBookReader, FaUserGraduate, FaChalkboardTeacher, FaUserTie, 
  FaBook, FaExchangeAlt, FaCalculator, FaUsers, FaChartBar, FaShieldAlt,
  FaArrowRight, FaPlayCircle, FaStar, FaClock, FaHeadset, FaDatabase
} from 'react-icons/fa'

export default function Home() {
  const features = [
    { icon: FaBook, title: 'Book Management', desc: 'Add, update, remove, and search books with detailed information' },
    { icon: FaExchangeAlt, title: 'Borrow & Return', desc: 'Streamlined borrowing and returning with automatic updates' },
    { icon: FaCalculator, title: 'Fine Calculation', desc: 'Automated fine calculation with different rules for students and faculty' },
    { icon: FaUsers, title: 'User Management', desc: 'Register and manage students, faculty, and librarians' },
    { icon: FaChartBar, title: 'Reports & Analytics', desc: 'Generate reports on book usage, user activity, and transactions' },
    { icon: FaShieldAlt, title: 'Secure Authentication', desc: 'Secure login with JWT tokens and session management' }
  ]

  const portals = [
    { icon: FaUserGraduate, title: 'Student Portal', color: '#00ff88', gradient: 'linear-gradient(135deg, #00ff88, #00a8ff)', features: ['View Books', 'Borrow Books', 'Return Books', 'Check Fines', 'Book History', 'Request Extension'], link: '/login?role=student' },
    { icon: FaChalkboardTeacher, title: 'Faculty Portal', color: '#00a8ff', gradient: 'linear-gradient(135deg, #00a8ff, #9c88ff)', features: ['Extended Borrowing', 'Course Materials', 'Research Access', 'Manage Courses', 'Request Books', 'Research Analytics'], link: '/login?role=faculty' },
    { icon: FaUserTie, title: 'Librarian Portal', color: '#9c88ff', gradient: 'linear-gradient(135deg, #9c88ff, #ff6b8b)', features: ['Add/Remove Books', 'User Management', 'Transaction Logs', 'System Reports', 'CSV Export/Import', 'Analytics Dashboard'], link: '/login?role=librarian' }
  ]

  return (
    <div>
      {/* Navbar */}
<nav className="navbar">
  <div className="nav-container">
    <div className="logo">
      <FaBookReader size={28} />
      <span>Libra<span style={{ color: '#fff' }}>Flow</span></span>
    </div>
    <div className="nav-links">
      <a href="#home">Home</a>
      <a href="#features">Features</a>
      <a href="#portals">Portals</a>
      <a href="#about">About</a>
    </div>
    <div className="auth-buttons">
      <Link to="/login" className="btn btn-outline">Sign In</Link>
      <Link to="/register" className="btn btn-primary">Get Started</Link>
    </div>
  </div>
</nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <motion.div className="hero-content" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span style={{ background: 'var(--accent-glow)', padding: '0.25rem 1rem', borderRadius: '50px', fontSize: '0.8rem', display: 'inline-block', marginBottom: '1rem' }}>
              🚀 Next Generation Library Platform
            </span>
          </motion.div>
          <h1>Digital Library <br/><span style={{ background: 'var(--gradient-1)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Management System</span></h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '550px' }}>
            Manage books, track borrowings, calculate fines, and streamline library operations with our modern AI-powered digital platform.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
              Get Started Free <FaArrowRight />
            </Link>
            <a href="#features" className="btn btn-secondary" style={{ padding: '1rem 2rem' }}>
              <FaPlayCircle /> Watch Demo
            </a>
          </div>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem' }}>
            <div><strong style={{ fontSize: '2rem', color: 'var(--accent)' }}>1000+</strong><br/>Books</div>
            <div><strong style={{ fontSize: '2rem', color: 'var(--accent)' }}>500+</strong><br/>Users</div>
            <div><strong style={{ fontSize: '2rem', color: 'var(--accent)' }}>24/7</strong><br/>Support</div>
          </div>
        </motion.div>
        
        <motion.div className="hero-image" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="book-stack">
            <div className="book book-1"></div>
            <div className="book book-2"></div>
            <div className="book book-3"></div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '6rem 2rem', background: 'var(--secondary)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span style={{ color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>FEATURES</span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Everything You Need in<br/>Modern Library System</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem' }}>Powerful features to manage your library efficiently and provide the best experience for users</p>
          </motion.div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {features.map((feature, idx) => (
              <motion.div key={idx} className="card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <feature.icon size={40} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
                <h3>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section id="portals" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
            <span style={{ color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>ACCESS PORTALS</span>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Choose Your Role</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem' }}>Select your role to access customized dashboard and features</p>
          </motion.div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
            {portals.map((portal, idx) => (
              <motion.div key={idx} className="card" style={{ textAlign: 'left' }} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -10 }}>
                <div style={{ width: '60px', height: '60px', background: portal.gradient, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <portal.icon size={30} style={{ color: '#fff' }} />
                </div>
                <h3>{portal.title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Access all library resources and manage your activities</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {portal.features.map((f, i) => <span key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>✓ {f}</span>)}
                </div>
                <Link to={portal.link} className="btn btn-primary" style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>
                  Access Portal <FaArrowRight />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '6rem 2rem', background: 'linear-gradient(135deg, #0a0a0a, #111111)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: 'center' }}>
          <div><FaDatabase size={40} style={{ color: 'var(--accent)', marginBottom: '1rem' }} /><h3 style={{ fontSize: '2.5rem' }}>10,000+</h3><p>Books Available</p></div>
          <div><FaUsers size={40} style={{ color: 'var(--accent)', marginBottom: '1rem' }} /><h3 style={{ fontSize: '2.5rem' }}>5,000+</h3><p>Active Users</p></div>
          <div><FaStar size={40} style={{ color: 'var(--accent)', marginBottom: '1rem' }} /><h3 style={{ fontSize: '2.5rem' }}>99.9%</h3><p>Uptime</p></div>
          <div><FaClock size={40} style={{ color: 'var(--accent)', marginBottom: '1rem' }} /><h3 style={{ fontSize: '2.5rem' }}>24/7</h3><p>Support</p></div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 2rem 2rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
          <div>
            <div className="logo" style={{ marginBottom: '1rem' }}><FaBookReader size={24} /> LibraFlow</div>
            <p style={{ color: 'var(--text-secondary)' }}>Next generation library management system for modern institutions.</p>
          </div>
          <div><h4>Quick Links</h4><a href="#home" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'block', marginTop: '0.5rem' }}>Home</a><a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'block', marginTop: '0.5rem' }}>Features</a><a href="#portals" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'block', marginTop: '0.5rem' }}>Portals</a></div>
          <div><h4>Support</h4><p style={{ color: 'var(--text-secondary)' }}>Email: support@libraflow.com</p><p style={{ color: 'var(--text-secondary)' }}>Phone: +1 (555) 123-4567</p></div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <p>&copy; 2026 LibraFlow - Next Generation Library Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}