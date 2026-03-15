import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Settings as SettingsType } from '../../types';
import { Save, RefreshCw, Globe, Phone, Mail, MapPin, CreditCard, Truck, Trash2 } from 'lucide-react';
import { seedData, deleteProducts } from '../../lib/seed';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const snap = await getDoc(doc(db, 'settings', 'store'));
      if (snap.exists()) {
        setSettings(snap.data() as SettingsType);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await setDoc(doc(db, 'settings', 'store'), {
        ...settings,
        updatedAt: new Date().toISOString(),
      });
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setMessage({ type: '', text: '' });
    try {
      await seedData();
      setMessage({ type: 'success', text: 'Database seeded successfully! Refreshing...' });
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Seeding failed.' });
    } finally {
      setSeeding(false);
    }
  };

  const handleDeleteSamples = async () => {
    setDeleting(true);
    setMessage({ type: '', text: '' });
    try {
      await deleteProducts();
      setMessage({ type: 'success', text: 'All products deleted successfully! Refreshing...' });
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to delete products.' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-stone-400 italic">Loading settings...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif">Store Settings</h1>
          <p className="text-stone-500 text-sm">Configure your boutique details and preferences</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleDeleteSamples}
            disabled={deleting || seeding}
            className="px-6 py-3 border border-red-200 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 size={18} className={deleting ? 'animate-pulse' : ''} /> 
            {deleting ? 'Deleting...' : 'Delete Products'}
          </button>
          <button 
            onClick={handleSeed}
            disabled={seeding || deleting}
            className="px-6 py-3 border border-stone-200 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-stone-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={seeding ? 'animate-spin' : ''} /> 
            {seeding ? 'Seeding...' : 'Seed Data'}
          </button>
          <button 
            form="settings-form"
            disabled={saving}
            className="bg-stone-900 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
        {/* General Info */}
        <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Globe size={16} /> General Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Store Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 bg-stone-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-stone-900"
                value={settings?.storeName || ''}
                onChange={(e) => setSettings(s => s ? { ...s, storeName: e.target.value } : null)}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Currency Code</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 bg-stone-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-stone-900"
                value={settings?.currency || ''}
                onChange={(e) => setSettings(s => s ? { ...s, currency: e.target.value } : null)}
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Phone size={16} /> Contact Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input 
                  type="email" 
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-stone-900"
                  value={settings?.email || ''}
                  onChange={(e) => setSettings(s => s ? { ...s, email: e.target.value } : null)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input 
                  type="tel" 
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-stone-900"
                  value={settings?.phone || ''}
                  onChange={(e) => setSettings(s => s ? { ...s, phone: e.target.value } : null)}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Physical Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-stone-400" size={16} />
                <textarea 
                  rows={3}
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-stone-900"
                  value={settings?.address || ''}
                  onChange={(e) => setSettings(s => s ? { ...s, address: e.target.value } : null)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Shipping */}
        <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <CreditCard size={16} /> Payment & Shipping
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Standard Delivery Fee</label>
              <div className="relative">
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input 
                  type="number" 
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-stone-900"
                  value={settings?.deliveryFee || 0}
                  onChange={(e) => setSettings(s => s ? { ...s, deliveryFee: Number(e.target.value) } : null)}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Bank Transfer Instructions</label>
              <textarea 
                rows={4}
                className="w-full px-4 py-2 bg-stone-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-stone-900"
                value={settings?.bankTransferInstructions || ''}
                onChange={(e) => setSettings(s => s ? { ...s, bankTransferInstructions: e.target.value } : null)}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
