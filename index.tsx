import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, 
  Server, 
  Wallet, 
  Gift, 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  Edit2, 
  Eye, 
  EyeOff,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Copy,
  ExternalLink,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Settings,
  Terminal,
  Power,
  Activity,
  Globe,
  Moon,
  Sun,
  Database,
  Save,
  Lock,
  KeyRound,
  ShieldCheck,
  AppWindow
} from 'lucide-react';

// --- Types ---

type NodeStatus = 'Active' | 'Inactive' | 'Syncing';
type WalletType = 'Hot' | 'Cold' | 'Hardware';
type AirdropStatus = 'Active' | 'Pending' | 'Claimed' | 'Missed';
type Language = 'en' | 'fr' | 'de' | 'ar';
type Theme = 'dark' | 'light';

interface Preferences {
  language: Language;
  theme: Theme;
  currency: string;
  password?: string;
}

interface NodeItem {
  id: string;
  name: string;
  address: string;
  network: string;
  port: string;
  vpsUser: string;
  sshPort: string;
  status: NodeStatus;
  lastSync: string;
  uptime: string;
  notes: string;
}

interface WalletItem {
  id: string;
  label: string;
  address: string;
  network: string;
  type: WalletType;
  balance: string;
  privateKey: string; // In a real app, never store this in plaintext/localstorage
  createdAt: string;
  notes: string;
}

interface AirdropItem {
  id: string;
  project: string;
  network: string;
  type: string;
  status: AirdropStatus;
  value: string;
  walletUsed: string;
  tasks: string;
  deadline: string;
  notes: string;
}

// --- Translations ---

const translations = {
  en: {
    dashboard: 'Dashboard',
    nodes: 'Node Manager',
    wallets: 'Wallets',
    airdrops: 'Airdrops',
    settings: 'Settings',
    search: 'Search...',
    addNew: 'Add New',
    export: 'Export',
    syncAll: 'Sync All',
    autoSync: 'Auto-Sync',
    activeNodes: 'Active Nodes',
    totalWallets: 'Total Wallets',
    pendingAirdrops: 'Pending Airdrops',
    recentStatus: 'Recent Node Status',
    upcomingDeadlines: 'Upcoming Airdrop Deadlines',
    connect: 'Connect',
    ping: 'Ping',
    general: 'General',
    appearance: 'Appearance',
    data: 'Data Management',
    language: 'Language',
    theme: 'Theme',
    clearData: 'Clear All Data',
    clearDataConfirm: 'Are you sure? This will delete all your nodes, wallets, and airdrops locally.',
    resetSuccess: 'Data reset successfully.',
    save: 'Save Changes',
    security: 'Security',
    setPass: 'Set Password',
    changePass: 'Change Password',
    passPlaceholder: 'Enter password',
    newPass: 'New Password',
    confirmPass: 'Confirm Password',
    currentPass: 'Current Password',
    passRequirement: 'Minimum 6 characters',
    passMismatch: 'Passwords do not match',
    passIncorrect: 'Incorrect password',
    enterPassToConfirm: 'Enter password to confirm',
    installApp: 'Install App'
  },
  fr: {
    dashboard: 'Tableau de bord',
    nodes: 'Gestion des Nœuds',
    wallets: 'Portefeuilles',
    airdrops: 'Airdrops',
    settings: 'Paramètres',
    search: 'Rechercher...',
    addNew: 'Ajouter',
    export: 'Exporter',
    syncAll: 'Synchro',
    autoSync: 'Auto-Sync',
    activeNodes: 'Nœuds Actifs',
    totalWallets: 'Total Portefeuilles',
    pendingAirdrops: 'Airdrops En Attente',
    recentStatus: 'État Récent des Nœuds',
    upcomingDeadlines: 'Dates Limites Airdrops',
    connect: 'Connecter',
    ping: 'Ping',
    general: 'Général',
    appearance: 'Apparence',
    data: 'Gestion des Données',
    language: 'Langue',
    theme: 'Thème',
    clearData: 'Effacer les Données',
    clearDataConfirm: 'Êtes-vous sûr ? Cela supprimera tous vos nœuds, portefeuilles et airdrops localement.',
    resetSuccess: 'Données réinitialisées avec succès.',
    save: 'Enregistrer',
    security: 'Sécurité',
    setPass: 'Définir le mot de passe',
    changePass: 'Changer le mot de passe',
    passPlaceholder: 'Entrez le mot de passe',
    newPass: 'Nouveau mot de passe',
    confirmPass: 'Confirmer le mot de passe',
    currentPass: 'Mot de passe actuel',
    passRequirement: 'Minimum 6 caractères',
    passMismatch: 'Les mots de passe ne correspondent pas',
    passIncorrect: 'Mot de passe incorrect',
    enterPassToConfirm: 'Entrez le mot de passe pour confirmer',
    installApp: 'Installer l\'App'
  },
  de: {
    dashboard: 'Dashboard',
    nodes: 'Knotenverwaltung',
    wallets: 'Wallets',
    airdrops: 'Airdrops',
    settings: 'Einstellungen',
    search: 'Suchen...',
    addNew: 'Hinzufügen',
    export: 'Exportieren',
    syncAll: 'Alle Sync',
    autoSync: 'Auto-Sync',
    activeNodes: 'Aktive Knoten',
    totalWallets: 'Alle Wallets',
    pendingAirdrops: 'Ausstehende',
    recentStatus: 'Aktueller Status',
    upcomingDeadlines: 'Kommende Fristen',
    connect: 'Verbinden',
    ping: 'Ping',
    general: 'Allgemein',
    appearance: 'Aussehen',
    data: 'Datenverwaltung',
    language: 'Sprache',
    theme: 'Design',
    clearData: 'Daten Löschen',
    clearDataConfirm: 'Sind Sie sicher? Alle lokalen Daten werden gelöscht.',
    resetSuccess: 'Daten erfolgreich zurückgesetzt.',
    save: 'Speichern',
    security: 'Sicherheit',
    setPass: 'Passwort festlegen',
    changePass: 'Passwort ändern',
    passPlaceholder: 'Passwort eingeben',
    newPass: 'Neues Passwort',
    confirmPass: 'Passwort bestätigen',
    currentPass: 'Aktuelles Passwort',
    passRequirement: 'Mindestens 6 Zeichen',
    passMismatch: 'Passwörter stimmen nicht überein',
    passIncorrect: 'Falsches Passwort',
    enterPassToConfirm: 'Passwort eingeben zur Bestätigung',
    installApp: 'App Installieren'
  },
  ar: {
    dashboard: 'لوحة التحكم',
    nodes: 'إدارة العقد',
    wallets: 'المحافظ',
    airdrops: 'الإيردروب',
    settings: 'الإعدادات',
    search: 'بحث...',
    addNew: 'إضافة جديد',
    export: 'تصدير',
    syncAll: 'مزامنة الكل',
    autoSync: 'مزامنة تلقائية',
    activeNodes: 'العقد النشطة',
    totalWallets: 'إجمالي المحافظ',
    pendingAirdrops: 'إيردروب معلقة',
    recentStatus: 'حالة العقد الحديثة',
    upcomingDeadlines: 'المواعيد النهائية القادمة',
    connect: 'اتصال',
    ping: 'بينج',
    general: 'عام',
    appearance: 'المظهر',
    data: 'إدارة البيانات',
    language: 'اللغة',
    theme: 'السمة',
    clearData: 'مسح جميع البيانات',
    clearDataConfirm: 'هل أنت متأكد؟ سيؤدي هذا إلى حذف جميع البيانات محليًا.',
    resetSuccess: 'تم إعادة تعيين البيانات بنجاح.',
    save: 'حفظ التغييرات',
    security: 'الأمان',
    setPass: 'تعيين كلمة المرور',
    changePass: 'تغيير كلمة المرور',
    passPlaceholder: 'أدخل كلمة المرور',
    newPass: 'كلمة المرور الجديدة',
    confirmPass: 'تأكيد كلمة المرور',
    currentPass: 'كلمة المرور الحالية',
    passRequirement: '6 أحرف على الأقل',
    passMismatch: 'كلمات المرور غير متطابقة',
    passIncorrect: 'كلمة المرور غير صحيحة',
    enterPassToConfirm: 'أدخل كلمة المرور للتأكيد',
    installApp: 'تثبيت التطبيق'
  }
};

// --- Mock Data ---

const initialNodes: NodeItem[] = [
  { id: '1', name: 'ETH Validator 01', address: '192.168.1.10', network: 'Ethereum Mainnet', port: '30303', vpsUser: 'root', sshPort: '22', status: 'Active', lastSync: '2023-10-27 10:00', uptime: '99.9%', notes: 'Primary validator' },
  { id: '2', name: 'SOL RPC Node', address: '192.168.1.15', network: 'Solana', port: '8899', vpsUser: 'ubuntu', sshPort: '2222', status: 'Syncing', lastSync: '2023-10-27 09:45', uptime: '95.0%', notes: 'Catching up after restart' },
];

const initialWallets: WalletItem[] = [
  { id: '1', label: 'Main Metamask', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', network: 'Ethereum', type: 'Hot', balance: '4.2 ETH', privateKey: 'encrypted_key_123', createdAt: '2022-01-01', notes: 'DeFi Degen wallet' },
  { id: '2', label: 'Ledger Vault', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', network: 'Bitcoin', type: 'Hardware', balance: '0.5 BTC', privateKey: 'N/A', createdAt: '2021-05-15', notes: 'Long term hold' },
];

const initialAirdrops: AirdropItem[] = [
  { id: '1', project: 'ZkSync Era', network: 'ZkSync', type: 'Retroactive', status: 'Pending', value: 'Unknown', walletUsed: 'Main Metamask', tasks: 'Bridge, Swap, NFT', deadline: '2024-03-01', notes: 'Keep activity weekly' },
  { id: '2', project: 'Celestia', network: 'Cosmos', type: 'Holder', status: 'Claimed', value: '$500', walletUsed: 'Keplr Main', tasks: 'Staking ATOM', deadline: '2023-10-15', notes: 'Sold half' },
];

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled = false }: any) => {
  const baseStyle = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 dark:shadow-blue-900/20",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700",
    danger: "bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 dark:border-red-500/20",
    ghost: "hover:bg-slate-100 text-slate-500 hover:text-slate-700 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-xl ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color }: { children: React.ReactNode, color: 'green' | 'red' | 'yellow' | 'blue' | 'slate' }) => {
  const colors = {
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    red: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    yellow: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    slate: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600'
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
};

const PasswordModal = ({ 
    isOpen, 
    mode, // 'set' | 'change' | 'verify'
    onClose, 
    onSubmit,
    currentPassword,
    t 
}: any) => {
    const [step, setStep] = useState(1);
    const [inputPass, setInputPass] = useState({ current: '', new: '', confirm: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        setInputPass({ current: '', new: '', confirm: '' });
        setError('');
        setStep(1);
    }, [isOpen, mode]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (mode === 'verify') {
            if (inputPass.current !== currentPassword) {
                setError(t('passIncorrect'));
                return;
            }
            onSubmit(inputPass.current);
        } 
        else if (mode === 'set') {
            if (inputPass.new.length < 6) {
                setError(t('passRequirement'));
                return;
            }
            if (inputPass.new !== inputPass.confirm) {
                setError(t('passMismatch'));
                return;
            }
            onSubmit(inputPass.new);
        }
        else if (mode === 'change') {
            if (inputPass.current !== currentPassword) {
                setError(t('passIncorrect'));
                return;
            }
            if (inputPass.new.length < 6) {
                setError(t('passRequirement'));
                return;
            }
            if (inputPass.new !== inputPass.confirm) {
                setError(t('passMismatch'));
                return;
            }
            onSubmit(inputPass.new);
        }
    };

    const title = mode === 'set' ? t('setPass') : mode === 'change' ? t('changePass') : t('security');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck size={20} className="text-blue-500" />
                        {title}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <XCircle size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {(mode === 'verify' || mode === 'change') && (
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                {mode === 'verify' ? t('enterPassToConfirm') : t('currentPass')}
                            </label>
                            <div className="relative">
                                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="password" 
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={inputPass.current}
                                    onChange={e => setInputPass({...inputPass, current: e.target.value})}
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    {(mode === 'set' || mode === 'change') && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{t('newPass')}</label>
                                <input 
                                    type="password" 
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={inputPass.new}
                                    onChange={e => setInputPass({...inputPass, new: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{t('confirmPass')}</label>
                                <input 
                                    type="password" 
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={inputPass.confirm}
                                    onChange={e => setInputPass({...inputPass, confirm: e.target.value})}
                                />
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm rounded-lg flex items-center gap-2">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" type="submit">
                            {mode === 'verify' ? 'Confirm' : 'Save'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TerminalModal = ({ node, onClose }: { node: NodeItem, onClose: () => void }) => {
  // Terminal is always dark theme by design
  const user = node.vpsUser || 'root';
  const host = node.address;
  const [history, setHistory] = useState<string[]>([
    `Initializing secure connection to ${node.name}...`,
  ]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleBodyClick = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    const timers: any[] = [];
    timers.push(setTimeout(() => {
      setHistory(prev => [...prev, `Resolving host ${host}...`]);
    }, 600));
    timers.push(setTimeout(() => {
      setHistory(prev => [...prev, `Connecting to ${host} on port ${node.sshPort || '22'}...`]);
    }, 1200));
    timers.push(setTimeout(() => {
      setHistory(prev => [...prev, `Connection established. Verifying keys...`]);
    }, 2000));
    timers.push(setTimeout(() => {
      setHistory(prev => [...prev, `Access granted.`, `Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)`, ` `, ` System load:   0.02               Processes: 103`, ` Usage of /:    12.4% of 38.58GB   Users logged in: 0`, ` Memory usage:  24%                IPv4 address for eth0: ${host}`, ` `, `Last login: ${new Date().toUTCString()} from 127.0.0.1`]);
      setIsConnected(true);
    }, 2800));

    return () => timers.forEach(clearTimeout);
  }, [host, node.sshPort]);

  const handleCommand = (cmd: string) => {
    if (!cmd.trim()) return;
    
    const args = cmd.trim().split(' ');
    const command = args[0].toLowerCase();
    
    let output: string[] = [];

    switch (command) {
      case 'help':
        output = [
          'Available commands:',
          '  status    Check node status',
          '  start     Start the node service',
          '  stop      Stop the node service',
          '  logs      View recent node logs',
          '  clear     Clear terminal screen',
          '  exit      Close connection',
          '  ls        List files (simulated)',
          '  ping      Ping host'
        ];
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'exit':
        onClose();
        return;
      case 'ls':
        output = ['config.toml  data/  keystore.json  node-service.log  start.sh'];
        break;
      case 'status':
        output = [
          `Node: ${node.name}`,
          `Status: ${node.status === 'Active' ? '\u001b[32mActive\u001b[0m' : 'Inactive'}`,
          `Uptime: ${node.uptime}`,
          `Peers: ${Math.floor(Math.random() * 50) + 10}`
        ];
        break;
      case 'start':
        output = [`Starting node service...`, `Service started successfully (PID: ${Math.floor(Math.random() * 9000) + 1000})`];
        break;
      case 'stop':
        output = [`Stopping node service...`, `Service stopped.`];
        break;
      case 'logs':
        output = [
          `[INFO] ${new Date().toISOString()} Peer connected 192.168.1.45`,
          `[INFO] ${new Date().toISOString()} Imported new block header`,
          `[INFO] ${new Date().toISOString()} Syncing... (99.9%)`
        ];
        break;
      case 'ping':
        output = [
          `PING google.com (142.250.180.206) 56(84) bytes of data.`,
          `64 bytes from 142.250.180.206: icmp_seq=1 ttl=116 time=12.4 ms`,
          `64 bytes from 142.250.180.206: icmp_seq=2 ttl=116 time=13.1 ms`,
          `64 bytes from 142.250.180.206: icmp_seq=3 ttl=116 time=11.9 ms`
        ];
        break;
      default:
        output = [`${command}: command not found. Type 'help' for available commands.`];
    }

    setHistory(prev => [...prev, `${user}@${host}:~# ${cmd}`, ...output]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
    if (e.key === 'Escape') {
        onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ direction: 'ltr' }} 
    >
      <div className="bg-[#1e1e1e] border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl h-[600px] flex flex-col overflow-hidden font-mono text-sm relative">
        
        <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-[#1a1a1a] select-none">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
                <div onClick={onClose} className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 cursor-pointer" title="Close"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="ml-4 text-slate-400 text-xs flex items-center gap-2">
               <Terminal size={12} />
               {user}@{host}
            </div>
          </div>
          <div className="flex items-center gap-4">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider hidden sm:block">
                SSH Session (Simulated)
              </div>
              <button 
                onClick={onClose}
                className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] uppercase tracking-wider font-bold rounded border border-red-500/20 transition-colors"
              >
                <Power size={12} />
                Disconnect
              </button>
          </div>
        </div>

        <div 
          className="flex-1 bg-[#0c0c0c] p-4 overflow-y-auto cursor-text text-[#cccccc]"
          onClick={handleBodyClick}
        >
          {history.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap mb-1 break-words leading-snug">
                {line}
            </div>
          ))}
          
          {isConnected && (
            <div className="flex items-center">
              <span className="text-[#27c93f] mr-2">{user}@{host}:~#</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none text-white flex-1 focus:ring-0 p-0 m-0 h-6 w-full"
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ preferences, onUpdatePreference, onClearData, onPasswordAction, t }: any) => {
  
  const LanguageButton = ({ langCode, label, flag }: any) => (
     <button 
        onClick={() => onUpdatePreference('language', langCode)}
        className={`flex-1 px-4 py-3 rounded-xl border transition-all flex items-center justify-center gap-3 ${
            preferences.language === langCode 
            ? 'bg-blue-50 border-blue-500 text-blue-600 ring-1 ring-blue-500 dark:bg-blue-600/20 dark:text-blue-400' 
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'
        }`}
    >
        <span className="text-2xl">{flag}</span>
        <div className="font-medium">{label}</div>
    </button>
  );

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      
      {/* Language & Region */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
           <Globe size={20} className="text-blue-500 dark:text-blue-400" />
           {t('language')}
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
           <LanguageButton langCode="en" label="English" flag="🇺🇸" />
           <LanguageButton langCode="fr" label="Français" flag="🇫🇷" />
           <LanguageButton langCode="de" label="Deutsch" flag="🇩🇪" />
           <LanguageButton langCode="ar" label="العربية" flag="🇸🇦" />
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
           <Eye size={20} className="text-purple-500 dark:text-purple-400" />
           {t('theme')}
        </h3>
        
        <div className="flex items-center gap-4">
             <button 
                onClick={() => onUpdatePreference('theme', 'dark')}
                className={`flex-1 px-4 py-3 rounded-xl border transition-all flex items-center justify-center gap-3 ${
                    preferences.theme === 'dark' 
                    ? 'bg-slate-800 border-purple-500 text-purple-400 ring-1 ring-purple-500' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
            >
                <Moon size={20} />
                <div className="font-medium">Dark Mode</div>
            </button>
             <button 
                onClick={() => onUpdatePreference('theme', 'light')}
                className={`flex-1 px-4 py-3 rounded-xl border transition-all flex items-center justify-center gap-3 ${
                    preferences.theme === 'light' 
                    ? 'bg-white border-orange-500 text-orange-500 ring-1 ring-orange-500 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
            >
                <Sun size={20} />
                <div className="font-medium">Light Mode</div>
            </button>
        </div>
      </Card>

      {/* Security */}
      <Card className={preferences.password ? "border-l-4 border-l-emerald-500" : ""}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Lock size={20} className="text-emerald-500 dark:text-emerald-400" />
            {t('security')}
        </h3>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800">
            <div>
                <div className="font-medium text-slate-800 dark:text-slate-200">
                    {preferences.password ? t('changePass') : t('setPass')}
                </div>
                <div className="text-xs text-slate-500">
                    {preferences.password ? 'Password protection enabled' : 'Secure your app with a password'}
                </div>
            </div>
            <Button 
                variant="secondary" 
                onClick={() => onPasswordAction(preferences.password ? 'change' : 'set')}
                icon={preferences.password ? KeyRound : Lock}
            >
                {preferences.password ? 'Change' : 'Setup'}
            </Button>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="border-l-4 border-l-rose-500 dark:border-l-rose-500">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
           <Database size={20} className="text-rose-500 dark:text-rose-400" />
           {t('data')}
        </h3>
        
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800">
            <div>
                <div className="font-medium text-slate-800 dark:text-slate-200">{t('export')}</div>
                <div className="text-xs text-slate-500">Download a copy of your data</div>
            </div>
        </div>

        <div className="mt-4 flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-500/5 rounded-lg border border-rose-200 dark:border-rose-500/20">
            <div>
                <div className="font-medium text-rose-700 dark:text-rose-200">{t('clearData')}</div>
                <div className="text-xs text-rose-600/70 dark:text-rose-300/70 mt-1">{t('clearDataConfirm')}</div>
            </div>
            <Button variant="danger" icon={Trash2} onClick={onClearData}>
                Reset
            </Button>
        </div>
      </Card>
    </div>
  );
};


// --- Main Application ---

const App = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'nodes' | 'wallets' | 'airdrops' | 'settings'>('dashboard');
  
  // Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
      if(!installPrompt) return;
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
          if(choiceResult.outcome === 'accepted') {
              setInstallPrompt(null);
          }
      });
  };

  // Preferences State
  const [preferences, setPreferences] = useState<Preferences>(() => {
      const saved = localStorage.getItem('nv_preferences');
      return saved ? JSON.parse(saved) : { language: 'en', theme: 'dark', currency: 'USD' };
  });

  useEffect(() => {
      localStorage.setItem('nv_preferences', JSON.stringify(preferences));
      // Set document direction for RTL languages (Arabic)
      document.documentElement.dir = preferences.language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = preferences.language;
      
      // Handle Theme
      if (preferences.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
  }, [preferences]);

  const t = (key: string) => {
      // @ts-ignore
      return translations[preferences.language][key] || key;
  };

  // State for data
  const [nodes, setNodes] = useState<NodeItem[]>(() => {
    const saved = localStorage.getItem('nv_nodes');
    return saved ? JSON.parse(saved) : initialNodes;
  });
  const [wallets, setWallets] = useState<WalletItem[]>(() => {
    const saved = localStorage.getItem('nv_wallets');
    return saved ? JSON.parse(saved) : initialWallets;
  });
  const [airdrops, setAirdrops] = useState<AirdropItem[]>(() => {
    const saved = localStorage.getItem('nv_airdrops');
    return saved ? JSON.parse(saved) : initialAirdrops;
  });

  // Auto-sync state
  const [isAutoSync, setIsAutoSync] = useState(false);
  const [syncInterval, setSyncInterval] = useState(30000); // Default 30s
  const [isSyncing, setIsSyncing] = useState(false);

  // Persistence
  useEffect(() => localStorage.setItem('nv_nodes', JSON.stringify(nodes)), [nodes]);
  useEffect(() => localStorage.setItem('nv_wallets', JSON.stringify(wallets)), [wallets]);
  useEffect(() => localStorage.setItem('nv_airdrops', JSON.stringify(airdrops)), [airdrops]);

  // Helper to get current formatted time
  const getNow = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16).replace('T', ' ');
  };

  // Handlers
  const handleSyncAll = (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 800);
    }
    setNodes(prevNodes => prevNodes.map(node => ({ ...node, lastSync: getNow() })));
  };

  // Auto-sync Effect
  useEffect(() => {
    let interval: any;
    if (isAutoSync && activeTab === 'nodes') {
      interval = setInterval(() => {
        handleSyncAll(false); // Silent sync
      }, syncInterval);
    }
    return () => clearInterval(interval);
  }, [isAutoSync, activeTab, syncInterval]);

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentItem, setCurrentItem] = useState<any>(null);
  
  // Terminal State
  const [terminalNode, setTerminalNode] = useState<NodeItem | null>(null);

  // Password Modal State
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [passModalMode, setPassModalMode] = useState<'set' | 'change' | 'verify'>('verify');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const handleDelete = (id: string, type: 'node' | 'wallet' | 'airdrop') => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    if (type === 'node') setNodes(nodes.filter(n => n.id !== id));
    if (type === 'wallet') setWallets(wallets.filter(w => w.id !== id));
    if (type === 'airdrop') setAirdrops(airdrops.filter(a => a.id !== id));
  };

  const executeClearAll = () => {
      setNodes(initialNodes);
      setWallets(initialWallets);
      setAirdrops(initialAirdrops);
      localStorage.removeItem('nv_nodes');
      localStorage.removeItem('nv_wallets');
      localStorage.removeItem('nv_airdrops');
      alert(translations[preferences.language].resetSuccess);
  };

  const handleClearAllData = () => {
      if (preferences.password) {
          setPendingAction(() => executeClearAll);
          setPassModalMode('verify');
          setIsPassModalOpen(true);
      } else {
          if (confirm(translations[preferences.language].clearDataConfirm)) {
              executeClearAll();
          }
      }
  };

  const handlePasswordSubmit = (password: string) => {
      if (passModalMode === 'verify') {
          setIsPassModalOpen(false);
          if (pendingAction) {
              pendingAction();
              setPendingAction(null);
          }
      } else {
          // Set or Change
          setPreferences(prev => ({ ...prev, password }));
          setIsPassModalOpen(false);
          alert(passModalMode === 'set' ? 'Password set successfully.' : 'Password updated successfully.');
      }
  };

  const handleSave = (data: any) => {
    const isEdit = modalMode === 'edit';
    const id = isEdit ? currentItem.id : Math.random().toString(36).substr(2, 9);
    // For new nodes, set initial sync time
    const newItem = { 
      ...data, 
      id,
      lastSync: activeTab === 'nodes' && !isEdit ? getNow() : data.lastSync 
    };

    if (activeTab === 'nodes') {
      setNodes(isEdit ? nodes.map(n => n.id === id ? newItem : n) : [...nodes, newItem]);
    } else if (activeTab === 'wallets') {
      setWallets(isEdit ? wallets.map(w => w.id === id ? newItem : w) : [...wallets, newItem]);
    } else if (activeTab === 'airdrops') {
      setAirdrops(isEdit ? airdrops.map(a => a.id === id ? newItem : a) : [...airdrops, newItem]);
    }
    setIsModalOpen(false);
  };

  const handleSyncNode = (id: string) => {
    setNodes(prevNodes => prevNodes.map(node => {
      if (node.id === id) {
        return { ...node, lastSync: getNow() };
      }
      return node;
    }));
  };

  const exportCSV = () => {
    let data: any[] = [];
    let filename = 'data.csv';
    
    if (activeTab === 'nodes') { data = nodes; filename = 'nodes.csv'; }
    else if (activeTab === 'wallets') { data = wallets; filename = 'wallets.csv'; }
    else if (activeTab === 'airdrops') { data = airdrops; filename = 'airdrops.csv'; }
    else return;

    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(',')).join('\n');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Renderers
  const renderDashboard = () => {
    const activeNodes = nodes.filter(n => n.status === 'Active').length;
    const pendingAirdrops = airdrops.filter(a => a.status === 'Pending').length;
    const totalWallets = wallets.length;

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('activeNodes')}</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{activeNodes}/{nodes.length}</h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                <Server size={24} />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">Updated just now</div>
          </Card>
          
          <Card className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('totalWallets')}</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalWallets}</h3>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Wallet size={24} />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">Across all networks</div>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('pendingAirdrops')}</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{pendingAirdrops}</h3>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                <Gift size={24} />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">Check deadlines</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('recentStatus')}</h3>
                <div className="space-y-3">
                    {nodes.slice(0, 5).map(node => (
                        <div key={node.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${node.status === 'Active' ? 'bg-emerald-500' : node.status === 'Syncing' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                                <div>
                                    <div className="font-medium text-slate-800 dark:text-slate-200">{node.name}</div>
                                    <div className="text-xs text-slate-500">{node.network}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs font-mono text-slate-500 dark:text-slate-400">{node.uptime}</span>
                                <span className="block text-[10px] text-slate-500 dark:text-slate-600">Sync: {node.lastSync}</span>
                            </div>
                        </div>
                    ))}
                    {nodes.length === 0 && <div className="text-center text-slate-500 py-4">No nodes tracked</div>}
                </div>
            </Card>
            <Card>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('upcomingDeadlines')}</h3>
                <div className="space-y-3">
                    {airdrops.filter(a => a.status !== 'Claimed').slice(0, 5).map(drop => (
                        <div key={drop.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                            <div>
                                <div className="font-medium text-slate-800 dark:text-slate-200">{drop.project}</div>
                                <div className="text-xs text-slate-500">{drop.tasks}</div>
                            </div>
                            <div className="text-right">
                                <Badge color={drop.status === 'Pending' ? 'yellow' : 'red'}>{drop.status}</Badge>
                                <div className="text-xs text-slate-500 mt-1">{drop.deadline}</div>
                            </div>
                        </div>
                    ))}
                     {airdrops.length === 0 && <div className="text-center text-slate-500 py-4">No airdrops tracked</div>}
                </div>
            </Card>
        </div>
      </div>
    );
  };

  const filteredData = useMemo(() => {
    const lowerTerm = searchTerm.toLowerCase();
    if (activeTab === 'nodes') {
      return nodes.filter(n => n.name.toLowerCase().includes(lowerTerm) || n.network.toLowerCase().includes(lowerTerm));
    }
    if (activeTab === 'wallets') {
      return wallets.filter(w => w.label.toLowerCase().includes(lowerTerm) || w.address.toLowerCase().includes(lowerTerm));
    }
    if (activeTab === 'airdrops') {
      return airdrops.filter(a => a.project.toLowerCase().includes(lowerTerm) || a.network.toLowerCase().includes(lowerTerm));
    }
    return [];
  }, [activeTab, searchTerm, nodes, wallets, airdrops]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 flex flex-col transition-colors duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-500 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center">
              <Server size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">NodePilot</span>
          </div>
          
          <nav className="space-y-1">
            <SidebarItem 
              icon={LayoutDashboard} 
              label={t('dashboard')} 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <SidebarItem 
              icon={Server} 
              label={t('nodes')} 
              active={activeTab === 'nodes'} 
              onClick={() => setActiveTab('nodes')} 
            />
            <SidebarItem 
              icon={Wallet} 
              label={t('wallets')} 
              active={activeTab === 'wallets'} 
              onClick={() => setActiveTab('wallets')} 
            />
            <SidebarItem 
              icon={Gift} 
              label={t('airdrops')} 
              active={activeTab === 'airdrops'} 
              onClick={() => setActiveTab('airdrops')} 
            />
            <SidebarItem 
              icon={Settings} 
              label={t('settings')} 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
            />
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-800">
          {installPrompt && (
            <button 
                onClick={handleInstallClick}
                className="w-full mb-4 flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-500/30 transition-colors"
            >
                <AppWindow size={14} />
                {t('installApp')}
            </button>
          )}
          <div className="text-xs text-slate-500">
            <p>NodePilot Web v1.5.0</p>
            <p className="mt-1">Secure Local Storage</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-8 flex-shrink-0 z-10 transition-colors duration-200">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white capitalize">
            {activeTab === 'nodes' ? t('nodes') : activeTab === 'settings' ? t('settings') : t(activeTab)}
          </h2>
          
          {activeTab !== 'dashboard' && activeTab !== 'settings' && (
            <div className="flex items-center gap-3">
               {activeTab === 'nodes' && (
                 <>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 mr-2">
                        <button 
                            onClick={() => setIsAutoSync(!isAutoSync)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${isAutoSync ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                            title="Toggle Auto-Sync"
                        >
                            {isAutoSync ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            <span>{t('autoSync')}</span>
                        </button>
                        
                        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
                        
                        <select 
                            value={syncInterval}
                            onChange={(e) => setSyncInterval(Number(e.target.value))}
                            className="bg-transparent text-xs font-mono text-slate-500 hover:text-slate-800 dark:text-slate-400 focus:outline-none focus:text-slate-900 dark:focus:text-slate-200 cursor-pointer py-1 pr-2"
                            disabled={!isAutoSync}
                            title="Sync Interval"
                        >
                            <option value={10000}>10s</option>
                            <option value={30000}>30s</option>
                            <option value={60000}>1m</option>
                            <option value={300000}>5m</option>
                        </select>
                    </div>

                   <Button 
                     variant="secondary" 
                     icon={RefreshCw} 
                     onClick={() => handleSyncAll(true)}
                     className={isSyncing ? 'animate-pulse' : ''}
                     disabled={isSyncing}
                   >
                     {isSyncing ? 'Syncing...' : t('syncAll')}
                   </Button>
                   <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>
                 </>
               )}
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder={t('search')} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-64 transition-colors placeholder-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="secondary" icon={Download} onClick={exportCSV}>{t('export')}</Button>
              <Button 
                variant="primary" 
                icon={Plus} 
                onClick={() => {
                  setModalMode('add');
                  setCurrentItem(null);
                  setIsModalOpen(true);
                }}
              >
                {t('addNew')}
              </Button>
            </div>
          )}
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' ? renderDashboard() : activeTab === 'settings' ? (
            <SettingsView 
                preferences={preferences} 
                onUpdatePreference={(key: keyof Preferences, val: any) => setPreferences({...preferences, [key]: val})}
                onClearData={handleClearAllData}
                onPasswordAction={(mode: 'set' | 'change') => {
                    setPassModalMode(mode);
                    setIsPassModalOpen(true);
                }}
                t={t}
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-200">
              {activeTab === 'nodes' && (
                <NodeTable 
                  data={filteredData as NodeItem[]} 
                  onSync={handleSyncNode}
                  onConnect={(node: NodeItem) => setTerminalNode(node)}
                  onEdit={(item: any) => {
                    setCurrentItem(item);
                    setModalMode('edit');
                    setIsModalOpen(true);
                  }} 
                  onDelete={(id: string) => handleDelete(id, 'node')} 
                  t={t}
                />
              )}
              {activeTab === 'wallets' && (
                <WalletTable 
                  data={filteredData as WalletItem[]} 
                  onEdit={(item: any) => {
                    setCurrentItem(item);
                    setModalMode('edit');
                    setIsModalOpen(true);
                  }} 
                  onDelete={(id: string) => handleDelete(id, 'wallet')} 
                />
              )}
              {activeTab === 'airdrops' && (
                <AirdropTable 
                  data={filteredData as AirdropItem[]} 
                  onEdit={(item: any) => {
                    setCurrentItem(item);
                    setModalMode('edit');
                    setIsModalOpen(true);
                  }} 
                  onDelete={(id: string) => handleDelete(id, 'airdrop')} 
                />
              )}
            </div>
          )}
        </div>

        {/* Modal Layer */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {modalMode === 'add' ? t('addNew') : 'Edit'} {activeTab}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6">
                <DataForm 
                  type={activeTab as 'nodes' | 'wallets' | 'airdrops'} 
                  initialData={currentItem} 
                  onSubmit={handleSave} 
                  onCancel={() => setIsModalOpen(false)}
                  t={t}
                />
              </div>
            </div>
          </div>
        )}

        {/* Password Modal */}
        <PasswordModal 
            isOpen={isPassModalOpen}
            mode={passModalMode}
            onClose={() => {
                setIsPassModalOpen(false);
                setPendingAction(null);
            }}
            onSubmit={handlePasswordSubmit}
            currentPassword={preferences.password}
            t={t}
        />

        {/* Terminal Modal */}
        {terminalNode && (
          <TerminalModal node={terminalNode} onClose={() => setTerminalNode(null)} />
        )}

      </main>
    </div>
  );
};

// --- Sub-Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
    {children}
  </th>
);

const NodeTable = ({ data, onSync, onConnect, onEdit, onDelete, t }: any) => {
  if (!data || data.length === 0) {
      return <div className="p-8 text-center text-slate-500 dark:text-slate-400">No nodes found</div>;
  }
  return (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-slate-50 dark:bg-slate-800/50">
        <tr>
          <TableHeader>{t('name') || 'Name'}</TableHeader>
          <TableHeader>{t('network') || 'Network'}</TableHeader>
          <TableHeader>Address</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Uptime</TableHeader>
          <TableHeader>Last Sync</TableHeader>
          <TableHeader>Actions</TableHeader>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
        {data.map((node: NodeItem) => (
          <tr key={node.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{node.name}</td>
            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{node.network}</td>
            <td className="px-6 py-4 font-mono text-xs text-slate-500">{node.address}</td>
            <td className="px-6 py-4">
              <Badge color={node.status === 'Active' ? 'green' : node.status === 'Syncing' ? 'yellow' : 'red'}>
                {node.status}
              </Badge>
            </td>
            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{node.uptime}</td>
            <td className="px-6 py-4 text-slate-500 text-xs">{node.lastSync}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => onConnect(node)} className="!p-2" title="Terminal">
                  <Terminal size={16} />
                </Button>
                <Button variant="ghost" onClick={() => onSync(node.id)} className="!p-2" title="Sync">
                  <RefreshCw size={16} />
                </Button>
                <Button variant="ghost" onClick={() => onEdit(node)} className="!p-2">
                  <Edit2 size={16} />
                </Button>
                <Button variant="ghost" onClick={() => onDelete(node.id)} className="!p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                  <Trash2 size={16} />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)};

const WalletTable = ({ data, onEdit, onDelete }: any) => {
  if (!data || data.length === 0) {
      return <div className="p-8 text-center text-slate-500 dark:text-slate-400">No wallets found</div>;
  }
  return (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-slate-50 dark:bg-slate-800/50">
        <tr>
          <TableHeader>Label</TableHeader>
          <TableHeader>Address</TableHeader>
          <TableHeader>Network</TableHeader>
          <TableHeader>Type</TableHeader>
          <TableHeader>Balance</TableHeader>
          <TableHeader>Actions</TableHeader>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
        {data.map((wallet: WalletItem) => (
          <tr key={wallet.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{wallet.label}</td>
            <td className="px-6 py-4 font-mono text-xs text-slate-500">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigator.clipboard.writeText(wallet.address)}>
                    {wallet.address.substring(0, 6)}...{wallet.address.substring(wallet.address.length - 4)}
                    <Copy size={12} className="opacity-0 group-hover:opacity-100 text-blue-500" />
                </div>
            </td>
            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{wallet.network}</td>
            <td className="px-6 py-4">
                <Badge color="blue">{wallet.type}</Badge>
            </td>
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{wallet.balance}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => onEdit(wallet)} className="!p-2">
                  <Edit2 size={16} />
                </Button>
                <Button variant="ghost" onClick={() => onDelete(wallet.id)} className="!p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                  <Trash2 size={16} />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)};

const AirdropTable = ({ data, onEdit, onDelete }: any) => {
  if (!data || data.length === 0) {
      return <div className="p-8 text-center text-slate-500 dark:text-slate-400">No airdrops found</div>;
  }
  return (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-slate-50 dark:bg-slate-800/50">
        <tr>
          <TableHeader>Project</TableHeader>
          <TableHeader>Network</TableHeader>
          <TableHeader>Type</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Deadline</TableHeader>
          <TableHeader>Actions</TableHeader>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
        {data.map((drop: AirdropItem) => (
          <tr key={drop.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{drop.project}</td>
            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{drop.network}</td>
            <td className="px-6 py-4 text-sm text-slate-500">{drop.type}</td>
            <td className="px-6 py-4">
                <Badge color={drop.status === 'Claimed' ? 'green' : drop.status === 'Pending' ? 'yellow' : drop.status === 'Missed' ? 'red' : 'blue'}>
                    {drop.status}
                </Badge>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{drop.deadline}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => onEdit(drop)} className="!p-2">
                  <Edit2 size={16} />
                </Button>
                <Button variant="ghost" onClick={() => onDelete(drop.id)} className="!p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                  <Trash2 size={16} />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)};

const DataForm = ({ type, initialData, onSubmit, onCancel, t }: any) => {
  const [formData, setFormData] = useState(initialData || {});

  const handleChange = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const InputField = ({ label, field, required = false, placeholder = '', type = 'text' }: any) => (
    <div>
       <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
       <input 
         required={required}
         type={type}
         className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
         value={formData[field] || ''} 
         onChange={e => handleChange(field, e.target.value)} 
         placeholder={placeholder}
       />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === 'nodes' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Name" field="name" required />
            <InputField label="Network" field="network" required />
          </div>
          <InputField label="IP Address" field="address" required />
          <div className="grid grid-cols-3 gap-4">
             <InputField label="Port" field="port" />
             <InputField label="SSH Port" field="sshPort" placeholder="22" />
             <InputField label="VPS User" field="vpsUser" placeholder="root" />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
             <select className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.status || 'Active'} onChange={e => handleChange('status', e.target.value)}>
               <option value="Active">Active</option>
               <option value="Syncing">Syncing</option>
               <option value="Inactive">Inactive</option>
             </select>
          </div>
        </>
      )}

      {type === 'wallets' && (
        <>
          <InputField label="Label" field="label" required />
          <InputField label="Address" field="address" required />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Network" field="network" required />
            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
               <select className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.type || 'Hot'} onChange={e => handleChange('type', e.target.value)}>
                 <option value="Hot">Hot</option>
                 <option value="Cold">Cold</option>
                 <option value="Hardware">Hardware</option>
               </select>
            </div>
          </div>
          <InputField label="Balance" field="balance" />
        </>
      )}

      {type === 'airdrops' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Project" field="project" required />
            <InputField label="Network" field="network" required />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tasks / Notes</label>
             <textarea className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" rows={3} value={formData.tasks || ''} onChange={e => handleChange('tasks', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
               <select className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.status || 'Pending'} onChange={e => handleChange('status', e.target.value)}>
                 <option value="Pending">Pending</option>
                 <option value="Active">Active</option>
                 <option value="Claimed">Claimed</option>
                 <option value="Missed">Missed</option>
               </select>
            </div>
            <InputField label="Deadline" field="deadline" type="date" />
          </div>
        </>
      )}

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit">{t('save') || 'Save'}</Button>
      </div>
    </form>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}