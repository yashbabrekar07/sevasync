import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg font-sans selection:bg-primary selection:text-white overflow-hidden">
      
      {/* Floating Glass Navbar */}
      <nav className="fixed w-full z-50 transition-all duration-300 backdrop-blur-md bg-white/80 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center shadow-lg text-white font-bold text-xl">
              S
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">SevaSync</span>
          </Link>
          <div className="hidden md:flex space-x-8 items-center font-medium text-gray-600">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
          </div>
          <div className="flex space-x-4 items-center">
            <Link to="/login" className="text-gray-600 hover:text-primary transition font-semibold">Log in</Link>
            <Link to="/signup" className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12 max-w-7xl mx-auto w-full flex-1 flex flex-col lg:flex-row items-center justify-between gap-12">
        <motion.div 
          initial="hidden" animate="visible" variants={containerVariants}
          className="flex-1 text-center lg:text-left z-10"
        >
          <motion.div variants={itemVariants} className="inline-block px-4 py-2 bg-blue-50 text-primary rounded-full text-sm font-bold mb-6 border border-blue-100 shadow-sm">
            🚀 The Smart Coordination Platform
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            Connecting Needs <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-green-400">
              With Action
            </span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            SevaSync helps NGOs collect community data, prioritize urgent needs using AI, and instantly connect the right volunteers to the right tasks.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/signup" className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
              Start Helping Today
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
            <Link to="/login" className="w-full sm:w-auto bg-white text-gray-800 border-2 border-gray-100 px-8 py-4 rounded-full text-lg font-bold shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 flex items-center justify-center">
              NGO Login
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          initial="hidden" animate="visible" variants={slideInRight}
          className="flex-1 w-full max-w-lg lg:max-w-xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-green-300/20 blur-3xl rounded-full transform -translate-y-10 scale-110 -z-10"></div>
          <img src="/hero_illustration.png" alt="Volunteers working together" className="w-full h-auto drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500" />
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-white px-6 lg:px-12 border-t border-gray-50">
        <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-16">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={slideInLeft}
            className="flex-1 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-300/20 to-primary/20 blur-3xl rounded-full transform scale-110 -z-10"></div>
            <img src="/how_it_works_illustration.png" alt="Platform connecting users" className="w-full h-auto drop-shadow-xl hover:-translate-y-2 transition-transform duration-500 rounded-3xl" />
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}
            className="flex-1"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">How SevaSync Works</h2>
            <p className="text-xl text-gray-600 mb-12">A seamless workflow designed to maximize community impact while minimizing organizational friction.</p>
            
            <div className="space-y-8">
              {[
                { step: "01", title: "NGOs Identify Needs", desc: "Organizations upload community issues, detailing the location, required skills, and urgency.", color: "text-blue-600", bg: "bg-blue-100" },
                { step: "02", title: "AI Prioritizes & Matches", desc: "Our system analyzes the urgency and automatically alerts the closest, most qualified volunteers.", color: "text-purple-600", bg: "bg-purple-100" },
                { step: "03", title: "Volunteers Take Action", desc: "Volunteers accept tasks via their dashboard, complete the work, and track their positive impact.", color: "text-green-600", bg: "bg-green-100" }
              ].map((item, i) => (
                <motion.div key={i} variants={itemVariants} className="flex gap-6 items-start group">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 transition-transform group-hover:scale-110 ${item.bg} ${item.color}`}>
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-lg">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-gray-900 mb-6"
          >
            Powerful Tools for Meaningful Change
          </motion.h2>
          <p className="text-xl text-gray-600">Everything you need to organize relief efforts, manage volunteers, and track the impact of your actions.</p>
        </div>

        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {[
            { title: "Smart Data Collection", desc: "Easily gather and organize community issues in a central hub.", icon: "📊", color: "from-blue-400 to-blue-600" },
            { title: "AI Priority Detection", desc: "Automatically detect and flag the most urgent tasks instantly.", icon: "⚡", color: "from-red-400 to-red-600" },
            { title: "Volunteer Matching", desc: "Connect the right skills to the right challenges automatically.", icon: "🤝", color: "from-purple-400 to-purple-600" },
            { title: "Impact Tracking", desc: "Measure, visualize, and share the difference your team makes.", icon: "📈", color: "from-green-400 to-green-600" }
          ].map((feature, i) => (
            <motion.div 
              key={i} variants={itemVariants}
              className="bg-white p-8 rounded-3xl shadow-soft border border-gray-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-3 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-md bg-gradient-to-br text-white ${feature.color}`}>
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full mb-10">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}
          className="bg-gradient-to-br from-gray-900 via-blue-900 to-primary rounded-[2.5rem] p-10 md:p-20 text-center text-white shadow-2xl relative overflow-hidden"
        >
          {/* Subtle glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/40 blur-3xl rounded-full transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
          
          <h3 className="text-4xl md:text-5xl font-extrabold mb-6 relative z-10">Ready to Make a Real Difference?</h3>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 font-medium max-w-3xl mx-auto relative z-10">
            Join thousands of volunteers and NGOs working together to build better, more resilient communities.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 relative z-10">
            <Link to="/signup" className="bg-white text-gray-900 px-10 py-4 rounded-full text-xl font-bold shadow-xl hover:shadow-2xl hover:bg-gray-50 transition transform hover:-translate-y-1 w-full sm:w-auto">
              Create an Account
            </Link>
            <Link to="/about" className="bg-transparent border-2 border-white/40 text-white px-10 py-4 rounded-full text-xl font-bold hover:bg-white/10 hover:border-white transition w-full sm:w-auto">
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6 lg:px-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">S</div>
              <span className="text-2xl font-bold text-white">SevaSync</span>
            </div>
            <p className="text-gray-500 max-w-sm">
              Empowering NGOs and volunteers through smart technology and real-time coordination.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-primary transition">For NGOs</a></li>
              <li><a href="#" className="hover:text-primary transition">For Volunteers</a></li>
              <li><a href="#" className="hover:text-primary transition">How it Works</a></li>
              <li><a href="#" className="hover:text-primary transition">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-primary transition">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center border-t border-gray-800 pt-8 text-sm">
          <p>© 2026 SevaSync by TechInnovators. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
