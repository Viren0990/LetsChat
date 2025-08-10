'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface TitleProps {
  title: string
  subTitle: string
}

export const Title: React.FC<TitleProps> = ({ title, subTitle }) => {
  return (
    <motion.div
      className="flex items-center justify-center mb-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <motion.h1
          className="text-white text-4xl font-bold pl-11"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {title}
        </motion.h1>
        <motion.p
          className="text-gray-400"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {subTitle}
        </motion.p>
      </div>
    </motion.div>
  )
}

export default Title