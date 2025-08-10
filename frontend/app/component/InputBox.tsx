'use client'

import React, { ChangeEvent } from 'react'
import { motion } from 'framer-motion'

interface InputBoxProps {
  label: string
  type?: string
  placeholder: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export const InputBox: React.FC<InputBoxProps> = ({ label, type = 'text', placeholder, onChange }) => {
  return (
    <motion.div
      className="mb-4 rounded-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.label
        className="text-white font-bold text-xl mb-4 block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {label}
      </motion.label>
      <motion.input
        onChange={onChange}
        className="mt-3 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        placeholder={placeholder}
        type={type}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        whileFocus={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      />
    </motion.div>
  )
}

export default InputBox