import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Fuel, 
  TrendingUp, 
  AlertTriangle, 
  Calculator, 
  RefreshCw, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  Info,
  DollarSign,
  Droplets,
  Zap,
  Newspaper,
  History,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { fetchFuelCrisisData, FuelDataResponse, NewsArticle, HistoricalPrice } from './services/geminiService';
import { cn } from './lib/utils';

const VEHICLE_PRESETS = [
  { label: 'Bike',  mileage: 45 },
  { label: 'Car',   mileage: 14 },
  { label: 'Truck', mileage: 5  },
  { label: 'Bus',   mileage: 4  },
];
export default function App() {
  const [data, setData] = useState<FuelDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number>(50);
  const [avg, setAvg] = useState<number>(12);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'news' | 'history'>('news');
  const [showAnalysis, setShowAnalysis] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await fetchFuelCrisisData();
      setData(result);
      setError(null);
    } catch (err) {
      setError("Unable to sync live data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCost = useMemo(() => {
    if (!data) return 0;
    return (distance / avg) * data.prices.petrol;
  }, [distance, avg, data]);

  const monthlyImpact = useMemo(() => {
    if (!data || data.historical.length < 2) return { increase: 0, percentage: 0 };
    const currentPrice = data.prices.petrol;
    const prevPrice = data.historical[data.historical.length - 2]?.petrol || currentPrice - 20;
    const monthlyDistance = 1000;
    const currentMonthly = (monthlyDistance / avg) * currentPrice;
    const prevMonthly = (monthlyDistance / avg) * prevPrice;
    return {
      increase: currentMonthly - prevMonthly,
      percentage: ((currentMonthly - prevMonthly) / prevMonthly) * 100
    };
  }, [data, avg]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#0a0502] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <RefreshCw className="w-12 h-12 text-[#ff4e00] animate-spin mx-auto mb-4" />
          <p className="text-[#8e9299] font-mono uppercase tracking-widest text-sm text-white">Synthesizing Market Intelligence...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0502] text-white font-sans selection:bg-[#ff4e00] selection:text-white">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#ff4e00]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-[#ff4e00] text-black text-[10px] font-bold uppercase tracking-wider rounded">Live Intelligence</span>
              <span className="flex items-center gap-1 text-[#8e9299] text-xs font-mono uppercase tracking-tighter">
                <Calendar className="w-3 h-3" />
                {new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter leading-none mb-4">
              PakFuel <span className="text-[#ff4e00] font-medium italic">Crisis</span> Tracker
            </h1>
            <p className="text-[#8e9299] max-w-xl text-lg font-light leading-relaxed">
              Real-time monitoring of Pakistan's extreme energy volatility. 
              Aggregating government policies, market prices, and supply chain status.
            </p>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-full text-sm font-medium tracking-tight disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh Indices
          </button>
        </header>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Super Petrol', value: data?.prices.petrol, icon: Fuel, color: 'text-[#ff4e00]' },
            { label: 'Hi-Speed Diesel', value: data?.prices.diesel, icon: Zap, color: 'text-blue-400' },
            { label: 'Kerosene Oil', value: data?.prices.kerosene, icon: Droplets, color: 'text-cyan-300' },
            { label: 'LDO (Light Diesel)', value: data?.prices.lightDiesel, icon: Info, color: 'text-orange-200' },
          ].map((item, i) => (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl group hover:border-[#ff4e00]/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-2 rounded-xl bg-white/5", item.color)}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="text-[10px] text-[#8e9299] font-mono leading-none">PKR / LTR</div>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-[#8e9299] font-medium">{item.label}</p>
                <h2 className="text-3xl font-light tracking-tighter">Rs. {item.value?.toFixed(2)}</h2>
                <div className="pt-2 flex items-center justify-between text-[8px] text-[#8e9299] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>SRC: {data?.prices.source.toUpperCase().slice(0, 10)}</span>
                  <span>{data?.prices.lastUpdated}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit mb-8">
          {[
            { id: 'news', label: 'Crisis Feed', icon: Newspaper },
            { id: 'history', label: 'Price History', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all font-medium",
                activeTab === tab.id 
                  ? "bg-[#ff4e00] text-black" 
                  : "text-[#8e9299] hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Main Feed/Content Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'news' && (
                <motion.div
                  key="news"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-light tracking-tight">Recent Crisis Updates</h3>
                      <div className="flex items-center gap-2 text-xs text-[#8e9299]">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live Aggregator
                      </div>
                    </div>
                    
                    <div className="space-y-8">
                      {data?.newsFeed.map((news, i) => (
                        <div key={i} className="group cursor-pointer">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-32 pt-1 font-mono text-[10px] text-[#8e9299] shrink-0 uppercase tracking-widest">
                               <div className="flex items-center gap-1 mb-1">
                                  <Clock className="w-3 h-3" />
                                  {news.date}
                               </div>
                               <span className={cn(
                                 "px-2 py-0.5 rounded border text-[9px]",
                                 news.category === 'Government' ? 'border-blue-400 text-blue-400' :
                                 news.category === 'Market' ? 'border-amber-400 text-amber-400' : 'border-white/20 text-white/60'
                               )}>{news.category}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-medium group-hover:text-[#ff4e00] transition-colors mb-2 leading-snug">
                                {news.title}
                              </h4>
                              <p className="text-sm text-[#8e9299] font-light line-clamp-2 mb-4 leading-relaxed">
                                {news.excerpt}
                              </p>
                              <a 
                                href={news.url} 
                                target="_blank" 
                                className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors"
                              >
                                Source: {news.source} <ArrowRight className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                          {i < (data?.newsFeed.length - 1) && <div className="h-px bg-white/5 mt-8" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
                    <h3 className="text-2xl font-light tracking-tight mb-8">Evolution of Crisis (12-Month View)</h3>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data?.historical}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis 
                            dataKey="period" 
                            stroke="#8e9299" 
                            fontSize={11} 
                            axisLine={false} 
                            tickLine={false}
                            dy={10}
                          />
                          <YAxis 
                            stroke="#8e9299" 
                            fontSize={11} 
                            axisLine={false} 
                            tickLine={false}
                            domain={['auto', 'auto']}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#151619', border: '1px solid #ffffff10', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="petrol" 
                            stroke="#ff4e00" 
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#ff4e00', strokeWidth: 0 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            name="Petrol (Rs)"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="diesel" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            name="Diesel (Rs)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Persistent Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 mb-4 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-widest">Policy Spotlight</h3>
              </div>
              <h4 className="text-xl font-medium tracking-tight mb-2">{data?.crisis.headline}</h4>
              <p className="text-sm text-red-200/70 font-light leading-relaxed mb-6">
                {data?.crisis.summary}
              </p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="p-3 bg-red-500/10 rounded-xl">
                  <p className="text-[9px] uppercase font-bold text-red-400">Impact Level</p>
                  <p className="text-sm font-bold text-red-100">{data?.crisis.impactLevel}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                   <p className="text-[9px] uppercase font-bold text-[#8e9299]">Ref Code</p>
                   <p className="text-sm font-mono text-white">#PK92-ENERGY</p>
                </div>
              </div>
              <div className="space-y-3">
                {data?.crisis.keyPoints.map((point, i) => (
                  <div key={i} className="flex gap-2 text-xs text-white/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── INSTANT IMPACT CALCULATOR ── */}
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 group overflow-hidden relative">
              <Calculator className="absolute -right-4 -top-4 w-32 h-32 text-white/5 group-hover:text-[#ff4e00]/10 transition-colors pointer-events-none" />
              <h3 className="text-xl font-light tracking-tight mb-6">Instant Impact</h3>

              <div className="space-y-6 relative z-10">

                {/* Vehicle preset buttons */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8e9299]">Vehicle Type</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {VEHICLE_PRESETS.map((v) => (
                      <button
                        key={v.label}
                        onClick={() => {
                          setSelectedVehicle(v.label);
                          setAvg(v.mileage);
                        }}
                        className={cn(
                          "py-1.5 rounded-xl text-[11px] font-semibold tracking-tight transition-all border",
                          selectedVehicle === v.label
                            ? "bg-[#ff4e00] text-black border-[#ff4e00]"
                            : "bg-white/5 border-white/10 text-[#8e9299] hover:text-white hover:border-white/30"
                        )}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mileage slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8e9299]">Mileage (km/litre)</label>
                    <span className="text-[10px] font-mono text-[#ff4e00]">{avg} km/L</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="60"
                    value={avg}
                    onChange={(e) => {
                      setAvg(Number(e.target.value));
                      setSelectedVehicle(null);
                    }}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff4e00]"
                  />
                  <div className="flex justify-between text-[9px] text-[#8e9299] font-mono">
                    <span>4 (Heavy)</span>
                    <span>60 (Bike)</span>
                  </div>
                </div>

                {/* Distance slider */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8e9299]">Route Distance (KM)</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="500" 
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff4e00]"
                  />
                  <div className="text-lg font-light">{distance} km</div>
                </div>

                {/* Result */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-[#8e9299] mb-1 font-bold">Trip Cost Today</p>
                  <div className="text-4xl font-light tracking-tighter text-[#ff4e00]">
                    Rs. {totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-[9px] text-[#8e9299] font-mono mt-1">
                    {distance} km ÷ {avg} km/L × Rs. {data?.prices.petrol.toFixed(2)}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Impact Matrix Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-red-500/10 text-red-500">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs uppercase tracking-widest text-[#8e9299] font-medium">Extra Monthly Spend</p>
                    <h4 className="text-2xl font-light tracking-tighter text-red-500">+Rs. {monthlyImpact.increase.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
                </div>
            </div>
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex items-center gap-6">
               <div className="p-4 rounded-2xl bg-[#ff4e00]/10 text-[#ff4e00]">
                  <DollarSign className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs uppercase tracking-widest text-[#8e9299] font-medium">Monthly Inflation Shift</p>
                  <h4 className="text-2xl font-light tracking-tighter">+{monthlyImpact.percentage.toFixed(1)}%</h4>
               </div>
            </div>
            <div 
              onClick={() => setShowAnalysis(true)}
              className="p-8 rounded-[2rem] bg-[#ff4e00] text-black flex items-center justify-between group cursor-pointer"
            >
                <div>
                   <p className="text-xs uppercase tracking-widest font-bold opacity-70">Annual Report</p>
                   <h4 className="text-2xl font-bold tracking-tight">Full Analysis</h4>
                </div>
                <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </div>
        </div>

        {/* Global Analysis Modal */}
        <AnimatePresence>
          {showAnalysis && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-4xl bg-[#151619] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              >
                <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <div>
                    <h2 className="text-3xl font-light tracking-tighter">Strategic Analysis Report</h2>
                    <p className="text-xs text-[#8e9299] font-mono mt-1">DOC_REF: PK-ENERGY-SCR-2026</p>
                  </div>
                  <button 
                    onClick={() => setShowAnalysis(false)}
                    className="p-4 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <RefreshCw className="w-6 h-6 rotate-45" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-12">
                      <section>
                        <h3 className="text-[#ff4e00] text-xs font-bold uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                           <Info className="w-4 h-4" /> Executive Summary
                        </h3>
                        <p className="text-xl font-light leading-relaxed text-white/90">
                          Pakistan's energy landscape is currently navigating a "Perfect Storm" of IMF-mandated structural adjustments, local currency devaluation, and international crude volatility. Our analysis indicates a potential 15-20% further adjustment in the next quarter unless secondary subsidies are secured.
                        </p>
                      </section>

                      <section className="p-8 rounded-[2rem] bg-white/5 space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#8e9299]">Stability Projection</h4>
                        <div className="space-y-4">
                          {[
                            { label: 'Supply Chain Integrity', val: 78 },
                            { label: 'Currency Resilience', val: 42 },
                            { label: 'Consumer Affordability', val: 31 },
                          ].map(stat => (
                            <div key={stat.label}>
                              <div className="flex justify-between text-xs mb-2">
                                <span>{stat.label}</span>
                                <span className="font-mono">{stat.val}%</span>
                              </div>
                              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#ff4e00]" 
                                  style={{ width: `${stat.val}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    <div className="space-y-8">
                       <div className="p-6 rounded-3xl border border-white/5 bg-white/2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8e9299] mb-4">Risk Factors</h4>
                          <ul className="space-y-4 text-xs font-light text-[#8e9299]">
                             <li className="flex gap-2">
                                <span className="text-[#ff4e00]">•</span>
                                Middle East Geopolitics
                             </li>
                             <li className="flex gap-2">
                                <span className="text-[#ff4e00]">•</span>
                                IMF Tranche Review
                             </li>
                             <li className="flex gap-2">
                                <span className="text-[#ff4e00]">•</span>
                                Refinery Downtime
                             </li>
                          </ul>
                       </div>
                       
                       <div className="p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-[#ff4e00]/20 to-transparent">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">Predictive Insight</h4>
                          <p className="text-sm font-light leading-relaxed">
                            Market sentiment remains bearish. We recommend hedging fuel costs for logistics operators before the mid-June policy revision.
                          </p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-white/5 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-[#8e9299] font-mono">
                  <span>CONFIDENTIAL: AUTHORIZED ACCESS ONLY</span>
                  <span>GENERATED BY PAKFUEL AI v4.0</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-white/5 rounded-lg">
                <Fuel className="w-4 h-4 text-[#8e9299]" />
             </div>
             <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-[#8e9299]">Intelligence Source: {data?.prices.source}</p>
          </div>
          <p className="text-[10px] text-[#8e9299] font-mono">Sync Latency: 2.4s | Node ID: PK-CRISIS-7</p>
        </footer>
      </div>
    </div>
  );
}