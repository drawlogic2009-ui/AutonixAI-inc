/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Zap, Shield, BarChart3, Users, Clock, Sparkles, ArrowRight, BrainCircuit, GraduationCap, Moon, Sun, Twitter, Linkedin, Github } from 'lucide-react';
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // The URL to your actual web app. 
  // You can set this in Vercel as an Environment Variable named VITE_WEB_APP_URL
  const WEB_APP_URL = import.meta.env.VITE_WEB_APP_URL || "https://your-actual-app-url.com";
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && activeTab === 'dashboard') {
        // Optionally redirect to products on load if already logged in
      }
    });
    return () => unsubscribe();
  }, [activeTab]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name: name,
          role: 'user',
          createdAt: serverTimestamp()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowLogin(false);
      setActiveTab('download');
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password. If you don't have an account, please Sign Up first.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please Sign In.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not enabled. Please enable it in the Firebase Console.');
      } else if (err.code === 'auth/weak-password') {
        setError('Your password is too weak. Please use a stronger password.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setActiveTab('dashboard');
  };

  const navItems = [
    { id: 'dashboard', label: 'Home' },
    { id: 'services', label: 'Research' },
    { id: 'about', label: 'About' },
    ...(user ? [{ id: 'about-app', label: 'About App' }, { id: 'download', label: 'Access App' }] : []),
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 text-gray-900'}`}>
      {/* Top Navigation */}
      <header className={`sticky top-0 backdrop-blur-md border-b z-50 ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-indigo-200'}`}>
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm">
                <GraduationCap size={20} />
              </div>
              AutonixAI
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800 text-yellow-400' : 'hover:bg-gray-200 text-gray-600'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="hidden md:flex items-center space-x-2 mr-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === item.id ? (darkMode ? 'text-white' : 'text-black') : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black')
                  }`}
                >
                  {activeTab === item.id && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className={`absolute inset-0 rounded-full -z-10 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </motion.button>
              ))}
            </div>
            {user ? (
              <button 
                onClick={handleSignOut}
                className="bg-gray-100 text-black px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <button 
                onClick={() => setShowLogin(true)}
                className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Try LoomisAI
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-16"
          >
            {activeTab === 'dashboard' && (
            <section className="space-y-16">
              {/* Hero Section */}
              <div className="text-center space-y-8 py-12">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm"
                >
                  <Sparkles size={16} />
                  <span>Built out of curiosity to help people</span>
                </motion.div>
                <h2 className={`text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl mx-auto leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Harnessing AI to <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    empower human potential.
                  </span>
                </h2>
                <p className={`text-xl max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  AutonixAI is a student-led technology company integrating powerful artificial intelligence into intuitive tools, creating a perfect balance between human creativity and AI efficiency.
                </p>
                <div className="flex items-center justify-center gap-4 pt-4">
                  <button 
                    onClick={() => {
                      if (user) {
                        setActiveTab('download');
                      } else {
                        setShowLogin(true);
                      }
                    }}
                    className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 text-lg"
                  >
                    Try LoomisAI <ArrowRight size={20} />
                  </button>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 pt-12 border-t border-gray-100">
                {[
                  { icon: <BrainCircuit className="text-purple-500" />, title: "Curiosity Driven", desc: "Exploring how to integrate AI into everyday workflows, driven by a desire to see what's possible." },
                  { icon: <Users className="text-blue-500" />, title: "Human Centric", desc: "Every tool is designed to augment human capability, not replace it." },
                  { icon: <Zap className="text-yellow-500" />, title: "Rapid Innovation", desc: "Operating with agility to ship updates and new ideas at lightning speed." }
                ].map((feature, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-6 rounded-2xl border hover:shadow-lg transition-all ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-white to-blue-50 border-indigo-100'}`}
                  >
                    <div className={`w-12 h-12 rounded-xl shadow-sm flex items-center justify-center mb-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                      {feature.icon}
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
          {activeTab === 'services' && (
            <section className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className={`text-5xl font-bold tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>Focus Areas.</h2>
                <p className={`text-xl max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Active research and development of AI solutions across multiple domains aims to maximize positive impact.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: 'Educational Technology', desc: 'Building tools like LoomisAI to support teachers and enhance the learning experience for students.', color: 'bg-blue-500' },
                  { title: 'Workflow Automation', desc: 'Creating intelligent agents that handle repetitive tasks, freeing up humans for creative work.', color: 'bg-purple-500' },
                  { title: 'Accessibility Tools', desc: 'Leveraging computer vision and natural language processing to make the digital world more accessible.', color: 'bg-green-500' },
                  { title: 'Open Source Research', desc: 'Contributing findings and lightweight models back to the community to foster collaborative innovation.', color: 'bg-orange-500' }
                ].map((service, i) => (
                  <div key={i} className={`p-8 border rounded-3xl hover:shadow-xl transition-all group ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-white to-blue-50 border-indigo-100'}`}>
                    <div className={`w-3 h-12 ${service.color} rounded-full mb-6 group-hover:scale-y-110 transition-transform origin-bottom`} />
                    <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{service.title}</h3>
                    <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{service.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {activeTab === 'analytics' && (
            <section className="space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                  <h2 className={`text-5xl font-bold tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>Your Impact <span className="text-2xl text-gray-400 font-normal">(Demo Preview)</span></h2>
                  <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Once you start using the extension, this dashboard will track your real grading speed and time saved.</p>
                </div>
                <button className={`px-6 py-3 rounded-xl font-medium transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  Download Report
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className={`p-6 border rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className={`flex items-center gap-3 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock size={20} />
                    <span className="font-medium">Time Saved This Month</span>
                  </div>
                  <div className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>42.5 hrs</div>
                  <div className="text-sm text-green-600 font-medium mt-2">↑ 12% from last month</div>
                </div>
                <div className={`p-6 border rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className={`flex items-center gap-3 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <BarChart3 size={20} />
                    <span className="font-medium">Assignments Graded</span>
                  </div>
                  <div className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>1,248</div>
                  <div className="text-sm text-green-600 font-medium mt-2">↑ 8% from last month</div>
                </div>
                <div className={`p-6 border rounded-2xl shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className={`flex items-center gap-3 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Users size={20} />
                    <span className="font-medium">Students Reached</span>
                  </div>
                  <div className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>342</div>
                  <div className="text-sm text-gray-500 font-medium mt-2">Consistent</div>
                </div>
              </div>

              <div className={`p-8 border rounded-3xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-white to-blue-50 border-indigo-100'}`}>
                <h3 className={`text-xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Grading Velocity (Last 7 Days)</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                  {[40, 70, 45, 90, 65, 30, 85].map((height, i) => (
                    <div key={i} className={`w-full rounded-t-lg relative group ${darkMode ? 'bg-gray-700' : 'bg-blue-100'}`}>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg"
                      />
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded transition-opacity">
                        {height} docs
                      </div>
                    </div>
                  ))}
                </div>
                <div className={`flex justify-between mt-4 text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </section>
          )}
          {activeTab === 'about-app' && user && (
            <section className="space-y-16 py-12">
              {/* About LoomisAI Story */}
              <div className="space-y-12">
                <div className="text-center space-y-6 max-w-3xl mx-auto">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg mx-auto mb-6">
                    <GraduationCap size={32} />
                  </div>
                  <h1 className={`text-4xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>LoomisAI</h1>
                  <h2 className={`text-5xl font-bold tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>Built out of curiosity. <br/>Made to help people.</h2>
                  <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    AutonixAI is a student-led company driven by a simple question: "How can AI be used to make people's lives better?" LoomisAI is the first answer. Seeing teachers drowning in paperwork inspired the creation of a tool designed to give them their weekends back.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
                  <div className="space-y-6">
                    <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>The Honest Truth</h3>
                    <ul className="space-y-4">
                      {[
                        "Designed and coded by a single student developer",
                        "Built rapidly using advanced AI coding tools",
                        "Currently an early-stage prototype",
                        "Driven by passion, not a corporate budget"
                      ].map((item, i) => (
                        <li key={i} className={`flex items-center gap-3 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                          <CheckCircle2 className="text-green-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-8 rounded-3xl text-center space-y-2 ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                      <div className="text-4xl font-bold text-blue-600">1</div>
                      <div className="text-sm font-medium text-blue-800 uppercase tracking-wider">Solo Dev</div>
                    </div>
                    <div className={`p-8 rounded-3xl text-center space-y-2 ${darkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
                      <div className="text-4xl font-bold text-purple-600">v0.1</div>
                      <div className="text-sm font-medium text-purple-800 uppercase tracking-wider">Prototype</div>
                    </div>
                    <div className={`p-8 rounded-3xl text-center space-y-2 ${darkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
                      <div className="text-4xl font-bold text-green-600">100%</div>
                      <div className="text-sm font-medium text-green-800 uppercase tracking-wider">Passion</div>
                    </div>
                    <div className={`p-8 rounded-3xl text-center space-y-2 ${darkMode ? 'bg-gray-800' : 'bg-orange-50'}`}>
                      <div className="text-4xl font-bold text-orange-600">$0</div>
                      <div className="text-sm font-medium text-orange-800 uppercase tracking-wider">Budget</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
          {activeTab === 'download' && user && (
            <section className="space-y-16">
              {/* Access Section */}
              <div className={`space-y-6 pt-12 border-t ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <h2 className={`text-4xl font-medium tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>Get Started</h2>
                <p className={`text-lg max-w-3xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Access the LoomisAI Web App for free, or upgrade to Pro to unlock our powerful browser extension.
                </p>
                <div className="grid md:grid-cols-2 gap-8 mt-8">
                  <div className={`p-8 border rounded-2xl shadow-sm hover:shadow-md transition-shadow ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${darkMode ? 'bg-gray-900 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 className={`text-2xl font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>LoomisAI Web App</h3>
                    <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>The ultimate AI assistant. Grade, analyze, and optimize your workflow directly from our powerful web dashboard.</p>
                    <button 
                      onClick={() => window.location.href = WEB_APP_URL} 
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto flex items-center justify-center gap-2">
                      Open Web App <span className="text-blue-200 text-sm">Free</span>
                    </button>
                  </div>
                  <div className={`p-8 border rounded-2xl shadow-sm hover:shadow-md transition-shadow ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${darkMode ? 'bg-gray-900 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    </div>
                    <h3 className={`text-2xl font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>LoomisAI Pro Extension</h3>
                    <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Grade assignments anywhere on the web with our Chrome extension. Exclusive to LoomisAI Pro members.</p>
                    <button className={`px-6 py-2.5 rounded-lg font-medium transition-colors w-full sm:w-auto ${darkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
          {activeTab === 'about' && (
            <section className="space-y-16 py-16 text-center">
              <div className="max-w-3xl mx-auto space-y-8">
                <h2 className={`text-5xl font-bold tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>About AutonixAI</h2>
                <p className={`text-xl leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  AutonixAI is a student-led initiative dedicated to building AI-powered tools that simplify complex workflows. We believe in the power of curiosity and human-centric design to create technology that genuinely helps people. We are pushing the boundaries of what's possible in educational technology, exploring new ways to make learning and teaching more efficient and accessible for everyone.
                </p>
              </div>

              {/* Disclaimers Section */}
              <div className="pt-8 max-w-3xl mx-auto space-y-4 text-left">
                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Powered by Gemini</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Powered by the Gemini API.
                  </p>
                </div>

                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Privacy & Usage Notice</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <strong>Important:</strong> Do not upload files containing personal names or private school IDs. This app uses the Gemini Free Tier, and data may be processed by Google.
                  </p>
                </div>

                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Service Availability</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    If it doesn't work, wait and try again. This is a free AI tier!
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-6 pt-8">
                <a href="#" className={`p-3 rounded-full transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}><Twitter size={24} /></a>
                <a href="#" className={`p-3 rounded-full transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}><Linkedin size={24} /></a>
                <a href="#" className={`p-3 rounded-full transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}><Github size={24} /></a>
              </div>
            </section>
          )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className={`border-t mt-auto ${darkMode ? 'border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900' : 'border-gray-100 bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm">
              <GraduationCap size={14} />
            </div>
            <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>AutonixAI</span>
          </div>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Built out of curiosity to help people.</p>
          <p className={`text-sm mt-3 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>© {new Date().getFullYear()} AutonixAI. All rights reserved.</p>
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogin(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className={`p-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <button 
                  onClick={() => setShowLogin(false)}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                >
                  <X size={20} />
                </button>
                
                <div className="text-center mb-8">
                  <h2 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {isSignUp ? 'Create an account' : 'Welcome back'}
                  </h2>
                  <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {isSignUp ? 'Sign up for your LoomisAI account' : 'Sign in to your LoomisAI account'}
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleAuth}>
                  {error && (
                    <div className={`p-3 text-sm rounded-lg ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
                      {error}
                    </div>
                  )}
                  {isSignUp && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={isSignUp}
                        className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${darkMode ? 'bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-blue-500' : 'border-gray-300 focus:ring-2 focus:ring-black focus:border-black'}`}
                        placeholder="John Doe"
                      />
                    </div>
                  )}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${darkMode ? 'bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-blue-500' : 'border-gray-300 focus:ring-2 focus:ring-black focus:border-black'}`}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${darkMode ? 'bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-blue-500' : 'border-gray-300 focus:ring-2 focus:ring-black focus:border-black'}`}
                      placeholder="••••••••"
                    />
                  </div>
                  {!isSignUp && (
                    <div className="flex items-center justify-between">
                      <label className={`flex items-center space-x-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <input type="checkbox" className={`rounded border-gray-300 ${darkMode ? 'bg-gray-800' : 'text-black'}`} />
                        <span>Remember me</span>
                      </label>
                      <a href="#" className={`text-sm font-medium hover:underline ${darkMode ? 'text-blue-400' : 'text-black'}`}>Forgot password?</a>
                    </div>
                  )}
                  <button 
                    disabled={loading}
                    className={`w-full py-2.5 rounded-lg font-medium transition-colors mt-6 disabled:opacity-70 ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-black text-white hover:bg-gray-800'}`}
                  >
                    {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                  </button>
                </form>

                <div className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button 
                    onClick={() => setIsSignUp(!isSignUp)} 
                    className={`font-medium hover:underline ${darkMode ? 'text-blue-400' : 'text-black'}`}
                  >
                    {isSignUp ? 'Sign in' : 'Sign up'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
