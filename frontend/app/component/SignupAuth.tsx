"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import { InputBox } from './InputBox';
import { Title } from './Title';
import { motion, AnimatePresence } from 'framer-motion';

export const SignupAuth = () => {
    const router = useRouter();
    const [postInputs, setPostInputs] = useState({
        email: "",
        username: "",
        password: ""
    });
    const [notification, setNotification] = useState({
        message: "",
        type: "" // "success" or "error"
    });

    async function sendRequest() {
        try {
            await axios.post('http://localhost:3000/api/v1/user/signup', postInputs, {
                withCredentials: true,
            });
            setNotification({
                message: "Account created successfully!",
                type: "success"
            });
            setTimeout(() => {
                router.push('/signin'); // Navigate to /signin
            }, 2000);
        } catch (e) {
            setNotification({
                message: "Error while signing up",
                type: "error"
            });
            setTimeout(() => {
                setNotification({
                    message: "",
                    type: ""
                });
            }, 3000);
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 flex justify-center p-10 rounded-lg"
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
                                email: e.target.value
                            });
                        }} 
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <InputBox 
                        label="Username" 
                        type="text" 
                        placeholder="cooluser123" 
                        onChange={(e) => {
                            setPostInputs({
                                ...postInputs,
                                username: e.target.value
                            });
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
                                password: e.target.value
                            });
                        }} 
                    />
                </motion.div>
                <motion.button 
                    onClick={sendRequest} 
                    className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Sign Up
                </motion.button>
                <motion.p 
                    className="mt-12 text text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    Already have an Account? <a href="/signin" className="font-medium text-teal-400 hover:text-teal-300">Signin</a>
                </motion.p>
                <AnimatePresence>
                    {notification.message && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            transition={{ duration: 0.3 }}
                            className={`mt-4 p-2 rounded-md ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white text-center`}
                        >
                            {notification.message}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};