import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Terminal, Search, TrendingUp, TrendingDown, Activity, 
  Globe, DollarSign, BarChart3, PieChart, Newspaper, 
  Cpu, Layers, Zap, ArrowRight, Command, Clock, 
  Briefcase, Hash, Percent, ChevronRight, X, Wind,
  Home, Shield, Zap as ZapIcon, Truck, Heart, ShoppingCart,
  Radio, Factory, BookOpen, Landmark, Smartphone
} from 'lucide-react';

// --- Types ---

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: string;
  avgVolume?: string;
  marketCap?: string;
  pe?: number;
  forwardPE?: number;
  ps?: number;
  pb?: number;
  pegRatio?: number;
  targetHigh?: number;
  targetLow?: number;
  recommendation?: string;
  // For FA
  revenue?: string;
  netIncome?: string;
  grossMargin?: number;
  operatingMargin?: number;
  netMargin?: number;
  ebitda?: string;
  eps?: string;
  bookValue?: string;
  debtToEquity?: string;
  roe?: number;
  // Generic
  name?: string;
  sector?: string;
  industry?: string;
  description?: string;
  website?: string;
  employees?: number;
  // For yields
  yield?: number;
  maturityDate?: string;
}

interface NewsItem {
  title: string;
  publisher: string;
  link: string;
  published: string;
}

interface ApiResponse {
  data?: StockData[];
  news?: NewsItem[];
  error?: string;
}

// --- Constants & Config ---

const API_BASE = 'https://mini-finapi.vercel.app/api/ticker';

const INDICES = [
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^NDX', name: 'NASDAQ 100' },
  { symbol: '^DJI', name: 'DOW JONES' },
  { symbol: '^VIX', name: 'VIX' },
  { symbol: '^FTSE', name: 'FTSE 100' },
  { symbol: '^N225', name: 'NIKKEI 225' },
  { symbol: '^GDAXI', name: 'DAX' },
  { symbol: '^HSI', name: 'HANG SENG' },
  { symbol: '^AXJO', name: 'ASX 200' },
  { symbol: 'EURUSD=X', name: 'EUR/USD' },
  { symbol: 'GC=F', name: 'GOLD' },
  { symbol: 'CL=F', name: 'CRUDE OIL' },
  { symbol: 'BTC-USD', name: 'BITCOIN' },
  { symbol: 'ETH-USD', name: 'ETHEREUM' },
];

const COMMANDS = [
  { cmd: 'WEI', desc: 'World Equity Indices' },
  { cmd: 'GP', desc: 'Global Performance Heatmap' },
  { cmd: 'NEWS', desc: 'Top Market News' },
  { cmd: 'ECO', desc: 'Economic Calendar & Yields' },
  { cmd: 'SECF', desc: 'Sector Performance' },
  { cmd: 'INDU', desc: 'Industry View' },
  { cmd: 'RV', desc: 'Relative Valuation' },
  { cmd: 'DES', desc: 'Company Description (e.g., DES AAPL)' },
  { cmd: 'FA', desc: 'Financial Analysis (e.g., FA PLTR)' },
  { cmd: 'STX', desc: 'Stock Screener (Top 20)' },
  { cmd: 'CRYP', desc: 'Crypto Market Overview' },
  { cmd: 'ETF', desc: 'ETF Trends & Themes' },
  { cmd: 'HELP', desc: 'Show Commands' },
  { cmd: 'CLEAR', desc: 'Clear Screen' },
];

const STX_LIST = "AAPL,GOOGL,NVDA,AMD,IBM,CRWD,NOW,AMZN,CART,WMT,RKLB,LUNR,ONDS,ASTS,NBIS,IREN,SOFI,COIN,HOOD,NEE,OKLO,VRT,RIVN,RGTI,IONQ,EXAS,BEAM";

const SECTOR_ETFS = [
  { symbol: 'XLK', name: 'Technology', icon: Cpu },
  { symbol: 'XLF', name: 'Financials', icon: Landmark },
  { symbol: 'XLV', name: 'Health Care', icon: Heart },
  { symbol: 'XLE', name: 'Energy', icon: ZapIcon },
  { symbol: 'XLI', name: 'Industrials', icon: Factory },
  { symbol: 'XLP', name: 'Consumer Staples', icon: ShoppingCart },
  { symbol: 'XLY', name: 'Consumer Disc.', icon: Truck },
  { symbol: 'XLB', name: 'Materials', icon: Factory },
  { symbol: 'XLU', name: 'Utilities', icon: Zap },
  { symbol: 'XLRE', name: 'Real Estate', icon: Home },
  { symbol: 'XLC', name: 'Communication', icon: Radio },
];

const ETF_THEMES = [
  { symbol: 'ARKK', theme: 'Innovation', desc: 'Disruptive Innovation' },
  { symbol: 'ARKG', theme: 'Genomics', desc: 'Genomic Revolution' },
  { symbol: 'SPACE', theme: 'Space', desc: 'Space Exploration' },
  { symbol: 'QTUM', theme: 'Quantum', desc: 'Quantum Computing' },
  { symbol: 'CYBER', theme: 'Cybersecurity', desc: 'Cyber Security' },
  { symbol: 'MEME', theme: 'Meme', desc: 'Meme Stocks' },
  { symbol: 'SMH', theme: 'Semiconductors', desc: 'Semiconductor Index' },
  { symbol: 'ICLN', theme: 'Clean Energy', desc: 'Global Clean Energy' },
  { symbol: 'CLOU', theme: 'Cloud', desc: 'Cloud Computing' },
  { symbol: 'AIQ', theme: 'AI', desc: 'Artificial Intelligence' },
  { symbol: 'BOTZ', theme: 'Robotics', desc: 'Robotics & AI' },
  { symbol: 'ESPO', theme: 'Gaming', desc: 'Video Gaming & Esports' },
  { symbol: 'LIT', theme: 'Lithium', desc: 'Lithium & Battery Tech' },
  { symbol: 'URA', theme: 'Uranium', desc: 'Global Uranium' },
  { symbol: 'BLOK', theme: 'Blockchain', desc: 'Blockchain Tech' },
  { symbol: 'MJ', theme: 'Cannabis', desc: 'Cannabis Index' },
  { symbol: 'IDRV', theme: 'Autonomous', desc: 'Self-Driving EV' },
  { symbol: 'SNSR', theme: 'IoT', desc: 'Internet of Things' },
  { symbol: 'PHO', theme: 'Water', desc: 'Water Resources' },
  { symbol: 'WOOD', theme: 'Timber', desc: 'Timber & Forestry' },
];

// --- Components ---

const TickerTape = () => {
  const [data, setData] = useState<StockData[]>([]);

  useEffect(() => {
    const fetchTape = async () => {
      const symbols = INDICES.map(i => i.symbol).join(',');
      try {
        const res = await fetch(`${API_BASE}?ticker=${symbols}`);
        const json = await res.json();
        if (json.data) setData(json.data);
      } catch (e) { console.error("Tape error", e); }
    };
    fetchTape();
    const interval = setInterval(fetchTape, 60000);
    return () => clearInterval(interval);
  }, []);

  const renderItem = (item: StockData, idx: number) => {
    const isUp = item.change >= 0;
    const color = isUp ? 'text-bloomberg-green' : 'text-bloomberg-red';
    const Icon = isUp ? TrendingUp : TrendingDown;
    const label = INDICES.find(i => i.symbol === item.symbol)?.name || item.symbol;

    return (
      <div key={`${item.symbol}-${idx}`} className="flex items-center space-x-2 px-4 whitespace-nowrap">
        <span className="font-bold text-gray-300">{label}</span>
        <span className={color}>{item.price?.toFixed(2)}</span>
        <span className={`flex items-center text-xs ${color}`}>
          <Icon size={12} className="mr-1" />
          {Math.abs(item.changePercent).toFixed(2)}%
        </span>
      </div>
    );
  };

  return (
    <div className="h-10 bg-bloomberg-black border-b border-bloomberg-gray flex items-center overflow-hidden relative z-20">
      <div className="bg-bloomberg-orange text-black font-bold px-4 h-full flex items-center z-10 shadow-lg shrink-0">
        MARKETS
      </div>
      <div className="flex animate-ticker">
        {[...data, ...data].map((item, idx) => renderItem(item, idx))}
      </div>
    </div>
  );
};

const ProgressBar = ({ value, color = "bg-bloomberg-orange" }: { value: number, color?: string }) => (
  <div className="w-full bg-bloomberg-gray h-2 rounded-full overflow-hidden">
    <div 
      className={`h-full ${color} transition-all duration-500`} 
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
);

const MetricCard = ({ label, value, sub, trend }: any) => (
  <div className="bg-bloomberg-dark border border-bloomberg-gray p-4 rounded-sm hover:border-bloomberg-orange transition-colors">
    <div className="text-bloomberg-light-gray text-xs uppercase tracking-wider mb-1">{label}</div>
    <div className="text-2xl font-terminal font-bold text-white mb-1">{value}</div>
    {sub && <div className={`text-xs font-mono ${trend === 'up' ? 'text-bloomberg-green' : trend === 'down' ? 'text-bloomberg-red' : 'text-gray-400'}`}>{sub}</div>}
  </div>
);

const HeatmapBox = ({ item, size = 'normal' }: { item: StockData, size?: 'small' | 'normal' | 'large' }) => {
  const isUp = item.change >= 0;
  const intensity = Math.min(Math.abs(item.changePercent) * 8, 100);
  const bg = isUp 
    ? `rgba(0, 204, 0, ${0.2 + (intensity / 100) * 0.8})` 
    : `rgba(255, 51, 51, ${0.2 + (intensity / 100) * 0.8})`;
  
  const heightClass = size === 'small' ? 'h-20' : size === 'large' ? 'h-40' : 'h-28';

  return (
    <div className={`${heightClass} relative bg-bloomberg-dark border border-bloomberg-gray flex flex-col justify-between p-3 overflow-hidden group hover:border-white transition-colors cursor-pointer`} onClick={() => window.dispatchEvent(new CustomEvent('terminal:command', { detail: `DES ${item.symbol}` }))}>
      <div className="absolute inset-0 pointer-events-none transition-colors duration-300" style={{ backgroundColor: bg }}></div>
      <div className="relative z-10">
        <div className="font-bold text-white text-sm">{item.symbol}</div>
        <div className="text-xs text-gray-300">${item.price?.toFixed(2)}</div>
      </div>
      <div className={`relative z-10 text-right font-terminal font-bold ${isUp ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
        {isUp ? '+' : ''}{item.changePercent?.toFixed(2)}%
      </div>
    </div>
  );
};

// --- Main Application ---

export default function MiniBloomberg() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<typeof COMMANDS>([]);
  const [view, setView] = useState<'welcome' | 'data'>('welcome');
  const [loading, setLoading] = useState(false);
  const [activeData, setActiveData] = useState<any>(null);
  const [activeCommand, setActiveCommand] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Listen for custom command events from heatmap clicks
  useEffect(() => {
    const handler = (e: CustomEvent) => handleCommand(e.detail);
    window.addEventListener('terminal:command', handler as EventListener);
    return () => window.removeEventListener('terminal:command', handler as EventListener);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeData, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCommand = useCallback(async (rawCmd: string) => {
    const cmd = rawCmd.trim().toUpperCase();
    if (!cmd) return;

    setHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    setInput('');
    setSuggestions([]);
    setLoading(true);
    setActiveCommand(cmd);

    try {
      if (cmd === 'CLEAR') {
        setActiveData(null);
        setView('welcome');
        setLoading(false);
        return;
      }

      if (cmd === 'HELP') {
        setActiveData({ type: 'HELP', list: COMMANDS });
        setView('data');
        setLoading(false);
        return;
      }

      if (cmd === 'WEI') {
        const res = await fetch(`${API_BASE}?ticker=^GSPC,^NDX,^DJI,^FTSE,^N225,^GDAXI,^HSI,^AXJO,^GSPTSE,^FCHI`);
        const json = await res.json();
        setActiveData({ type: 'WEI', data: json.data });
      } 
      else if (cmd === 'GP') {
        const etfs = "SPY,QQQ,IWM,TLT,GLD,USO,EEM,FXI,UUP,SLV,SOXX,XLF,XLE,VNQ,EMB,HYG,LQD";
        const res = await fetch(`${API_BASE}?ticker=${etfs}`);
        const json = await res.json();
        setActiveData({ type: 'GP', data: json.data });
      }
      else if (cmd === 'STX') {
        const res = await fetch(`${API_BASE}?ticker=${STX_LIST}`);
        const json = await res.json();
        setActiveData({ type: 'STX', data: json.data });
      }
      else if (cmd === 'CRYP') {
        const res = await fetch(`${API_BASE}?ticker=BTC-USD,ETH-USD,SOL-USD,XRP-USD,ADA-USD,DOGE-USD,DOT-USD,LINK-USD,AVAX-USD,MATIC-USD,MSTR,COIN,HOOD,RIOT,MARA`);
        const json = await res.json();
        setActiveData({ type: 'CRYP', data: json.data });
      }
      else if (cmd === 'ETF') {
        const symbols = ETF_THEMES.map(e => e.symbol).join(',');
        const res = await fetch(`${API_BASE}?ticker=${symbols}`);
        const json = await res.json();
        setActiveData({ type: 'ETF', data: json.data, themes: ETF_THEMES });
      }
      else if (cmd === 'NEWS') {
        const res = await fetch(`${API_BASE}?ticker=SPY,QQQ,IWM,DIA`);
        const json = await res.json();
        setActiveData({ type: 'NEWS', data: json.data, news: json.news || [] });
      }
      else if (cmd === 'ECO') {
        // Economic data - yields and VIX
        const res = await fetch(`${API_BASE}?ticker=^VIX,TNX,^FVX,^TYX,DGS10,DGS2,DGS30,BZ=F,GC=F,CL=F,NG=F`);
        const json = await res.json();
        setActiveData({ type: 'ECO', data: json.data });
      }
      else if (cmd === 'SECF') {
        const symbols = SECTOR_ETFS.map(s => s.symbol).join(',');
        const res = await fetch(`${API_BASE}?ticker=${symbols}`);
        const json = await res.json();
        setActiveData({ type: 'SECF', data: json.data, sectors: SECTOR_ETFS });
      }
      else if (cmd === 'INDU') {
        // Industry view - fetch major industry ETFs
        const res = await fetch(`${API_BASE}?ticker=KIE,IAI,XHE,XBI,XRT,XHB,XSW,XTN,XME,XES`);
        const json = await res.json();
        setActiveData({ type: 'INDU', data: json.data });
      }
      else if (cmd === 'RV') {
        // Relative valuation comparison
        const res = await fetch(`${API_BASE}?ticker=AAPL,MSFT,GOOGL,AMZN,META,NFLX,NVDA,TSLA,CRM,ADBE`);
        const json = await res.json();
        setActiveData({ type: 'RV', data: json.data });
      }
      else if (cmd.startsWith('DES ')) {
        const ticker = cmd.split(' ')[1];
        const res = await fetch(`${API_BASE}?ticker=${ticker}`);
        const json = await res.json();
        setActiveData({ type: 'DES', data: json.data?.[0], news: json.news || [] });
      }
      else if (cmd.startsWith('FA ')) {
        const ticker = cmd.split(' ')[1];
        const res = await fetch(`${API_BASE}?ticker=${ticker}`);
        const json = await res.json();
        setActiveData({ type: 'FA', data: json.data?.[0] });
      }
      else {
        setActiveData({ type: 'ERROR', msg: `Unknown command: ${cmd}. Type HELP for available commands.` });
      }
      setView('data');

    } catch (error) {
      setActiveData({ type: 'ERROR', msg: 'Failed to fetch data. Check connection or try again.' });
      setView('data');
    } finally {
      setLoading(false);
    }
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        const cmd = suggestions[0].cmd;
        setInput(cmd + (cmd.includes(' ') ? '' : ' '));
        setSuggestions([]);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setInput(val);
    if (val.length > 0) {
      const filtered = COMMANDS.filter(c => c.cmd.startsWith(val) || c.desc.toUpperCase().includes(val));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const renderContent = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-64 text-bloomberg-orange animate-pulse">
        <Activity className="mr-2 animate-spin" /> FETCHING DATA...
      </div>
    );

    if (!activeData) return null;

    switch (activeData.type) {
      case 'ERROR':
        return <div className="p-4 text-bloomberg-red font-terminal bg-red-900/20 border border-red-800 m-4 rounded">{activeData.msg}</div>;

      case 'HELP':
        return (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeData.list.map((c: any) => (
              <div key={c.cmd} className="flex items-center p-3 bg-bloomberg-dark border border-bloomberg-gray rounded hover:bg-bloomberg-light-gray transition-colors cursor-pointer group" onClick={() => handleCommand(c.cmd)}>
                <div className="bg-bloomberg-orange text-black font-bold px-2 py-1 rounded text-xs mr-3 group-hover:scale-110 transition-transform">{c.cmd}</div>
                <div className="text-gray-300 text-sm">{c.desc}</div>
              </div>
            ))}
          </div>
        );

      case 'WEI':
        return (
          <div className="p-6">
            <h2 className="text-bloomberg-orange text-xl font-bold mb-6 flex items-center"><Globe className="mr-2"/> WORLD EQUITY INDICES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {activeData.data?.map((item: StockData) => (
                <div key={item.symbol} className="bg-bloomberg-dark p-4 border-l-4 border-bloomberg-orange hover:bg-bloomberg-gray transition-colors">
                  <div className="text-gray-400 text-xs mb-1">{INDICES.find(i => i.symbol === item.symbol)?.name || item.symbol}</div>
                  <div className="text-2xl font-terminal text-white my-1">{item.price?.toFixed(2)}</div>
                  <div className={`text-sm font-bold flex items-center ${item.change >= 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                    {item.change >= 0 ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
                    {item.change >= 0 ? '+' : ''}{item.change?.toFixed(2)} ({item.changePercent?.toFixed(2)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'GP':
        return (
          <div className="p-6">
            <h2 className="text-bloomberg-orange text-xl font-bold mb-6 flex items-center"><BarChart3 className="mr-2"/> GLOBAL PERFORMANCE HEATMAP</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {activeData.data?.map((item: StockData) => (
                <HeatmapBox key={item.symbol} item={item} />
              ))}
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
              <div className="bg-bloomberg-dark p-3 border border-bloomberg-gray">
                <strong className="text-white">EQUITIES:</strong> SPY, QQQ, IWM
              </div>
              <div className="bg-bloomberg-dark p-3 border border-bloomberg-gray">
                <strong className="text-white">FIXED INCOME:</strong> TLT, HYG, LQD, EMB
              </div>
              <div className="bg-bloomberg-dark p-3 border border-bloomberg-gray">
                <strong className="text-white">COMMODITIES:</strong> GLD, USO, SLV, UUP
              </div>
            </div>
          </div>
        );

      case 'STX':
        return (
          <div className="p-4 overflow-x-auto">
            <h2 className="text-bloomberg-orange text-xl font-bold mb-4 flex items-center"><Layers className="mr-2"/> EQUITY SCREENER</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-bloomberg-light-gray text-xs border-b border-bloomberg-gray bg-bloomberg-dark">
                  <th className="p-3 font-bold">TICKER</th>
                  <th className="p-3">PRICE</th>
                  <th className="p-3">CHANGE %</th>
                  <th className="p-3">MKT CAP</th>
                  <th className="p-3">VOLUME</th>
                  <th className="p-3">P/E</th>
                  <th className="p-3">FWD P/E</th>
                  <th className="p-3">REC</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                {activeData.data?.map((item: StockData) => (
                  <tr key={item.symbol} className="border-b border-bloomberg-gray hover:bg-bloomberg-gray/50 cursor-pointer transition-colors" onClick={() => handleCommand(`DES ${item.symbol}`)}>
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      {item.symbol}
                      {item.change >= 0 ? <TrendingUp size={14} className="text-bloomberg-green"/> : <TrendingDown size={14} className="text-bloomberg-red"/>}
                    </td>
                    <td className="p-3 text-white">${item.price?.toFixed(2)}</td>
                    <td className={`p-3 font-bold ${item.change >= 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                      {item.changePercent > 0 ? '+' : ''}{item.changePercent?.toFixed(2)}%
                    </td>
                    <td className="p-3 text-gray-400">{item.marketCap}</td>
                    <td className="p-3 text-gray-400">{item.volume}</td>
                    <td className="p-3 text-gray-400">{item.pe?.toFixed(1) || '-'}</td>
                    <td className="p-3 text-gray-400">{item.forwardPE?.toFixed(1) || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold text-black ${item.recommendation === 'BUY' ? 'bg-bloomberg-green' : item.recommendation === 'SELL' ? 'bg-bloomberg-red' : 'bg-bloomberg-yellow'}`}>
                        {item.recommendation || 'HOLD'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'DES':
        const d = activeData.data;
        if (!d) return <div className="p-4 text-red-500">Ticker not found.</div>;
        return (
          <div className="p-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-bloomberg-gray pb-4 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  {d.symbol} 
                  <span className="text-lg text-bloomberg-orange font-normal">{d.name}</span>
                </h1>
                <div className="text-sm text-gray-400 mt-1 flex flex-wrap gap-4">
                  <span className="bg-bloomberg-gray px-2 py-0.5 rounded text-xs">{d.sector}</span>
                  <span className="bg-bloomberg-gray px-2 py-0.5 rounded text-xs">{d.industry}</span>
                  <a href={d.website} target="_blank" rel="noreferrer" className="text-bloomberg-blue hover:underline">{d.website}</a>
                </div>
              </div>
              <div className="text-right bg-bloomberg-dark p-4 rounded border border-bloomberg-gray">
                <div className="text-4xl font-terminal text-white">${d.price?.toFixed(2)}</div>
                <div className={`text-lg font-bold flex items-center justify-end ${d.change >= 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                  {d.change >= 0 ? <TrendingUp size={18} className="mr-1"/> : <TrendingDown size={18} className="mr-1"/>}
                  {d.change >= 0 ? '+' : ''}{d.change?.toFixed(2)} ({d.changePercent?.toFixed(2)}%)
                </div>
                <div className="text-xs text-gray-500 mt-1">Vol: {d.volume}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              <MetricCard label="Market Cap" value={d.marketCap} />
              <MetricCard label="Enterprise Value" value={d.enterpriseValue} />
              <MetricCard label="P/E Ratio (TTM)" value={d.pe?.toFixed(2)} sub="vs Sector: 22.4" />
              <MetricCard label="Forward P/E" value={d.forwardPE?.toFixed(2)} trend="up" />
              <MetricCard label="PEG Ratio" value={d.pegRatio?.toFixed(2)} />
              <MetricCard label="Price Target" value={`$${d.targetLow?.toFixed(0)} - $${d.targetHigh?.toFixed(0)}`} sub={`Consensus: ${d.recommendation}`} />
              <MetricCard label="Employees" value={d.employees?.toLocaleString()} />
              <MetricCard label="Revenue (TTM)" value={d.revenue} />
              <MetricCard label="Profit Margin" value={`${d.netMargin}%`} />
              <MetricCard label="Operating Margin" value={`${d.operatingMargin}%`} />
              <MetricCard label="ROE" value={`${d.roe}%`} />
              <MetricCard label="Debt/Equity" value={d.debtToEquity} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-bloomberg-dark p-5 rounded border border-bloomberg-gray">
                <h3 className="text-bloomberg-orange font-bold mb-3 flex items-center text-sm uppercase tracking-wider"><Briefcase size={16} className="mr-2"/> Business Summary</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{d.description || "No description available."}</p>
              </div>
              <div className="bg-bloomberg-dark p-5 rounded border border-bloomberg-gray">
                <h3 className="text-bloomberg-orange font-bold mb-3 flex items-center text-sm uppercase tracking-wider"><Newspaper size={16} className="mr-2"/> Latest News</h3>
                <ul className="space-y-3">
                  {activeData.news?.slice(0, 5).map((n: NewsItem, i: number) => (
                    <li key={i} className="text-sm text-gray-300 hover:text-white cursor-pointer border-b border-gray-800 pb-2 last:border-0 last:pb-0 transition-colors">
                      <a href={n.link} target="_blank" rel="noreferrer" className="block">
                        <span className="text-bloomberg-blue block text-xs mb-0.5 font-mono">{n.publisher} • {n.published}</span>
                        <span className="line-clamp-2">{n.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case 'FA':
        const f = activeData.data;
        if (!f) return <div className="p-4 text-red-500">Financial data unavailable.</div>;
        return (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6 text-bloomberg-orange border-b border-bloomberg-gray pb-2">
              <DollarSign size={20} />
              <span className="text-xl font-bold">FINANCIAL ANALYSIS</span>
              <span className="text-white ml-2 font-mono">{f.symbol}</span>
              <span className="text-gray-500 text-sm ml-auto">{f.name}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <MetricCard label="Revenue (TTM)" value={f.revenue} sub="+12.4% YoY" trend="up" />
              <MetricCard label="Revenue Per Share" value={f.revenuePerShare} />
              <MetricCard label="Net Income" value={f.netIncome} sub="+5.2% YoY" trend="up" />
              <MetricCard label="EBITDA" value={f.ebitda} />
              <MetricCard label="Gross Margin" value={`${f.grossMargin}%`} sub="Industry Avg: 42%" />
              <MetricCard label="Operating Margin" value={`${f.operatingMargin}%`} />
              <MetricCard label="Profit Margin" value={`${f.netMargin}%`} sub="Industry Avg: 15%" />
              <MetricCard label="Free Cash Flow" value={f.freeCashFlow} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-bloomberg-dark p-5 border border-bloomberg-gray rounded">
                <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase">Margin Analysis</h4>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-300">Gross Margin</span>
                      <span className="text-bloomberg-orange font-bold">{f.grossMargin}%</span>
                    </div>
                    <ProgressBar value={f.grossMargin || 0} color="bg-bloomberg-orange" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-300">Operating Margin</span>
                      <span className="text-bloomberg-yellow font-bold">{f.operatingMargin}%</span>
                    </div>
                    <ProgressBar value={f.operatingMargin || 0} color="bg-bloomberg-yellow" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-300">Net Margin</span>
                      <span className="text-bloomberg-green font-bold">{f.netMargin}%</span>
                    </div>
                    <ProgressBar value={f.netMargin || 0} color="bg-bloomberg-green" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-300">ROE</span>
                      <span className="text-bloomberg-blue font-bold">{f.roe}%</span>
                    </div>
                    <ProgressBar value={(f.roe || 0) / 2} color="bg-bloomberg-blue" />
                  </div>
                </div>
              </div>

              <div className="col-span-2 bg-bloomberg-dark p-5 border border-bloomberg-gray rounded overflow-x-auto">
                <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase">Key Statistics</h4>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-800">
                    <tr>
                      <td className="py-3 text-gray-400">Market Cap</td>
                      <td className="py-3 text-right text-white font-mono">{f.marketCap}</td>
                      <td className="py-3 pl-8 text-gray-400">Beta (5Y Monthly)</td>
                      <td className="py-3 text-right text-white font-mono">{f.beta}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-400">Enterprise Value</td>
                      <td className="py-3 text-right text-white font-mono">{f.enterpriseValue}</td>
                      <td className="py-3 pl-8 text-gray-400">52-Week Change</td>
                      <td className="py-3 text-right text-white font-mono">{f.fiftyTwoWeekChange}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-400">P/E Ratio (TTM)</td>
                      <td className="py-3 text-right text-white font-mono">{f.pe?.toFixed(2)}</td>
                      <td className="py-3 pl-8 text-gray-400">Forward P/E</td>
                      <td className="py-3 text-right text-white font-mono">{f.forwardPE?.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-400">PEG Ratio</td>
                      <td className="py-3 text-right text-white font-mono">{f.pegRatio}</td>
                      <td className="py-3 pl-8 text-gray-400">Price/Sales (TTM)</td>
                      <td className="py-3 text-right text-white font-mono">{f.ps?.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-400">Price/Book (MRQ)</td>
                      <td className="py-3 text-right text-white font-mono">{f.pb?.toFixed(2)}</td>
                      <td className="py-3 pl-8 text-gray-400">Book Value Per Share</td>
                      <td className="py-3 text-right text-white font-mono">{f.bookValue}</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-400">Debt/Equity (MRQ)</td>
                      <td className="py-3 text-right text-white font-mono">{f.debtToEquity}</td>
                      <td className="py-3 pl-8 text-gray-400">Current Ratio (MRQ)</td>
                      <td className="py-3 text-right text-white font-mono">{f.currentRatio}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'CRYP':
        const crypto = activeData.data?.filter((i: StockData) => i.symbol.includes('-USD'));
        const cryptoStocks = activeData.data?.filter((i: StockData) => !i.symbol.includes('-USD'));
        
        return (
          <div className="p-6">
            <h2 className="text-bloomberg-orange text-xl font-bold mb-6 flex items-center"><Zap className="mr-2"/> CRYPTOCURRENCY MARKET</h2>
            
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Major Cryptocurrencies</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {crypto?.map((item: StockData) => (
                  <div key={item.symbol} className="bg-bloomberg-dark p-4 border border-bloomberg-gray rounded hover:border-bloomberg-orange transition-all group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white text-lg">{item.symbol.replace('-USD','')}</span>
                      {item.change >= 0 ? <TrendingUp size={18} className="text-bloomberg-green"/> : <TrendingDown size={18} className="text-bloomberg-red"/>}
                    </div>
                    <div className="text-2xl font-terminal text-white mb-1">${item.price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className={`text-sm font-bold ${item.change >= 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                      {item.changePercent > 0 ? '+' : ''}{item.changePercent?.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Vol: ${(parseInt(item.volume || '0') / 1e9).toFixed(2)}B</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Crypto-Related Equities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cryptoStocks?.map((item: StockData) => (
                  <div key={item.symbol} className="bg-bloomberg-dark p-3 border border-bloomberg-gray rounded hover:bg-bloomberg-gray cursor-pointer" onClick={() => handleCommand(`DES ${item.symbol}`)}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{item.symbol}</span>
                      <span className={`text-xs font-bold ${item.change >= 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                        {item.changePercent?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">${item.price?.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'ETF':
        return (
          <div className="p-6">
            <h2 className="text-bloomberg-orange text-xl font-bold mb-6 flex items-center"><PieChart className="mr-2"/> ETF THEMES & TRENDS</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {activeData.data?.map((item: StockData, idx: number) => {
                const theme = activeData.themes.find((t: any) => t.symbol === item.symbol);
                return (
                  <div key={item.symbol} className="bg-bloomberg-dark p-4 border border-bloomberg-gray rounded hover:border-bloomberg-orange transition-all cursor-pointer group" onClick={() => handleCommand(`DES ${item.symbol}`)}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-bloomberg-orange text-black text-xs font-bold px-1.5 py-0.5 rounded">{item.symbol}</span>
                      {item.change >= 0 ? <TrendingUp size={14} className="text-bloomberg-green"/> : <TrendingDown size={14} className="text-bloomberg-red"/>}
                    </div>
                    <div className="text-sm font-bold text-white mb-1">{theme?.theme}</div>
                    <div className="text-xs text-gray-400 mb-2">{theme?.desc}</div>
                    <div className="flex justify-between items-end">
                      <span className="text-lg font-terminal text-white">${item.price?.toFixed(2)}</span>
                      <span className={`text-xs font-bold ${item.change >= 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                        {item.changePercent?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'ECO':
        return (
          <div className="p-6">
            <h2 className="text-bloomberg-orange text-xl font-bold mb-6 flex items-center"><Wind className="mr-2"/> ECONOMIC INDICATORS</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-bloomberg-dark p-5 border border-bloomberg-gray rounded">
                <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase">Fear & Volatility</h3>
                {activeData.data?.filter((i: StockData) => i.symbol === '^VIX').map((item: StockData) => (
                  <div key={item.symbol} className="text-center">
                    <div className="text-5xl font-terminal text-white mb-2">{item.price?.toFixed(2)}</div>
                    <div className={`text-lg font-bold ${item.change >= 0 ? 'text-bloomberg-red' : 'text-bloomberg-green'}`}>
                      VIX Index {item.change >= 0 ? '▲' : '▼'}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {item.price && item.price > 30 ? 'High Volatility' : item.price && item.price > 20 ? 'Elevated' : 'Low Volatility'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="col-span-2 bg-bloomberg-dark p-5 border border-bloomberg-gray rounded">
                <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase">Treasury Yields</h3>
                <div className="space-y-3">
                  {activeData.data?.filter((i: StockData) => ['^TNX','^FVX','^TYX'].includes(i.symbol) || i.symbol.startsWith('DGS')).map((item: StockData) => (
                    <div key={item.symbol} className="flex items-center justify-between">
                      <span className="text-gray-300 w-24">{item.symbol === '^TNX' ? '10-Year' : item.symbol === '^FVX' ? '5-Year' : item.symbol === '^TYX' ? '30-Year' : item.symbol}</span>
                      <div className="flex-1 mx-4 bg-bloomberg-gray h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-bloomberg-blue" style={{ width: `${(item.price || 0) * 10}%` }}></div>
                      </div>
                      <span className="text-white font-mono w-16 text-right">{item.price?.toFixed(2)}%</span>
                      <span className={`ml-4 text-xs w-16 text-right ${item.change >= 0 ? 'text-bloomberg-red' : 'text-bloomberg-green'}`}>
                        {item.change >= 0 ? '+' : ''}{item.change?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activeData.data?.filter((i: StockData) => ['GC=F','CL=F','SI=F','NG=F'].includes(i.symbol)).map((item: StockData) => (
                <div key={item.symbol} className="bg-bloomberg-dark p-4 border border-bloomberg-gray rounded text-center">
                  <div className="text-gray-400 text-xs mb-1">{item.symbol === 'GC=F' ? 'GOLD' : item.symbol === 'CL=F' ? 'CRUDE OIL' : item.symbol === 'SI=F' ? 'SILVER' : 'NATURAL GAS'}</div>
                  <div className="text-2xl font-terminal text-white">${item.price?.toFixed(2)}</div>
                  <div className={`text-sm ${item.change >= 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                    {item.changePercent?.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'SECF':
        return (
          <div className="p-6">
            <h2 className="text-bloomberg-orange text-xl font-bold mb-6 flex items-center"><PieChart className="mr-2"/> SECTOR PERFORMANCE (S&P 500)</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-3">
                {activeData.data?.map((item: StockData, idx: number) => {
                  const sector = activeData.sectors.find((s: any) => s.symbol === item.symbol);
                  const Icon = sector?.icon || Layers;
                  const isUp = item.change >= 0;
                  
                  return (
                    <div key={item.symbol} className="flex items-center bg-bloomberg-dark p-3 border border-bloomberg-gray rounded hover:border-bloomberg-orange transition-colors cursor-pointer" onClick={() => handleCommand(`DES ${item.symbol}`)}>
                      <div className={`p-2 rounded mr-4 ${isUp ? 'bg-bloomberg-green/20 text-bloomberg-green' : 'bg-bloomberg-red/20 text-bloomberg-red'}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white">{sector?.name}</div>
                        <div className="text-xs text-gray-400">{item.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-terminal text-white">${item.price?.toFixed(2)}</div>
                        <div className={`text-sm font-bold ${isUp ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                          {isUp ? '+' : ''}{item.changePercent?.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-bloomberg-dark p-6 border border-bloomberg-gray rounded flex items-center justify-center">
                <div className="text-center">
                  <PieChart size={64} className="text-bloomberg-orange mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400 text-sm">Sector allocation visualization</p>
                  <p className="text-xs text-gray-600 mt-2">Data sourced from SPDR sector ETFs</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'INDU':
        return (
          <div className="p-6">
            <h2 className="text-bloomberg-orange text-xl font-bold mb-6 flex items-center"><Factory className="mr-2"/> INDUSTRY VIEW</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {activeData.data?.map((item: StockData) => (
                <HeatmapBox key={item.symbol} item={item} size="small" />
              ))}
            </div>
            <div className="mt-6 text-xs text-gray-500">
              <p>Industry ETFs tracked: Insurance (KIE), Broker-Dealers (IAI), Healthcare Equipment (XHE), Biotech (XBI), Retail (XRT), Homebuilders (XHB), Software (XSW), Transportation (XTN), Metals & Mining (XME), Oil & Gas Equipment (XES)</p>
            </div>
          </div>
        );

      case 'RV':
        return (
          <div className="p-6">
            <h2 className="text-bloomberg-orange text-xl font-bold mb-6 flex items-center"><BarChart3 className="mr-2"/> RELATIVE VALUATION (TECH GIANTS)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-bloomberg-gray">
                    <th className="p-3">TICKER</th>
                    <th className="p-3">PRICE</th>
                    <th className="p-3">MKT CAP</th>
                    <th className="p-3">P/E</th>
                    <th className="p-3">FWD P/E</th>
                    <th className="p-3">PEG</th>
                    <th className="p-3">P/S</th>
                    <th className="p-3">P/B</th>
                    <th className="p-3">EV/EBITDA</th>
                  </tr>
                </thead>
                <tbody>
                  {activeData.data?.map((item: StockData) => (
                    <tr key={item.symbol} className="border-b border-bloomberg-gray hover:bg-bloomberg-dark">
                      <td className="p-3 font-bold text-white">{item.symbol}</td>
                      <td className="p-3 text-gray-300">${item.price?.toFixed(2)}</td>
                      <td className="p-3 text-gray-400">{item.marketCap}</td>
                      <td className="p-3 text-gray-300">{item.pe?.toFixed(1)}</td>
                      <td className="p-3 text-gray-300">{item.forwardPE?.toFixed(1)}</td>
                      <td className="p-3 text-gray-300">{item.pegRatio?.toFixed(2)}</td>
                      <td className="p-3 text-gray-300">{item.ps?.toFixed(2)}</td>
                      <td className="p-3 text-gray-300">{item.pb?.toFixed(2)}</td>
                      <td className="p-3 text-gray-300">{item.enterpriseValue && item.ebitda ? (parseFloat(item.enterpriseValue) / parseFloat(item.ebitda)).toFixed(1) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'NEWS':
        return (
          <div className="p-6">
            <h2 className="text-bloomberg-orange text-xl font-bold mb-6 flex items-center"><Newspaper className="mr-2"/> MARKET NEWS</h2>
            <div className="grid grid-cols-1 gap-4">
              {activeData.news?.map((n: NewsItem, i: number) => (
                <a key={i} href={n.link} target="_blank" rel="noreferrer" className="block bg-bloomberg-dark p-4 border border-bloomberg-gray rounded hover:border-bloomberg-orange transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-bloomberg-blue text-xs font-bold">{n.publisher}</span>
                    <span className="text-gray-500 text-xs">{n.published}</span>
                  </div>
                  <h3 className="text-white font-bold group-hover:text-bloomberg-orange transition-colors">{n.title}</h3>
                </a>
              ))}
            </div>
          </div>
        );

      default:
        return <div className="p-4 text-gray-400">Command executed. Rendering view...</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-bloomberg-black text-gray-200 font-sans overflow-hidden selection:bg-bloomberg-orange selection:text-black">
      
      <TickerTape />

      <div className="flex-1 overflow-y-auto relative bg-bloomberg-black" onClick={() => inputRef.current?.focus()}>
        
        {view === 'welcome' && !activeData && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-bloomberg-orange rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,107,0,0.3)] animate-pulse">
              <Terminal size={48} className="text-black" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">MINI BLOOMBERG <span className="text-bloomberg-orange">TERMINAL</span></h1>
            <p className="text-bloomberg-light-gray mb-8 max-w-md">
              Real-time market data, analytics, and financial intelligence. 
              Type <span className="text-bloomberg-orange font-bold">HELP</span> to begin.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
              {['WEI', 'GP', 'DES AAPL', 'STX'].map((cmd) => (
                <button 
                  key={cmd}
                  onClick={() => handleCommand(cmd)}
                  className="p-4 bg-bloomberg-dark border border-bloomberg-gray hover:border-bloomberg-orange hover:text-bloomberg-orange hover:scale-105 transition-all rounded text-sm font-bold"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'data' && (
          <div className="min-h-full pb-20">
            <div className="sticky top-0 bg-bloomberg-black/90 backdrop-blur border-b border-bloomberg-gray p-2 flex items-center justify-between z-10">
              <div className="flex items-center text-xs text-bloomberg-orange font-mono">
                <ChevronRight size={14} className="mr-1" />
                {activeCommand}
              </div>
              <div className="text-xs text-gray-500 flex items-center">
                <Clock size={12} className="mr-1" /> {new Date().toLocaleTimeString()}
              </div>
            </div>
            {renderContent()}
            <div ref={terminalEndRef} />
          </div>
        )}
      </div>

      <div className="bg-bloomberg-dark border-t border-bloomberg-gray p-2 z-30">
        {suggestions.length > 0 && (
          <div className="absolute bottom-16 left-0 w-full bg-bloomberg-gray border border-bloomberg-light-gray shadow-2xl max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <div 
                key={s.cmd} 
                className={`px-4 py-2 flex justify-between items-center cursor-pointer hover:bg-bloomberg-light-gray ${i === 0 ? 'bg-bloomberg-light-gray' : ''}`}
                onClick={() => { setInput(s.cmd + ' '); inputRef.current?.focus(); }}
              >
                <span className="font-bold text-bloomberg-orange">{s.cmd}</span>
                <span className="text-xs text-gray-400">{s.desc}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center bg-black border border-bloomberg-gray rounded px-3 py-2 focus-within:border-bloomberg-orange transition-colors">
          <span className="text-bloomberg-orange font-bold mr-2 select-none">{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-white font-terminal uppercase placeholder-gray-700"
            placeholder="TYPE COMMAND (E.G., DES AAPL, FA PLTR, SECF)..."
            spellCheck={false}
            autoComplete="off"
          />
          <div className="w-2 h-5 bg-bloomberg-orange animate-blink ml-2"></div>
          <div className="ml-4 text-xs text-gray-500 hidden md:flex gap-3">
            <span className="flex items-center"><span className="bg-gray-700 px-1 rounded mr-1">TAB</span> AUTO</span>
            <span className="flex items-center"><span className="bg-gray-700 px-1 rounded mr-1">↑↓</span> HIST</span>
          </div>
        </div>
      </div>
    </div>
  );
}
