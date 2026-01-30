import React, { useState, useEffect } from 'react';
import { Phone, UserPlus, AlertCircle, Shield, Heart, Edit2, Trash2, Save, X, Loader, Activity } from 'lucide-react';
import { ProfileService } from '../services/profileService';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

const EmergencyContacts: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', relation: '' });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const profile = await ProfileService.getProfile();
      if (profile?.emergency_contact) {
        const contactData = profile.emergency_contact;
        if (Array.isArray(contactData)) {
          setContacts(contactData);
        } else if (contactData.name) {
          setContacts([{ ...contactData, id: '1' }]);
        }
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToDb = async (updatedContacts: EmergencyContact[]) => {
    try {
      await ProfileService.updateProfile({ emergency_contact: updatedContacts });
    } catch (error) {
      alert('Failed to save contacts. Please try again.');
    }
  };

  const governmentNumbers = [
    { name: 'Emergency', number: '911', icon: AlertCircle, color: 'from-rose-500 to-rose-600' },
    { name: 'Police', number: '100', icon: Shield, color: 'from-blue-500 to-blue-600' },
    { name: 'Fire', number: '101', icon: AlertCircle, color: 'from-orange-500 to-orange-600' },
    { name: 'Medical', number: '102', icon: Heart, color: 'from-emerald-500 to-emerald-600' },
  ];

  const handleAdd = async () => {
    if (formData.name && formData.phone && formData.relation) {
      const newContacts = [...contacts, { ...formData, id: Date.now().toString() }];
      setContacts(newContacts);
      await saveToDb(newContacts);
      setFormData({ name: '', phone: '', relation: '' });
      setIsAdding(false);
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setFormData({ name: contact.name, phone: contact.phone, relation: contact.relation });
  };

  const handleUpdate = async () => {
    if (formData.name && formData.phone && formData.relation) {
      const newContacts = contacts.map(c => c.id === editingId ? { ...c, ...formData } : c);
      setContacts(newContacts);
      await saveToDb(newContacts);
      setEditingId(null);
      setFormData({ name: '', phone: '', relation: '' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      const newContacts = contacts.filter(c => c.id !== id);
      setContacts(newContacts);
      await saveToDb(newContacts);
    }
  };

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 pb-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full filter blur-[120px] animate-pulse"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-10 text-left">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-white/90 backdrop-blur-sm shadow-xl border border-blue-200 p-4 rounded-[2rem]">
              <Phone className="w-8 h-8 text-rose-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight uppercase italic">SOS Protocols</h1>
              <p className="text-gray-600 font-medium">Instant access to life-saving infrastructure</p>
            </div>
          </div>
        </div>

        {/* Global Dispatch Controls */}
        <div className="bg-white/90 backdrop-blur-sm shadow-xl border border-blue-100 rounded-[2.5rem] p-10 mb-8">
          <div className="flex items-center space-x-3 mb-8 px-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <h2 className="text-xs font-black text-rose-500 uppercase tracking-widest">Priority Dispatch Services</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {governmentNumbers.map((service) => (
              <button
                key={service.number}
                onClick={() => handleCall(service.number)}
                className="group relative bg-white/80 backdrop-blur-sm border border-blue-200 rounded-[2rem] p-6 hover:bg-blue-50 transition-all active:scale-95 text-center overflow-hidden shadow-md hover:shadow-lg"
              >
                <div className={`bg-gradient-to-r ${service.color} w-10 h-10 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform`}>
                  <service.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-wider mb-1">{service.name}</p>
                <p className="text-2xl font-black text-gray-800">{service.number}</p>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* Personal Contacts */}
        <div className="bg-white/90 backdrop-blur-sm shadow-xl border border-blue-100 rounded-[2.5rem] p-10 text-left">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-gray-800 tracking-tight">Safe Network</h2>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Authorized Neural Contacts</p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/30"
            >
              <UserPlus className="w-4 h-4" />
              <span>Initialize Addition</span>
            </button>
          </div>

          {/* Add/Edit Form - Integrated native feel */}
          {(isAdding || editingId) && (
            <div className="mb-10 p-8 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-[2.5rem] animate-fade-in relative shadow-lg">
              <button
                onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="absolute top-6 right-6 text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
              <h3 className="text-sm font-black text-gray-800 mb-6 uppercase tracking-tighter italic">
                {isAdding ? 'Configure New Signal' : 'Update Transmission Path'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Identity</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Subject Name"
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Comms Link</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+ PHONE"
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Nexus Role</label>
                  <select
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                    className="input-field appearance-none cursor-pointer"
                  >
                    <option value="">Link Status...</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend</option>
                    <option value="Doctor">Clinical Professional</option>
                  </select>
                </div>
              </div>
              <button
                onClick={isAdding ? handleAdd : handleUpdate}
                className="btn-primary w-full shadow-emerald-500/10"
              >
                <Save className="w-5 h-5 mr-3" />
                Commit Protocol to Memory
              </button>
            </div>
          )}

          {/* Contacts List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader className="w-8 h-8 text-rose-500 animate-spin mb-4" />
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Vault...</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-16 bg-gray-100 rounded-[2.5rem] border border-dashed border-gray-300">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-bold">No active safety bridges detected</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-slate-100 border border-slate-200 rounded-[2.5rem] p-8 hover:bg-blue-50 transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 flex-1">
                      <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-16 h-16 rounded-[2rem] flex items-center justify-center text-blue-700 font-black text-2xl border border-blue-200 shadow-lg group-hover:scale-105 transition-transform">
                        {contact.name.charAt(0)}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-black text-gray-800 tracking-tight">{contact.name}</h3>
                        <p className="text-gray-600 font-bold mb-2">{contact.phone}</p>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-200">{contact.relation}</span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleCall(contact.phone)}
                        className="bg-emerald-500 text-slate-950 p-4 rounded-2xl hover:scale-110 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                      >
                        <Phone className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(contact)}
                        className="bg-white text-blue-600 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="bg-white text-rose-500 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Neural Safety Tips */}
        <div className="mt-12 p-10 bg-white/90 backdrop-blur-sm rounded-[3rem] border border-blue-100 text-left shadow-xl">
          <div className="flex items-center space-x-4 mb-8">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-black text-gray-800 tracking-tight italic uppercase">Safety Persistence</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'Monitor bridge integrity (Update monthly)',
              'Share clinical telemetry with nexus core',
              'Archive local emergency bypass codes',
              'Activate priority voice links in high-stress zones'
            ].map((tip, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-700 font-bold">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;
