
import React, { useState, useEffect } from 'react';
import { UserProfile, HoneyDoJob } from '../types';
import { getLocalData, setLocalData, processJobPayment } from '../services/dbService';
import { getSkillMatches } from '../services/geminiService';

const INITIAL_JOBS: HoneyDoJob[] = [
  { id: 'job-1', title: 'Leaking Sink Repair', description: 'Kitchen sink in Unit 14 has a slow leak. Need help with plumbing.', posterName: 'Mrs. Gable', postedBy: 'u-elderly-1', reward: 50, requiredSkills: ['Plumbing'], status: 'OPEN', location: 'Section A-3' },
  { id: 'job-2', title: 'Garden Fence Fix', description: 'Small section of the perimeter garden fence needs re-boarding.', posterName: 'Community Garden', postedBy: 'u-gov-1', reward: 120, requiredSkills: ['Carpentry'], status: 'OPEN', location: 'Garden Quad' },
  { id: 'job-3', title: 'Tech Setup for Tablet', description: 'Help setting up a new communication tablet for an elderly neighbor.', posterName: 'Mr. Henderson', postedBy: 'u-elderly-2', reward: 30, requiredSkills: ['Electrical', 'Software'], status: 'OPEN', location: 'Section B-1' },
];

const JobBoard: React.FC<{ user: UserProfile; onUserUpdate: (user: UserProfile) => void }> = ({ user, onUserUpdate }) => {
  const [jobs, setJobs] = useState<HoneyDoJob[]>(getLocalData('jobs', INITIAL_JOBS));
  const [recommendedJobIds, setRecommendedJobIds] = useState<string[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [viewTab, setViewTab] = useState<'FIND' | 'POSTED'>('FIND');
  
  const [newJob, setNewJob] = useState<Partial<HoneyDoJob>>({
    title: '',
    description: '',
    reward: 50,
    requiredSkills: [],
    location: ''
  });

  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      setIsMatching(true);
      const matches = await getSkillMatches(user, jobs);
      setRecommendedJobIds(matches);
      setIsMatching(false);
    };
    fetchMatches();
  }, [user.skills, jobs.length]);

  const claimJob = (jobId: string) => {
    const updated = jobs.map(j => j.id === jobId ? { ...j, status: 'IN_PROGRESS' as const, assignedTo: user.id } : j);
    setJobs(updated);
    setLocalData('jobs', updated);
  };

  const submitForApproval = (jobId: string) => {
    const updated = jobs.map(j => j.id === jobId ? { ...j, status: 'PENDING_APPROVAL' as const } : j);
    setJobs(updated);
    setLocalData('jobs', updated);
    alert("Task Shard Submitted to Creator for Verification.");
  };

  const approveAndPay = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job || !job.assignedTo) return;

    if (user.karmaBalance < job.reward) {
      alert("Insufficient Karma to release payment. Please top up your ledger.");
      return;
    }

    // Process the payment in the DB and update current user if necessary
    const updatedSelf = processJobPayment(user.id, job.assignedTo, job.reward, `Completion of: ${job.title}`);
    
    const updatedJobs = jobs.map(j => j.id === jobId ? { ...j, status: 'COMPLETED' as const } : j);
    setJobs(updatedJobs);
    setLocalData('jobs', updatedJobs);

    if (updatedSelf) {
      onUserUpdate(updatedSelf);
    }
    
    alert(`Success: ${job.reward} Karma sharded to worker.`);
  };

  const addSkill = () => {
    if (skillInput && !newJob.requiredSkills?.includes(skillInput)) {
      setNewJob({ ...newJob, requiredSkills: [...(newJob.requiredSkills || []), skillInput] });
      setSkillInput('');
    }
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.description) return;

    const job: HoneyDoJob = {
      id: `job-${Date.now()}`,
      title: newJob.title || '',
      description: newJob.description || '',
      postedBy: user.id,
      posterName: user.name,
      reward: newJob.reward || 50,
      requiredSkills: newJob.requiredSkills || [],
      status: 'OPEN',
      location: newJob.location || user.address
    };

    const updated = [job, ...jobs];
    setJobs(updated);
    setLocalData('jobs', updated);
    setShowPostModal(false);
    setNewJob({ title: '', description: '', reward: 50, requiredSkills: [], location: '' });
  };

  const myActiveTasks = jobs.filter(j => j.assignedTo === user.id && j.status !== 'COMPLETED');
  const myPostedTasks = jobs.filter(j => j.postedBy === user.id);
  const availableJobs = jobs.filter(j => 
    j.status === 'OPEN' || 
    (j.status === 'IN_PROGRESS' && j.assignedTo !== user.id) ||
    (j.status === 'PENDING_APPROVAL' && j.assignedTo !== user.id)
  );

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Tab Switcher */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl w-fit">
        <button 
          onClick={() => setViewTab('FIND')}
          className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
            viewTab === 'FIND' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
          }`}
        >
          Find Work
        </button>
        <button 
          onClick={() => setViewTab('POSTED')}
          className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
            viewTab === 'POSTED' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
          }`}
        >
          My Posted Tasks
        </button>
      </div>

      {viewTab === 'FIND' ? (
        <>
          {/* My Active Tasks Section */}
          {myActiveTasks.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
                  <i className="fa-solid fa-list-check"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight uppercase">My Active Shards</h2>
                  <p className="text-slate-500 text-[10px] font-mono uppercase">Tasks currently assigned to your PIM</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myActiveTasks.map(job => (
                  <div key={job.id} className={`bg-slate-900 border-2 p-6 rounded-[2rem] relative overflow-hidden group shadow-xl flex flex-col transition-all ${
                    job.status === 'PENDING_APPROVAL' ? 'border-amber-500/40 opacity-80' : 'border-emerald-500/30'
                  }`}>
                    <div className={`absolute top-0 right-0 text-white text-[8px] px-3 py-1 font-black uppercase tracking-widest rounded-bl-xl shadow-lg ${
                      job.status === 'PENDING_APPROVAL' ? 'bg-amber-600' : 'bg-emerald-500'
                    }`}>
                      {job.status.replace('_', ' ')}
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-lg font-black text-white leading-tight">{job.title}</h3>
                        <div className="text-xl font-black text-emerald-500 flex flex-col items-end">
                          <span>{job.reward}</span>
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest -mt-1">Karma</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] text-indigo-400 font-mono font-bold uppercase">{job.posterName}</span>
                        <span className="text-[9px] text-slate-700">•</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{job.location}</span>
                      </div>
                    </div>

                    <p className="text-slate-400 text-xs mb-6 italic flex-1">{job.description}</p>

                    {job.status === 'PENDING_APPROVAL' ? (
                      <div className="w-full bg-slate-950 border border-amber-500/20 text-amber-500 py-3 rounded-xl text-[10px] font-black uppercase text-center flex items-center justify-center gap-2">
                        <i className="fa-solid fa-clock-rotate-left"></i>
                        Awaiting Verification
                      </div>
                    ) : (
                      <button 
                        onClick={() => submitForApproval(job.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-paper-plane"></i>
                        Submit for Review
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Board Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
                  <i className="fa-solid fa-clipboard-list"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 tracking-tight uppercase">Honey Do Board</h2>
                  <p className="text-slate-400 text-sm">Neighborhood task mesh matching your PIM skills.</p>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setShowPostModal(true)}
                  className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i>
                  Post New Task
                </button>
                <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-[10px] font-bold text-indigo-400 flex items-center gap-2 uppercase tracking-widest">
                  <i className={`fa-solid fa-wand-magic-sparkles ${isMatching ? 'animate-spin' : ''}`}></i>
                  {isMatching ? 'Analyzing...' : `${recommendedJobIds.length} Recs`}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableJobs.length === 0 ? (
                <div className="col-span-full py-12 bg-slate-900/50 border border-slate-800 rounded-[2rem] text-center italic text-slate-500">
                  No new tasks in this shard. Post one to begin!
                </div>
              ) : (
                availableJobs.map(job => {
                  const isRecommended = recommendedJobIds.includes(job.id);
                  const isClaimed = job.assignedTo && job.assignedTo !== user.id;

                  return (
                    <div key={job.id} className={`bg-slate-900 border ${isRecommended ? 'border-indigo-500 ring-1 ring-indigo-500/20' : 'border-slate-800'} p-6 rounded-[2rem] relative overflow-hidden group hover:bg-slate-800/80 transition-all shadow-xl h-full flex flex-col`}>
                      {isRecommended && job.status === 'OPEN' && (
                        <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[8px] px-3 py-1 font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
                          Skill Match
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-lg font-black text-white leading-tight">{job.title}</h3>
                          <div className="text-xl font-black text-amber-500 flex flex-col items-end">
                            <span>{job.reward}</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest -mt-1">Karma</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] text-indigo-400 font-mono font-bold uppercase">{job.posterName}</span>
                          <span className="text-[9px] text-slate-700">•</span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{job.location}</span>
                        </div>
                      </div>

                      <p className="text-slate-400 text-xs mb-6 line-clamp-3 italic flex-1">{job.description}</p>

                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {job.requiredSkills.map(skill => (
                          <span key={skill} className="px-2 py-0.5 bg-slate-950 text-slate-500 text-[8px] font-black rounded border border-white/5 uppercase tracking-widest">
                            {skill}
                          </span>
                        ))}
                      </div>

                      {job.status === 'OPEN' ? (
                        <button 
                          onClick={() => claimJob(job.id)}
                          className="w-full bg-slate-800 border border-white/5 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-indigo-600 hover:border-indigo-500 transition-all shadow-lg active:scale-95"
                        >
                          Claim This Task
                        </button>
                      ) : (
                        <div className="w-full bg-slate-950 text-slate-700 font-black text-[10px] uppercase tracking-widest py-3 rounded-xl text-center border border-white/5 opacity-50">
                          {job.status === 'PENDING_APPROVAL' ? 'In Review' : 'Claimed'}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      ) : (
        /* Posted Tasks Section */
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600/20 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-500">
              <i className="fa-solid fa-signs-post"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight uppercase">My Postings</h2>
              <p className="text-slate-500 text-[10px] font-mono uppercase">Tasks you sharded to the local mesh</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPostedTasks.length === 0 ? (
              <div className="col-span-full py-12 bg-slate-900/50 border border-slate-800 rounded-[2rem] text-center italic text-slate-500">
                You haven't posted any tasks to this shard yet.
              </div>
            ) : (
              myPostedTasks.map(job => (
                <div key={job.id} className={`bg-slate-900 border p-6 rounded-[2rem] relative overflow-hidden group shadow-xl flex flex-col transition-all ${
                  job.status === 'PENDING_APPROVAL' ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-800'
                }`}>
                  <div className={`absolute top-0 right-0 text-white text-[8px] px-3 py-1 font-black uppercase tracking-widest rounded-bl-xl shadow-lg ${
                    job.status === 'PENDING_APPROVAL' ? 'bg-amber-600' : 
                    job.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-slate-700'
                  }`}>
                    {job.status.replace('_', ' ')}
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-black text-white leading-tight">{job.title}</h3>
                    <div className="text-sm font-bold text-amber-500 mt-1">{job.reward} Karma</div>
                  </div>

                  <p className="text-slate-400 text-xs mb-6 italic flex-1">{job.description}</p>

                  {job.status === 'PENDING_APPROVAL' && (
                    <button 
                      onClick={() => approveAndPay(job.id)}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all shadow-xl shadow-amber-600/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-stamp"></i>
                      Verify & Release Karma
                    </button>
                  )}

                  {job.status === 'OPEN' && (
                    <div className="w-full bg-slate-950 border border-white/5 py-3 rounded-xl text-[10px] font-black text-slate-500 uppercase text-center">
                      Waiting for Worker
                    </div>
                  )}

                  {job.status === 'COMPLETED' && (
                    <div className="w-full bg-emerald-600/10 border border-emerald-500/20 py-3 rounded-xl text-[10px] font-black text-emerald-500 uppercase text-center flex items-center justify-center gap-2">
                       <i className="fa-solid fa-circle-check"></i>
                       Paid & Settled
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Post Local Shard Task</h3>
              <button onClick={() => setShowPostModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <i className="fa-solid fa-xmark text-2xl"></i>
              </button>
            </div>
            
            <form onSubmit={handlePostJob} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Task Headline</label>
                <input 
                  type="text" 
                  placeholder="e.g. Broken Fence Repair"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
                  value={newJob.title}
                  onChange={e => setNewJob({...newJob, title: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Task Description</label>
                <textarea 
                  placeholder="Describe what needs to be done..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 h-24 focus:ring-1 focus:ring-indigo-500 outline-none text-xs"
                  value={newJob.description}
                  onChange={e => setNewJob({...newJob, description: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Karma Reward</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none font-bold"
                    value={newJob.reward}
                    onChange={e => setNewJob({...newJob, reward: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
                    value={newJob.location}
                    onChange={e => setNewJob({...newJob, location: e.target.value})}
                    placeholder={user.address}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Required Skills</label>
                <div className="flex flex-wrap gap-2">
                  {newJob.requiredSkills?.map((skill, i) => (
                    <span key={i} className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      {skill}
                      <button type="button" onClick={() => setNewJob({...newJob, requiredSkills: newJob.requiredSkills?.filter((_, idx) => idx !== i)})} className="hover:text-red-400">
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Add skill..." 
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  />
                  <button type="button" onClick={addSkill} className="bg-slate-800 hover:bg-slate-700 px-4 rounded-xl text-white text-[10px] font-black uppercase border border-white/5">
                    Add
                  </button>
                </div>
              </div>
            </form>

            <div className="p-8 bg-slate-950/40 border-t border-slate-800 flex gap-4">
              <button 
                type="button"
                onClick={() => setShowPostModal(false)}
                className="flex-1 px-4 py-4 rounded-2xl border border-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePostJob}
                className="flex-1 px-4 py-4 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-colors"
              >
                Post To Mesh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBoard;
