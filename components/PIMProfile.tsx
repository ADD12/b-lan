
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface PIMProfileProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

const PIMProfile: React.FC<PIMProfileProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState(user);
  const [newSkill, setNewSkill] = useState('');

  const handleSave = () => {
    onUpdate(formData);
    alert("PIM Database Updated Locally.");
  };

  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill] });
      setNewSkill('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Personal Information Module (PIM)</h2>
        <p className="text-slate-400">Your identity and skills are stored locally in the B-LAN SQL cluster.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6">
        <div className="flex gap-6 items-center border-b border-slate-800 pb-6 mb-6">
          <div className="relative group">
            <img src={formData.avatar} alt="User" className="w-24 h-24 rounded-full object-cover border-2 border-slate-700" />
            <button className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
              Change Photo
            </button>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{formData.name}</h3>
            <p className="text-indigo-400 text-sm font-mono">{formData.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
            <input 
              type="text" 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Home Unit / Address</label>
            <input 
              type="text" 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Bio / Description</label>
          <textarea 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
          />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-500 uppercase">Skill Inventory (Neighborhood Routing Keys)</label>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, i) => (
              <span key={i} className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-medium">
                {skill}
                <button 
                  onClick={() => setFormData({...formData, skills: formData.skills.filter((_, idx) => idx !== i)})}
                  className="hover:text-red-400"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Add skill (e.g. Baking, Welding...)" 
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-200"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            />
            <button 
              onClick={addSkill}
              className="bg-slate-800 hover:bg-slate-700 px-4 rounded-lg text-white text-sm font-bold"
            >
              Add
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
          <button className="px-6 py-2 rounded-lg text-slate-400 hover:text-white font-medium">Cancel</button>
          <button 
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 px-8 py-2 rounded-lg text-white font-bold"
          >
            Save PIM Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default PIMProfile;
