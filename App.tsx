
import React, { useState, useCallback, useEffect } from 'react';
import Layout from './components/Layout';
import { Mood, Place, Budget, BuddyResponse } from './types';
import { geminiService } from './services/geminiService';

const MOODS: { label: Mood; icon: string }[] = [
  { label: 'Tired', icon: '😴' },
  { label: 'Stressed', icon: '😫' },
  { label: 'Happy', icon: '😊' },
  { label: 'Bored', icon: '😐' },
  { label: 'Celebrating', icon: '🎉' }
];

const PLACES: { label: Place; icon: string }[] = [
  { label: 'Hostel Room', icon: '🏠' },
  { label: 'Canteen', icon: '🍱' },
  { label: 'Market', icon: '🏪' },
  { label: 'Home', icon: '🏘️' },
  { label: 'Cafe', icon: '☕' }
];

const BUDGETS: Budget[] = ['Broke', 'Standard', 'Splurge'];

type ViewState = 'input' | 'loading' | 'result';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('input');
  const [inputValue, setInputValue] = useState('');
  const [mood, setMood] = useState<Mood>('Happy');
  const [place, setPlace] = useState<Place>('Hostel Room');
  const [budget, setBudget] = useState<Budget>('Standard');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  const [result, setResult] = useState<(BuddyResponse & { imageUrl?: string }) | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Location denied")
      );
    }
  }, []);

  const handlePlanning = useCallback(async () => {
    if (!inputValue.trim()) return;
    setView('loading');
    try {
      const buddyData = await geminiService.getSuggestion(inputValue, { 
        mood, place, budget, lat: coords?.lat, lng: coords?.lng
      });
      setResult(buddyData);
      setView('result');
      geminiService.generateMealImage(buddyData.imagePrompt).then(imageUrl => {
        setResult(prev => prev ? { ...prev, imageUrl } : null);
      });
    } catch (err) {
      setView('input');
    }
  }, [inputValue, mood, place, budget, coords]);

  const reset = () => {
    setInputValue('');
    setResult(null);
    setView('input');
  };

  return (
    <Layout 
      title={view === 'result' ? "Today's Swap" : "One More Bite"}
      onBack={view === 'result' ? reset : undefined}
    >
      {view === 'input' && (
        <div className="px-8 py-4 space-y-10 animate-soft-in">
          {/* Headline Section */}
          <div className="relative pt-4">
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-orange-100/30 rounded-full blur-2xl -z-10"></div>
            <h2 className="text-4xl leading-[1.2] font-display font-bold tracking-tight text-zinc-900">
              Eat <span className="italic">Better.</span><br/>
              <span className="text-emerald-500 font-sans font-light">Stay Strong.</span>
            </h2>
            <div className="w-16 h-1 bg-zinc-100 mt-4 rounded-full"></div>
            <div className="h-4 dot-pattern opacity-20 mt-1"></div>
          </div>

          <div className="space-y-8">
            {/* Meal Input */}
            <div className="relative group">
              <textarea
                className="w-full bg-transparent border-none focus:ring-0 text-xl font-light placeholder:text-zinc-200 min-h-[90px] resize-none leading-relaxed"
                placeholder="Planning for Maggi and coke..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <div className="w-full h-[1px] bg-zinc-100 group-focus-within:bg-orange-500 transition-all duration-300" />
              <p className="text-[10px] text-zinc-400 mt-2 italic">“High-protein meals boost focus by 23%”</p>
            </div>

            {/* Chips Grid */}
            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center">
                    😊 Mood
                  </h3>
                  <span className="text-[9px] text-zinc-300 font-medium">Meals that match your state of mind</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map(m => (
                    <button 
                      key={m.label} 
                      onClick={() => setMood(m.label)} 
                      className={`px-4 py-2 rounded-full text-[11px] font-semibold transition-all duration-200 ${
                        mood === m.label 
                        ? 'bg-emerald-500 text-white inner-shadow shadow-lg shadow-emerald-100' 
                        : 'bg-zinc-50 text-zinc-500 border border-zinc-100 hover:bg-zinc-100'
                      }`}
                    >
                      <span className="mr-1.5">{m.icon}</span>{m.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center">
                    📍 Location
                  </h3>
                  <span className="text-[9px] text-zinc-300 font-medium">Where are you eating from?</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PLACES.map(p => (
                    <button 
                      key={p.label} 
                      onClick={() => setPlace(p.label)} 
                      className={`px-4 py-2 rounded-full text-[11px] font-semibold transition-all duration-200 ${
                        place === p.label 
                        ? 'bg-emerald-500 text-white inner-shadow shadow-lg shadow-emerald-100' 
                        : 'bg-zinc-50 text-zinc-500 border border-zinc-100 hover:bg-zinc-100'
                      }`}
                    >
                      <span className="mr-1.5">{p.icon}</span>{p.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center">
                     💰 Budget
                  </h3>
                  <span className="text-[9px] text-zinc-300 font-medium">We'll tailor suggestions for your spend</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {BUDGETS.map(b => (
                    <button 
                      key={b} 
                      onClick={() => setBudget(b)} 
                      className={`py-2.5 rounded-2xl text-[11px] font-bold transition-all duration-200 ${
                        budget === b 
                        ? 'bg-emerald-500 text-white inner-shadow shadow-lg shadow-emerald-100' 
                        : 'bg-zinc-50 text-zinc-500 border border-zinc-100'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button 
              onClick={handlePlanning} 
              disabled={!inputValue.trim()} 
              className="w-full cta-gradient disabled:opacity-30 text-white py-5 rounded-full text-[13px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-orange-100 flex items-center justify-center space-x-2 transition-transform active:scale-95"
            >
              <span>🍽️ Find My Meal</span>
            </button>
            <p className="text-center text-[9px] text-zinc-300 uppercase tracking-widest">Personalized just for you</p>
          </div>
        </div>
      )}

      {view === 'loading' && (
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <div className="w-12 h-12 relative mb-6">
            <div className="absolute inset-0 border-2 border-zinc-100 rounded-full" />
            <div className="absolute inset-0 border-2 border-orange-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Designing your nudge...</p>
        </div>
      )}

      {view === 'result' && result && (
        <div className="flex-1 overflow-y-auto animate-soft-in">
          {/* Compressed Hero */}
          <div className="px-6 mt-2">
            <div className="relative aspect-video w-full rounded-[32px] overflow-hidden minimal-shadow bg-zinc-50">
              {result.imageUrl ? (
                <img src={result.imageUrl} className="w-full h-full object-cover" alt={result.suggestedFood} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-emerald-50">
                  <span className="text-zinc-300 text-[10px] font-bold uppercase tracking-widest animate-pulse">Visualizing...</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h2 className="text-2xl font-bold font-display leading-tight">{result.suggestedFood}</h2>
              </div>
            </div>
          </div>

          <div className="px-8 mt-6 space-y-8 pb-10">
            {/* The Nudge */}
            <p className="text-zinc-500 text-md leading-relaxed font-light italic border-l-2 border-orange-500 pl-4">"{result.nudge}"</p>

            {/* Health Impact - Side-by-Side to save height */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100">
                <h4 className="text-[9px] font-bold text-red-600 uppercase tracking-widest mb-1">Risk</h4>
                <p className="text-zinc-800 text-[11px] leading-tight font-medium">{result.healthRisk}</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <h4 className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Benefit</h4>
                <p className="text-zinc-800 text-[11px] leading-tight font-medium">{result.healthBenefits}</p>
              </div>
            </div>

            {/* Nearby Spot - Compact */}
            {result.nearbySpotName && (
              <div className="p-5 rounded-3xl bg-blue-50/30 border border-blue-100 flex items-center justify-between">
                <div className="overflow-hidden">
                  <h4 className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Local Spot</h4>
                  <p className="text-sm font-bold text-zinc-900 truncate">{result.nearbySpotName}</p>
                </div>
                <a href={result.nearbySpotLink} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-white shadow-sm border border-zinc-100 text-blue-500 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                </a>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Price Change</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-zinc-900">₹{result.suggestedPrice}</span>
                  <span className={`text-[10px] font-bold ${result.suggestedPrice > result.originalPrice ? 'text-orange-500' : 'text-emerald-500'}`}>
                    {result.suggestedPrice > result.originalPrice ? '+' : ''}₹{Math.abs(result.suggestedPrice - result.originalPrice)}
                  </span>
                </div>
              </div>
              <button onClick={reset} className="px-5 py-3 rounded-full bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest transition-transform active:scale-95">Done</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
