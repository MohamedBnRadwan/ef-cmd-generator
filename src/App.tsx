import React, { useState, useEffect, useRef } from 'react';
import logo from './assets/logo.svg';
import { type ProjectProfile, defaultProfile } from './types';
import { 
  Database, Play, Plus, Trash2, Copy, Check, Download, Upload, 
  Settings, Folder, Code2, Tag, Command, Box
} from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  const [profiles, setProfiles] = useState<ProjectProfile[]>(() => {
    const saved = localStorage.getItem('ef-profiles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [defaultProfile];
      }
    }
    return [defaultProfile];
  });
  
  const [activeProfileId, setActiveProfileId] = useState<string>(profiles[0]?.id || 'default');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('ef-profiles', JSON.stringify(profiles));
  }, [profiles]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  const updateProfile = (updates: Partial<ProjectProfile>) => {
    setProfiles(profiles.map(p => p.id === activeProfileId ? { ...p, ...updates } : p));
  };

  const createProfile = () => {
    const newProfile = { ...defaultProfile, id: generateId(), name: `New Profile ${profiles.length + 1}` };
    setProfiles([...profiles, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const deleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    const newProfiles = profiles.filter(p => p.id !== id);
    setProfiles(newProfiles);
    if (activeProfileId === id) {
      setActiveProfileId(newProfiles[0].id);
    }
  };

  const cloneProfile = () => {
    const newProfile = { ...activeProfile, id: generateId(), name: `${activeProfile.name} (Copy)` };
    setProfiles([...profiles, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profiles, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "ef-profiles.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported) && imported.length > 0 && imported[0].id) {
          setProfiles(imported);
          setActiveProfileId(imported[0].id);
        } else {
          alert('Invalid profile format');
        }
      } catch (err) {
        alert('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateCommand = (type: 'add' | 'update' | 'remove' | 'list' | 'script') => {
    const { isEfCore, startupProject, targetProject, dbContext, migrationName, extraFlags } = activeProfile;
    
    let base = '';
    const flags = [];

    if (isEfCore) {
      base = 'dotnet ef';
      
      if (type === 'add') {
        base += ` migrations add "${migrationName || 'InitialCreate'}"`;
      } else if (type === 'update') {
        base += ` database update`;
      } else if (type === 'remove') {
        base += ` migrations remove`;
      } else if (type === 'list') {
        base += ` migrations list`;
      } else if (type === 'script') {
        base += ` migrations script`;
      }

      if (startupProject) flags.push(`--startup-project "${startupProject}"`);
      if (targetProject) flags.push(`--project "${targetProject}"`);
      if (dbContext) flags.push(`--context ${dbContext}`);
      if (extraFlags) flags.push(extraFlags);

      return `${base} ${flags.join(' ')}`.trim();
    } else {
      if (type === 'add') {
        base = `Add-Migration "${migrationName || 'InitialCreate'}"`;
      } else if (type === 'update') {
        base = `Update-Database`;
      } else if (type === 'remove') {
        return "EF6 PMC does not have a native 'Remove-Migration'. Use 'Update-Database -TargetMigration <PrevMigration>' then delete the file.";
      } else if (type === 'list') {
        return "Get-Migrations (Requires EF Power Tools or similar in EF6)";
      } else if (type === 'script') {
        base = `Update-Database -Script -SourceMigration $InitialDatabase`;
      }

      if (targetProject) flags.push(`-ProjectName "${targetProject}"`);
      if (startupProject) flags.push(`-StartupProjectName "${startupProject}"`);
      if (dbContext) flags.push(`-ConfigurationTypeName ${dbContext}`);
      if (extraFlags) flags.push(extraFlags);

      return `${base} ${flags.join(' ')}`.trim();
    }
  };

  return (
    <div className="flex h-screen bg-dark-900 text-slate-200 overflow-hidden relative font-sans">
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Sidebar */}
      <aside className="w-72 glass-panel border-r border-white/5 flex flex-col z-10 shrink-0">
        <div className="p-5 border-b border-white/5 flex items-center gap-3">
          <img src={logo} className="w-10 h-10 rounded-xl shadow-[0_0_12px_rgba(99,102,241,0.35)] border border-white/10" alt="EF Generator Logo" />
          <div>
            <h1 className="font-semibold text-lg text-glow tracking-tight text-white">EF Generator</h1>
            <p className="text-xs text-slate-400 font-medium">Command Toolkit</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Profiles</span>
            <button onClick={createProfile} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white border border-transparent hover:border-white/10" title="New Profile">
              <Plus size={16} />
            </button>
          </div>

          {profiles.map(p => (
            <div 
              key={p.id}
              onClick={() => setActiveProfileId(p.id)}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${activeProfileId === p.id ? 'bg-primary-500/20 border border-primary-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'hover:bg-white/5 border border-transparent text-slate-300'}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Box size={16} className={activeProfileId === p.id ? 'text-primary-400' : 'text-slate-500'} />
                <span className="truncate text-sm font-medium">{p.name}</span>
              </div>
              {profiles.length > 1 && activeProfileId === p.id && (
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteProfile(p.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-all border border-transparent hover:border-red-500/20"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/5 flex gap-3 bg-dark-800/30">
          <button onClick={handleExport} className="flex-1 glass-button text-xs py-2.5 font-medium">
            <Download size={14} className="text-slate-400" /> Export
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 glass-button text-xs py-2.5 font-medium">
            <Upload size={14} className="text-slate-400" /> Import
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden z-10 relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-dark-800/40 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4">
            <input 
              type="text" 
              value={activeProfile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              className="bg-transparent text-2xl font-bold border-none outline-none focus:ring-0 px-0 text-white w-72 placeholder:text-slate-600 transition-colors focus:text-primary-100"
              placeholder="Profile Name"
            />
            <button onClick={cloneProfile} className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-md border border-white/5">
              <Copy size={12} /> Clone Profile
            </button>
          </div>
          
          <div className="flex bg-dark-900/80 p-1.5 rounded-xl border border-white/10 shadow-inner">
            <button 
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeProfile.isEfCore ? 'bg-primary-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              onClick={() => updateProfile({ isEfCore: true })}
            >
              EF Core (CLI)
            </button>
            <button 
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${!activeProfile.isEfCore ? 'bg-accent-500 shadow-[0_0_20px_rgba(139,92,246,0.5)] text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              onClick={() => updateProfile({ isEfCore: false })}
            >
              EF6 (PMC)
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Editor Column */}
            <div className="xl:col-span-4 space-y-6">
              <div className="glass-card p-6 space-y-5 animate-fade-in-up border border-white/10 shadow-2xl bg-dark-800/40">
                <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
                  <Settings size={20} className="text-primary-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                  <h2 className="font-semibold text-white tracking-wide">Configuration Parameters</h2>
                </div>

                <div className="space-y-5">
                  <div className="group">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2 group-focus-within:text-primary-400 transition-colors">
                      <Play size={14} /> Startup Project
                    </label>
                    <input 
                      type="text" 
                      className="glass-input w-full shadow-inner"
                      value={activeProfile.startupProject}
                      onChange={(e) => updateProfile({ startupProject: e.target.value })}
                      placeholder="e.g. MyApi.csproj"
                    />
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2 group-focus-within:text-primary-400 transition-colors">
                      <Folder size={14} /> Target Project
                    </label>
                    <input 
                      type="text" 
                      className="glass-input w-full shadow-inner"
                      value={activeProfile.targetProject}
                      onChange={(e) => updateProfile({ targetProject: e.target.value })}
                      placeholder="e.g. Infrastructure.csproj"
                    />
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2 group-focus-within:text-primary-400 transition-colors">
                      <Database size={14} /> DbContext Name
                    </label>
                    <input 
                      type="text" 
                      className="glass-input w-full shadow-inner"
                      value={activeProfile.dbContext}
                      onChange={(e) => updateProfile({ dbContext: e.target.value })}
                      placeholder="e.g. ApplicationDbContext"
                    />
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2 group-focus-within:text-primary-400 transition-colors">
                      <Tag size={14} /> Migration Name
                    </label>
                    <input 
                      type="text" 
                      className="glass-input w-full shadow-inner"
                      value={activeProfile.migrationName}
                      onChange={(e) => updateProfile({ migrationName: e.target.value })}
                      placeholder="e.g. InitialCreate"
                    />
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2 group-focus-within:text-primary-400 transition-colors">
                      <Command size={14} /> Extra Flags
                    </label>
                    <input 
                      type="text" 
                      className="glass-input w-full shadow-inner"
                      value={activeProfile.extraFlags}
                      onChange={(e) => updateProfile({ extraFlags: e.target.value })}
                      placeholder="e.g. --verbose"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Previews Column */}
            <div className="xl:col-span-8 space-y-5">
              <div className="flex items-center gap-3 mb-6 pl-2">
                <Code2 size={24} className="text-primary-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                <h2 className="text-xl font-semibold text-white tracking-wide">Generated Commands</h2>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'add', title: 'Add Migration', cmd: generateCommand('add') },
                  { id: 'update', title: 'Update Database', cmd: generateCommand('update') },
                  { id: 'remove', title: 'Remove Migration', cmd: generateCommand('remove') },
                  { id: 'list', title: 'List Migrations', cmd: generateCommand('list') },
                  { id: 'script', title: 'Generate SQL Script', cmd: generateCommand('script') },
                ].map((cmdGroup, i) => (
                  <div key={cmdGroup.id} className="glass-card overflow-hidden border border-white/10 hover:border-primary-500/30 transition-all duration-300 shadow-xl group/card" style={{ animation: `fadeInUp 0.5s ease-out forwards ${i * 0.1}s`, opacity: 0 }}>
                    <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-dark-800/50 backdrop-blur-md">
                      <h3 className="font-semibold text-sm text-slate-200 tracking-wide">{cmdGroup.title}</h3>
                      <button 
                        onClick={() => copyToClipboard(cmdGroup.cmd, cmdGroup.id)}
                        className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200 font-medium ${copiedId === cmdGroup.id ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 hover:bg-primary-500 hover:text-white text-slate-300 border border-white/5 hover:border-primary-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]'}`}
                      >
                        {copiedId === cmdGroup.id ? (
                          <><Check size={14} className="text-green-400" /> Copied!</>
                        ) : (
                          <><Copy size={14} /> Copy</>
                        )}
                      </button>
                    </div>
                    <div className="p-5 bg-dark-900/80 overflow-x-auto relative">
                      <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap break-all leading-relaxed group-hover/card:text-primary-100 transition-colors">
                        <span className="text-primary-400 mr-2 select-none">$</span>
                        {cmdGroup.cmd}
                      </pre>
                      {/* Interactive Glow effect on card content */}
                      <div className="absolute inset-0 border border-primary-500/0 group-hover/card:border-primary-500/10 transition-colors pointer-events-none"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
