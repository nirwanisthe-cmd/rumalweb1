import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send this to a backend or Firebase
    setStatus({ type: 'success', text: "Thank you for your message. We'll get back to you shortly." });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-3xl mx-auto text-center mb-20">
        <h1 className="text-5xl font-serif mb-8">Get in Touch</h1>
        <p className="text-stone-500 leading-relaxed">
          Have a question about our collections or need assistance with an order? 
          Our team is here to help you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Contact Info */}
        <div className="space-y-12">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail size={20} className="text-stone-900" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-2">Email Us</h3>
              <p className="text-stone-900 font-bold">hello@luxeboutique.lk</p>
              <p className="text-stone-500 text-sm">Response within 24 hours</p>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Phone size={20} className="text-stone-900" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-2">Call Us</h3>
              <p className="text-stone-900 font-bold">+94 11 234 5678</p>
              <p className="text-stone-500 text-sm">Mon - Sat, 9am - 6pm</p>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin size={20} className="text-stone-900" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-2">Visit Us</h3>
              <p className="text-stone-900 font-bold">123 Fashion Ave, Colombo 07</p>
              <p className="text-stone-500 text-sm">Sri Lanka</p>
            </div>
          </div>

          <div className="pt-8 border-t border-stone-100">
            <h3 className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-6">Connect with us</h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 border border-stone-200 rounded-full flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="w-10 h-10 border border-stone-200 rounded-full flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all">
                <Send size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-stone-50 p-8 md:p-12 rounded-3xl">
          {status.text && (
            <div className={`mb-8 p-4 rounded-xl text-sm border ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              {status.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-3">Your Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-6 py-4 bg-white border border-stone-100 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-3">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-6 py-4 bg-white border border-stone-100 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-3">Subject</label>
              <input 
                type="text" 
                required
                className="w-full px-6 py-4 bg-white border border-stone-100 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-3">Message</label>
              <textarea 
                rows={6}
                required
                className="w-full px-6 py-4 bg-white border border-stone-100 rounded-xl focus:outline-none focus:border-stone-900 transition-colors"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            <button className="bg-stone-900 text-white px-12 py-5 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-stone-800 transition-all flex items-center gap-3">
              Send Message <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
