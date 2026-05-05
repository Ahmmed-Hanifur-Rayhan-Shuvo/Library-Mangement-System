import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [role, setRole] = useState('student')
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userId || !password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      const res = await authAPI.login({ userId, password, role })
      if (res.data.success) {
        login(res.data.user, res.data.role, res.data.token)
        toast.success(`Welcome back, ${res.data.user.name}!`)
        navigate(`/${res.data.role}-dashboard`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'var(--card-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: '32px', padding: '2.5rem', width: '100%', maxWidth: '480px' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <FaArrowLeft /> Back to Home
        </Link>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', background: 'var(--gradient-1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <FaUserGraduate size={30} />
          </div>
          <h2>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Account Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                { role: 'student', icon: FaUserGraduate, label: 'Student', hint: 'S1001' },
                { role: 'faculty', icon: FaChalkboardTeacher, label: 'Faculty', hint: 'F101' },
                { role: 'librarian', icon: FaUserTie, label: 'Librarian', hint: 'L10' }
              ].map(r => (
                <button key={r.role} type="button" onClick={() => setRole(r.role)} style={{
                  padding: '0.75rem', borderRadius: '16px', border: role === r.role ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: role === r.role ? 'rgba(0,255,136,0.1)' : 'transparent', color: 'white', cursor: 'pointer', transition: 'all 0.3s'
                }}>
                  <r.icon size={20} style={{ color: role === r.role ? 'var(--accent)' : 'var(--text-secondary)', marginBottom: '0.25rem' }} />
                  <div style={{ fontSize: '0.8rem' }}>{r.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>User ID</label>
            <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} 
              placeholder={role === 'student' ? 'Enter Student ID (e.g., S1001)' : role === 'faculty' ? 'Enter Faculty ID (e.g., F101)' : 'Enter Librarian ID (e.g., L10)'} required />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required 
                style={{ paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1rem', justifyContent: 'center' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Create Account</Link>
          </p>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '16px' }}>
            <p style={{ fontSize: '0.75rem', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Demo Credentials</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.7rem' }}>
              <div><span style={{ color: 'var(--accent)' }}>Student:</span> S1001<br/>password123</div>
              <div><span style={{ color: 'var(--accent)' }}>Faculty:</span> F101<br/>faculty123</div>
              <div><span style={{ color: 'var(--accent)' }}>Librarian:</span> L10<br/>admin123</div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}