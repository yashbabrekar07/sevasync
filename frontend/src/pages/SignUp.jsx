import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { signupUser } from "../api";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    location: "",
    gender: "",
    password: "",
    role: "volunteer"
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const data = await signupUser(formData);
      // Store real token and user data
      localStorage.setItem("sevasync_token", data.token);
      localStorage.setItem("sevasync_user", JSON.stringify(data.user));
      navigate(data.user.role === "ngo" ? "/ngo-dashboard" : "/volunteer-dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-3xl shadow-soft w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Join SevaSync</h2>
          <p className="text-gray-500 mt-2">Create an account to start making an impact</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-5">
          <div className="flex gap-4">
            <button
              type="button"
              className={`flex-1 py-3 rounded-xl font-medium transition ${formData.role === 'volunteer' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setFormData({ ...formData, role: 'volunteer' })}
            >
              Volunteer
            </button>
            <button
              type="button"
              className={`flex-1 py-3 rounded-xl font-medium transition ${formData.role === 'ngo' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setFormData({ ...formData, role: 'ngo' })}
            >
              NGO
            </button>
          </div>

          <input type="text" name="name" placeholder={formData.role === 'ngo' ? "NGO Name" : "Full Name"} required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            onChange={handleChange}
          />
          <input type="email" name="email" placeholder="Email Address" required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition"
            onChange={handleChange}
          />
          <input type="text" name="contact" placeholder="Contact Number" required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition"
            onChange={handleChange}
          />
          <input type="text" name="location" placeholder="City, State, Country" required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition"
            onChange={handleChange}
          />
          {formData.role === 'volunteer' && (
            <select name="gender" required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition text-gray-700"
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          )}
          <input type="password" name="password" placeholder="Password" required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition"
            onChange={handleChange}
          />

          <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-blue-600 transition transform hover:-translate-y-0.5 mt-4">
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
