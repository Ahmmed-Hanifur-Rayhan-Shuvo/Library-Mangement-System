import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaEye, FaEyeSlash, FaArrowLeft, FaCheckCircle } from 'react-icons/fa'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [role, setRole] = useState('student')
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    roll_number: '', batch: '', semester: '', department: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return }
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (!agreeTerms) { toast.error('Please agree to the terms and conditions'); return }
    
    setLoading(true)
    try {
      const submitData = { name: formData.name, password: formData.password, role, email: formData.email, phone: formData.phone }
      if (role === 'student') {
        submitData.roll_number = formData.roll_number; submitData.batch = formData.batch
        submitData.semester = formData.semester; submitData.department = formData.department
      } else if (role === 'faculty') { submitData.department = formData.department }
      
      const res = await authAPI.register(submitData)
      if (res.data.success) {
        toast.success(`Registration successful! Your ID: ${res.data.user.user_id}`)
        login(res.data.user, role, res.data.token)
        navigate(`/${role}-dashboard`)
      }
    } catch (error) { toast.error(error.response?.data?.message || 'Registration failed') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'var(--card-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: '32px', padding: '2.5rem', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <FaArrowLeft /> Back to Home
        </Link>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', background: 'var(--gradient-1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <FaUserGraduate size={30} />
          </div>
          <h2>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Join the next generation library platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Account Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                { role: 'student', icon: FaUserGraduate, label: 'Student' },
                { role: 'faculty', icon: FaChalkboardTeacher, label: 'Faculty' },
                { role: 'librarian', icon: FaUserTie, label: 'Librarian' }
              ].map(r => (
                <button key={r.role} type="button" onClick={() => setRole(r.role)} style={{
                  padding: '0.75rem', borderRadius: '16px', border: role === r.role ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: role === r.role ? 'rgba(0,255,136,0.1)' : 'transparent', cursor: 'pointer', transition: 'all 0.3s'
                }}>
                  <r.icon size={20} style={{ color: role === r.role ? 'var(--accent)' : 'var(--text-secondary)' }} />
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{r.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" /></div>
            <div><label>Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+8801XXXXXXXXX" /></div>
          </div>

          {role === 'student' && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label>Roll Number *</label>
                <input type="text" name="roll_number" value={formData.roll_number} onChange={handleChange} placeholder="Enter your roll number" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div><label>Batch *</label><input type="text" name="batch" value={formData.batch} onChange={handleChange} placeholder="2023" required /></div>
                <div><label>Semester *</label>
                  <select name="semester" value={formData.semester} onChange={handleChange} required>
                    <option value="">Select</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {(role === 'student' || role === 'faculty') && (
            <div style={{ marginBottom: '1rem' }}>
              <label>Department</label>
              <select name="department" value={formData.department} onChange={handleChange}>
                <option value="">Select Department</option>
                <option value="CSE">Computer Science & Engineering</option>
                <option value="EEE">Electrical & Electronics Engineering</option>
                <option value="CIVIL">Civil Engineering</option>
                <option value="BBA">Business Administration</option>
                <option value="LAW">Law</option>
                <option value="ENGLISH">English</option>
              </select>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password *</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Create a password (min 6 characters)" required style={{ paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Confirm Password *</label>
            <div style={{ position: 'relative' }}>
              <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required style={{ paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length >= 6 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.25rem', display: 'block' }}><FaCheckCircle style={{ display: 'inline', marginRight: '0.25rem' }} /> Passwords match</span>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} style={{ width: 'auto' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>I agree to the <span style={{ color: 'var(--accent)' }}>Terms of Service</span> and <span style={{ color: 'var(--accent)' }}>Privacy Policy</span></span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1rem', justifyContent: 'center' }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign In</Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}