
import React, { useState, useEffect } from 'react';
import { UserProfile, HoneyDoJob } from '../types';
import { getLocalData, setLocalData } from '../services/dbService';
import { getSkillMatches } from '../services/geminiService';

const INITIAL_JOBS: HoneyDoJob[] = [
  { id: 'job-1', title: 'Leaking Sink Repair', description: 'Kitchen sink in Unit 14 has a slow leak. Need help with plumbing.', posterName: 'Mrs. Gable', postedBy: 'u-elderly-1', reward: 50, requiredSkills: ['Plumbing'], status: 'OPEN', location: 'Section A-3' },
  { id: 'job-2', title: 'Garden Fence Fix', description: 'Small section of the perimeter garden fence needs re-boarding.', posterName: 'Community Garden', postedBy: 'u-gov-1', reward: 120, requiredSkills: ['Carpentry'], status: 'OPEN', location: 'Garden Quad' },
  { id: 'job-3', title: 'Tech Setup for Tablet', description: 'Help setting up a new communication tablet for an elderly neighbor.', posterName: 'Mr. Henderson', postedBy: 'u-elderly-2', reward: 30, requiredSkills: ['Electrical', 'Software'], status: 'OPEN', location: 'Section B-1' },
];

const JobBoard: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [jobs, setJobs] = useState<HoneyDoJob[]>(getLocalData('jobs', INITIAL_JOBS));
  const [recommendedJobIds, setRecommendedJobIds] = useState<string[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      setIsMatching(true);
      const matches = await getSkillMatches(user, jobs);
      setRecommendedJobIds(matches);
      setIsMatching(false);
    };
    fetchMatches();
  }, [user, jobs]);

  const claimJob = (jobId: string) => {
    const updated = jobs.map(j => j.id === jobId ? { ...j, status: 'IN_PROGRESS' as const, assignedTo: user.id } : j);
    setJobs(updated);
    setLocalData('jobs', updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Honey Do List</h2>
          <p className="text-slate-400">Neighborhood tasks matching your PIM skills.</p>
        </div>
        <div className="bg-indigo-600/10 border border-indigo-500/20 px-4 py-2 rounded-lg text-sm text-indigo-400 flex items-center gap-2">
          <i className={`fa-solid fa-wand-magic-sparkles ${isMatching ? 'animate-spin' : ''}`}></i>
          {isMatching ? 'Analyzing matches...' : `${recommendedJobIds.length} Smart Recommendations`}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map(job => {
          const isRecommended = recommendedJobIds.includes(job.id);
          const isClaimed = job.assignedTo === user.id;

          return (
            <div key={job.id} className={`bg-slate-900 border ${isRecommended ? 'border-indigo-500' : 'border-slate-800'} p-6 rounded-2xl relative overflow-hidden group hover:bg-slate-800/80 transition-all`}>
              {isRecommended && !isClaimed && (
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] px-3 py-1 font-bold uppercase rounded-bl-lg">
                  Skill Match
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{job.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-indigo-400 font-mono">{job.posterName}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-500">{job.location}</span>
                  </div>
                </div>
                <div className="text-xl font-bold text-amber-500 flex items-center gap-1">
                  {job.reward} <span className="text-xs font-normal">Karma</span>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-6 line-clamp-2">{job.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {job.requiredSkills.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] font-bold rounded border border-slate-700 uppercase">
                    {skill}
                  </span>
                ))}
              </div>

              {job.status === 'OPEN' ? (
                <button 
                  onClick={() => claimJob(job.id)}
                  className="w-full bg-slate-800 border border-slate-700 text-white font-bold py-2 rounded-lg hover:bg-indigo-600 hover:border-indigo-500 transition-all"
                >
                  Claim Job
                </button>
              ) : job.assignedTo === user.id ? (
                <div className="w-full bg-green-500/10 border border-green-500/30 text-green-400 font-bold py-2 rounded-lg text-center flex items-center justify-center gap-2">
                  <i className="fa-solid fa-check"></i> Assigned to You
                </div>
              ) : (
                <div className="w-full bg-slate-800 text-slate-500 font-bold py-2 rounded-lg text-center opacity-50 cursor-not-allowed">
                  Already Claimed
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobBoard;
