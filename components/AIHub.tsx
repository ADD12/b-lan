
import React, { useState, useRef } from 'react';
import { generateImage, editImage, generateVideo, analyzeMedia, analyzeMediaStream } from '../services/geminiService';

const AIHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'IMAGE' | 'VIDEO' | 'VISION'>('IMAGE');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  
  // Image State
  const [imagePrompt, setImagePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Video State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoRatio, setVideoRatio] = useState<'16:9' | '9:16'>('16:9');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [startFrame, setStartFrame] = useState<string | null>(null);

  // Vision State
  const [analysisResult, setAnalysisResult] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    setLoading(true);
    setStatusMsg('Nano Banana Pro is synthesizing your request...');
    try {
      const url = await generateImage(imagePrompt, aspectRatio, imageSize);
      setGeneratedImage(url);
    } catch (e) {
      console.error(e);
      setStatusMsg('Synthesis failed. Check connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditImage = async () => {
    if (!generatedImage || !imagePrompt) return;
    setLoading(true);
    setStatusMsg('Gemini 2.5 Flash is applying edits...');
    try {
      const url = await editImage(generatedImage, imagePrompt);
      if (url) setGeneratedImage(url);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt && !startFrame) return;
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
      // Proceed after triggering key selection (race condition mitigation)
    }

    setLoading(true);
    setStatusMsg('Veo 3.1 is weaving your temporal shards... this may take 2-3 minutes.');
    try {
      const url = await generateVideo(videoPrompt, videoRatio, startFrame || undefined);
      setGeneratedVideo(url);
    } catch (e) {
      console.error(e);
      setStatusMsg('Video generation failed. Ensure your selected API key has Veo access.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadFile) return;
    setLoading(true);
    setStatusMsg('Gemini Pro is decoding multi-modal patterns...');
    setAnalysisResult(''); // Clear previous result
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const stream = await analyzeMediaStream(base64, uploadFile.type, "Analyze this media in the context of B-LAN community security and logistics.");
        
        setLoading(false); // Stop main loading once stream starts
        let fullText = '';
        for await (const chunk of stream) {
          if (chunk.text) {
            fullText += chunk.text;
            setAnalysisResult(fullText);
          }
        }
      };
      reader.readAsDataURL(uploadFile);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-20">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <i className="fa-solid fa-flask-vial text-9xl"></i>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-center">
           <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl shadow-xl shadow-indigo-600/20 shrink-0">
              <i className="fa-solid fa-microchip"></i>
           </div>
           <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Neural Hub Laboratory</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                Advanced B-LAN interface for generation, analysis, and temporal synthesis. 
                Utilizing Gemini 3 Pro and Veo architectures.
              </p>
           </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-[2rem] shadow-xl">
        {[
          { id: 'IMAGE', icon: 'fa-image', label: 'Image Lab' },
          { id: 'VIDEO', icon: 'fa-film', label: 'Video Lab' },
          { id: 'VISION', icon: 'fa-eye', label: 'Vision Lab' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-indigo-400 font-black text-sm uppercase tracking-widest animate-pulse">{statusMsg}</p>
          </div>
        )}

        {!loading && activeTab === 'IMAGE' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Synthesis Configuration</h3>
              
              <div className="space-y-4">
                <textarea 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 text-sm h-32 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Describe your visual concept (e.g., 'Retro-futuristic B-LAN solar panels in a forest')..."
                  value={imagePrompt}
                  onChange={e => setImagePrompt(e.target.value)}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Aspect Ratio</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs"
                      value={aspectRatio}
                      onChange={e => setAspectRatio(e.target.value)}
                    >
                      {['1:1', '3:4', '4:3', '9:16', '16:9', '21:9'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Image Size</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs"
                      value={imageSize}
                      onChange={e => setImageSize(e.target.value)}
                    >
                      {['1K', '2K', '4K'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={handleGenerateImage}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95"
                  >
                    Generate Shard
                  </button>
                  {generatedImage && (
                    <button 
                      onClick={handleEditImage}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest border border-white/5 transition-all"
                    >
                      Apply Prompt Edit
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] flex items-center justify-center p-4 min-h-[400px] overflow-hidden shadow-xl">
              {generatedImage ? (
                <img src={generatedImage} alt="Generated" className="max-w-full max-h-full rounded-2xl shadow-2xl" />
              ) : (
                <div className="text-center opacity-20">
                  <i className="fa-solid fa-image text-6xl mb-4"></i>
                  <p className="text-sm italic">Image output buffer empty...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && activeTab === 'VIDEO' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Veo Temporal Synthesis</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Start Frame (Optional)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors overflow-hidden"
                  >
                    {startFrame ? (
                      <img src={startFrame} alt="Frame" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <i className="fa-solid fa-cloud-arrow-up text-2xl text-slate-700 mb-2"></i>
                        <span className="text-[10px] text-slate-600 uppercase font-black">Drop Reference Image</span>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        const reader = new FileReader();
                        reader.onload = () => setStartFrame(reader.result as string);
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                  />
                </div>

                <textarea 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 text-sm h-32 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Describe the animation sequence..."
                  value={videoPrompt}
                  onChange={e => setVideoPrompt(e.target.value)}
                />

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Temporal Aspect</label>
                  <div className="flex gap-2">
                    {['16:9', '9:16'].map(r => (
                      <button 
                        key={r}
                        onClick={() => setVideoRatio(r as any)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${videoRatio === r ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                      >
                        {r === '16:9' ? 'LANDSCAPE' : 'PORTRAIT'}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleGenerateVideo}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95"
                >
                  Generate Video Stream
                </button>
                <p className="text-[9px] text-slate-500 text-center italic">Requires paid API key billing association.</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] flex items-center justify-center p-4 min-h-[400px] overflow-hidden shadow-xl">
              {generatedVideo ? (
                <video src={generatedVideo} controls className="max-w-full max-h-full rounded-2xl shadow-2xl" />
              ) : (
                <div className="text-center opacity-20">
                  <i className="fa-solid fa-clapperboard text-6xl mb-4"></i>
                  <p className="text-sm italic">Video buffer offline...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && activeTab === 'VISION' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Media Logic Analysis</h3>
              
              <div className="space-y-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-64 bg-slate-950 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"
                >
                  {uploadFile ? (
                    <div className="text-center p-4">
                      <i className="fa-solid fa-file-circle-check text-4xl text-indigo-500 mb-2"></i>
                      <p className="text-white font-bold text-sm">{uploadFile.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase mt-1">Ready for decoding</p>
                    </div>
                  ) : (
                    <>
                      <i className="fa-solid fa-file-import text-4xl text-slate-700 mb-4"></i>
                      <p className="text-white font-bold text-sm">Upload Evidence</p>
                      <p className="text-[10px] text-slate-500 uppercase mt-2">Images or Videos Supported</p>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

                <button 
                  onClick={handleAnalyze}
                  disabled={!uploadFile}
                  className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl ${
                    uploadFile ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  Analyze Pattern
                </button>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl min-h-[400px]">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Inference Result</h4>
              {analysisResult ? (
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {analysisResult}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-20 text-center px-12">
                   <i className="fa-solid fa-brain text-5xl mb-4"></i>
                   <p className="text-xs italic">Awaiting multi-modal input for pattern recognition...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIHub;
