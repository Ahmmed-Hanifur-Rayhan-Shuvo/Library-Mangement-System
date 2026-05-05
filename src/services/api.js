import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:5000/api' })

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) req.headers.Authorization = `Bearer ${token}`
  return req
})

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data)
}

export const bookAPI = {
  getAll: () => API.get('/books'),
  add: (data) => API.post('/books', data),
  update: (id, data) => API.put(`/books/${id}`, data),
  delete: (id) => API.delete(`/books/${id}`)
}

export const borrowAPI = {
  borrow: (data) => API.post('/borrow', data),
  return: (data) => API.post('/return', data),
  getBorrowed: (userId) => API.get(`/borrowed/${userId}`),
  getFine: (userId) => API.get(`/fine/${userId}`),
  getHistory: (userId) => API.get(`/history/${userId}`)
}

export const userAPI = {
  getStudents: () => API.get('/users/student'),
  getFaculty: () => API.get('/users/faculty'),
  deleteUser: (userId) => API.delete(`/users/${userId}`)
}

export const transactionAPI = {
  getAll: () => API.get('/transactions')
}

export const statsAPI = {
  get: () => API.get('/stats')
}