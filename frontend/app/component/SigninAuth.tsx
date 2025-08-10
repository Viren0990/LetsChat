'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { motion } from 'framer-motion'
import { InputBox } from './InputBox'
import { Title } from './Title'

export const SigninAuth: React.FC = () => {
  const router = useRouter()
  const [postInputs, setPostInputs] = useState({
    email: '',
    password: '',
  })

  async function sendRequest() {
    try {
      const response = await axios.post('http://localhost:3000/api/v1/user/signin', postInputs)
      const jwt = response.data.token
      localStorage.setItem('token', jwt)
      router.push('/landing')
    } catch (e) {
      alert('Error while signing in')
    }
  }

  return (
    <motion.div
      className="bg-gray-800 flex justify-center p-10 rounded-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="justify-center items-center" style={{ width: '370px' }}>
        <Title title="Join LetsChat" subTitle="Start chatting with people around the world" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <InputBox
            label="Email Address"
            type="email"
            placeholder="abc@gmail.com"
            onChange={(e) => {
              setPostInputs({
                ...postInputs,
                email: e.target.value,
              })
            }}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <InputBox
            label="Password"
            type="password"
            placeholder="********"
            onChange={(e) => {
              setPostInputs({
                ...postInputs,
                password: e.target.value,
              })
            }}
          />
        </motion.div>
        <motion.button
          onClick={sendRequest}
          className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Sign In
        </motion.button>
        <motion.p
          className="mt-12 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Don't have an Account?{' '}
          <motion.a
            href="/signup"
            className="font-medium text-teal-400 hover:text-teal-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Signup
          </motion.a>
        </motion.p>
      </div>
    </motion.div>
  )
}

export default SigninAuth