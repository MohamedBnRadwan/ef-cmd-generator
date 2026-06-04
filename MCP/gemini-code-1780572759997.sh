# @cell: Injecting State Engine Component Core Logic
cat << 'EOF' > src/App.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Layers, Terminal, FileText, ChevronRight, HelpCircle } from 'lucide-react';

const STORAGE_KEY = 'antigravity_ef_mcp_projects';

const DEFAULT_PRESETS = [
  {
    id: 'core-sample',
    name: 'Microservice Orders Context',
    efVersion: 'EF_CORE',
    startupProject: 'Services/Orders/Orders.API',
    migrationProject: 'Services/Orders/Orders.Infrastructure',
    dbContext: 'OrdersDbContext'
  },
  {
    id: 'framework-sample',
    name: 'Enterprise Billing Legacy',
    efVersion: 'EF6_DOTNET_FRAMEWORK',
    startupProject: 'BillingSystem.Web',
    migrationProject: 'BillingSystem.Data',
    dbContext: 'BillingMigrationConfiguration'
  }
];

export default function App() {
  const [projects, setProjects] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [migrationName, setMigrationName] = useState('AddAuditLogs');
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      setProjects(parsed);
      if (parsed.length > 0) setActiveId(parsed[0].id);
    } else {
      setProjects(DEFAULT_PRESETS);
      setActiveId(DEFAULT_PRESETS[0].id);
    }
  }, []);

  const syncState = (updatedList) => {
    setProjects(updatedList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  };

  const currentProject = projects.find(p => p.id === activeId) || projects[0];

  const handleUpdate = (field, value) => {
    const updated = projects.map(p => p.id === activeId ? { ...p, [field]: value } : p);
    syncState(updated);
  };

  const handleAddNew = () => {
    const nextItem = {
      id: crypto.randomUUID(),
      name: 'New Application Space',
      efVersion: 'EF_CORE',
      startupProject: 'App.Host',
      migrationProject: 'App.DataLayer',
      dbContext: 'ApplicationDbContext'
    };
    syncState([...projects, nextItem]);
    setActiveId(nextItem.id);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (projects.length <= 1) {
      alert("Antigravity Framework Workspace requires at least 1 context profile config.");
      return;
    }
    const filtered = projects.filter(p => p.id !== id);
    syncState(filtered);
    if (activeId === id) setActiveId(filtered[0].id);
  };

  const copyToClipboard = (txt) => {
    navigator.clipboard.writeText(txt);
    setStatusText(txt);
    setTimeout(() => setStatusText(''), 2500);
  };

  const computeCommands = () => {
    if (!currentProject) return [];
    const { efVersion, startupProject, migrationProject, dbContext } = currentProject;
    
    if (efVersion === 'EF_CORE') {
      return [
        { label: 'Add Migration', desc: 'Prepares a code snapshot detailing structure alterations.', cmd: `dotnet ef migrations add ${migrationName} --project ${migrationProject} --startup-project ${startupProject} --context ${dbContext}` },
        { label: 'Apply DB Changes', desc: 'Executes pending execution blocks downstream immediately.', cmd: `dotnet ef database update --project ${migrationProject} --startup-project ${startupProject} --context ${dbContext}` },
        { label: 'Drop Last Migration', desc: 'Safely removes non-applied snapshot files locally.', cmd: `dotnet ef migrations remove --project ${migrationProject} --startup-project ${startupProject} --context ${dbContext}` },
        { label: 'Inspect List Logs', desc: 'Lists historical data migration metadata sequence snapshots.', cmd: `dotnet ef migrations list --project ${migrationProject} --startup-project ${startupProject} --context ${dbContext}` }
      ];
    } else {
      return [
        { label: 'Add PMC Migration', desc: 'Generates snapshot file inside Visual Studio Package Manager.', cmd: `Add-Migration ${migrationName} -ConfigurationTypeName ${dbContext} -StartUpProjectName ${startupProject} -ProjectName ${migrationProject}` },
        { label: 'Update Database Target', desc: 'Applies structural changes downstream over Package Manager Console.', cmd: `Update-Database -ConfigurationTypeName ${dbContext} -StartUpProjectName ${startupProject} -ProjectName ${migrationProject} -Verbose` },
        { label: 'Revert Migration State', desc: 'Rolls your active tracking snapshot back to target point.', cmd: `Update-Database -TargetMigration "${migrationName || '0'}" -ConfigurationTypeName ${dbContext} -StartUpProjectName ${startupProject} -ProjectName ${migrationProject}` }
      ];
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between bg-slate-800/40 p-4 border border-slate-700/60 rounded-xl">
        <div className="flex items-center gap-3">
          <Terminal className="text-cyan-400 w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">EF Context Workspace CLI Automation</h1>
            <p className="text-xs text-slate-400">Integrated Antigravity IDE Workbench Profile Manager</p>
          </div>
        </div>
        <div className="text-[10px] uppercase font-mono tracking-widest bg-cyan-950 px-3 py-1 rounded text-cyan-400 border border-cyan-800/40">
          MCP Engine Mode Connected
        </div>
      </div>

      {currentProject ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* PROFILE CONTROL LIST */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5"/> Projects</span>
              <button onClick={handleAddNew} className="text-xs bg-cyan-600 hover:bg-cyan-500 px-2 py-1 rounded text-white font-medium transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3"/> New
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {projects.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => setActiveId(p.id)}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex justify-between items-center group relative ${
                    activeId === p.id ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="text-sm font-semibold truncate text-slate-200">{p.name}</p>
                    <span className="text-[9px] font-mono tracking-tight text-slate-500 uppercase">{p.efVersion.replace('_', ' ')}</span>
                  </div>
                  <button onClick={(e) => handleDelete(p.id, e)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ATTRIBUTE BINDING PANEL */}
          <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5"/> Variables Config
            </h2>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Target Module Identifier</label>
              <input type="text" value={currentProject.name} onChange={e => handleUpdate('name', e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 rounded p-2 text-xs focus:border-cyan-500 outline-none text-slate-100" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Framework Pipeline</label>
              <select value={currentProject.efVersion} onChange={e => handleUpdate('efVersion', e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 rounded p-2 text-xs focus:border-cyan-500 outline-none text-slate-100">
                <option value="EF_CORE">EF Core (dotnet ef CLI)</option>
                <option value="EF6_DOTNET_FRAMEWORK">EF6 (.NET Framework PMC)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Startup Module Project Directory</label>
              <input type="text" value={currentProject.startupProject} onChange={e => handleUpdate('startupProject', e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 rounded p-2 text-xs font-mono focus:border-cyan-500 outline-none text-slate-300" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Assembly Infrastructure Migration Directory</label>
              <input type="text" value={currentProject.migrationProject} onChange={e => handleUpdate('migrationProject', e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 rounded p-2 text-xs font-mono focus:border-cyan-500 outline-none text-slate-300" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">DbContext Context Type Identifier</label>
              <input type="text" value={currentProject.dbContext} onChange={e => handleUpdate('dbContext', e.target.value)} className="w-full bg-slate-950 border border-slate-700/80 rounded p-2 text-xs font-mono focus:border-cyan-500 outline-none text-slate-300" />
            </div>
            <div className="pt-2 border-t border-slate-800">
              <label className="text-[11px] font-medium text-amber-400 block mb-1 flex items-center gap-1">Live Arg: Migration Target Name</label>
              <input type="text" value={migrationName} onChange={e => setMigrationName(e.target.value)} className="w-full bg-slate-950 border border-amber-500/30 rounded p-2 text-xs font-mono focus:border-amber-400 outline-none text-amber-200" />
            </div>
          </div>

          {/* GENERATED EXECUTION SHELL LAYER */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {computeCommands().map((item, index) => (
              <div key={index} className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex flex-col gap-2 hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">{item.label}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(item.cmd)}
                    className={`text-[10px] font-mono tracking-tight px-2.5 py-1 rounded border transition-all ${
                      statusText === item.cmd 
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-600' 
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {statusText === item.cmd ? 'Copied to Sandbox!' : 'Copy Code'}
                  </button>
                </div>
                <div className="bg-black/40 border border-slate-900 font-mono text-[11px] p-2.5 rounded text-cyan-400 break-all select-all leading-relaxed">
                  {item.cmd}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
EOF