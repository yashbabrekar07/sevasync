import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("sevasync_user")) || { name: "", email: "", role: "" };
  
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    password: "",
    newPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    alert("Profile information updated successfully! (Mocked for hackathon demo)");
    const updatedUser = { ...user, name: formData.name, email: formData.email };
    localStorage.setItem("sevasync_user", JSON.stringify(updatedUser));
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to completely delete your account? This action cannot be undone.")) {
      localStorage.removeItem("sevasync_token");
      localStorage.removeItem("sevasync_user");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white shadow-sm p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="text-sm text-gray-500">Manage your account settings</p>
        </div>
        <Link 
          to={user.role === "ngo" ? "/ngo-dashboard" : "/volunteer-dashboard"} 
          className="text-primary font-medium hover:underline"
        >
          Back to Dashboard
        </Link>
      </header>

      <main className="p-6 flex justify-center mt-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-soft w-full max-w-lg"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-100 text-primary rounded-full flex items-center justify-center text-2xl font-bold uppercase">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-sm text-gray-500 capitalize">{user.role} Account</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-md font-bold text-gray-800 mb-4">Change Password</h3>
              <div className="space-y-4">
                <input type="password" name="password" placeholder="Current Password" value={formData.password} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
                <input type="password" name="newPassword" placeholder="New Password" value={formData.newPassword} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
              </div>
            </div>

            <div className="pt-6">
              <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-md hover:bg-blue-600 transition">
                Save Changes
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-red-100">
            <h3 className="text-md font-bold text-red-600 mb-2">Danger Zone</h3>
            <p className="text-sm text-gray-500 mb-4">Once you delete your account, there is no going back.</p>
            <button 
              onClick={handleDelete}
              className="w-full bg-red-50 text-red-600 border border-red-200 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition"
            >
              Delete Account
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
