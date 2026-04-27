import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: "ngo", text: "Hello! Thank you for accepting this task.", time: "10:00 AM" },
    { id: 2, sender: "volunteer", text: "Happy to help! What should I bring?", time: "10:05 AM" }
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem("sevasync_user")) || { role: "volunteer" };
  const currentRole = user.role;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: currentRole,
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputText("");

    // Simulate auto-reply for demo purposes
    if (currentRole === "volunteer" && inputText.toLowerCase().includes("bring")) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: "ngo",
          text: "Just bring yourself! We have all the supplies ready.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 1500);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 overflow-hidden flex flex-col mb-4 border border-gray-100"
            style={{ height: "450px" }}
          >
            {/* Chat Header */}
            <div className="bg-primary text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  💬
                </div>
                <div>
                  <h3 className="font-bold leading-tight">Task Discussion</h3>
                  <p className="text-xs text-blue-100">Usually replies in 5m</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
              <div className="text-center text-xs text-gray-400 mb-2">Today</div>
              {messages.map((msg) => {
                const isMe = msg.sender === currentRole;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                      isMe 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
              <button 
                type="submit" 
                disabled={!inputText.trim()}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                  inputText.trim() ? 'bg-primary text-white shadow-md hover:bg-blue-600' : 'bg-gray-100 text-gray-400'
                }`}
              >
                <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-r from-primary to-blue-600 text-white rounded-full shadow-xl flex items-center justify-center text-3xl focus:outline-none border-4 border-white"
      >
        {isOpen ? '✕' : '💬'}
      </motion.button>
    </div>
  );
}
