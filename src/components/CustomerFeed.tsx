import { useState, useEffect } from 'react';
import { Offer, Order } from '../types';
import { Clock, MapPin, CheckCircle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function CountdownTimer({ pickupEnd }: { pickupEnd: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const [hours, minutes] = pickupEnd.split(':').map(Number);
      const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
      
      const diff = target.getTime() - now.getTime();
      
      if (diff <= 0) {
        return 'Isteklo';
      }
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(interval);
  }, [pickupEnd]);

  if (timeLeft === 'Isteklo') {
    return <span className="text-red-500 font-bold ml-1">Isteklo</span>;
  }

  return <span className="font-mono ml-1 font-bold animate-pulse text-[#b45309]">{timeLeft}</span>;
}

interface Props {
  offers: Offer[];
  onReserve: (offerId: string) => Order | null;
  onNavigate: (path: string) => void;
}

export default function CustomerFeed({ offers, onReserve, onNavigate }: Props) {
  const [filterNoPork, setFilterNoPork] = useState(false);
  const [filterVegan, setFilterVegan] = useState(false);
  const [filterPrice, setFilterPrice] = useState<'all' | 'under5' | '5to10'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'bakery' | 'fast_food' | 'grocery' | 'restaurant'>('all');
  const [quickFilter, setQuickFilter] = useState<'none' | 'popular' | 'ending_soon' | 'discount'>('none');
  
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  const [isVerified, setIsVerified] = useState(
    localStorage.getItem('phoneVerified') === 'true' && !!localStorage.getItem('userPhone')
  );
  const [verifying, setVerifying] = useState<'none' | 'phone' | 'code'>('none');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [inputCode, setInputCode] = useState('');

  const IMAGE_MAP: Record<string, string> = {
    bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
    fast_food: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
    grocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    restaurant: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=800&q=80"
  };

  let filteredOffers = offers.filter(o => {
    if (filterNoPork && !o.noPork) return false;
    if (filterVegan && !o.vegan) return false;
    if (filterPrice === 'under5' && o.price >= 5) return false;
    if (filterPrice === '5to10' && (o.price < 5 || o.price > 10)) return false;
    if (filterCategory !== 'all' && o.category !== filterCategory) return false;
    return true;
  });

  if (quickFilter === 'ending_soon') {
    filteredOffers.sort((a, b) => a.pickupEnd.localeCompare(b.pickupEnd));
  } else if (quickFilter === 'discount') {
    filteredOffers.sort((a, b) => (b.valueEstimate - b.price) - (a.valueEstimate - a.price));
  } else if (quickFilter === 'popular') {
    filteredOffers.sort((a, b) => (b.reservedCount || 0) - (a.reservedCount || 0));
  }

  const handleReserveClick = () => {
    if (!selectedOffer || selectedOffer.quantity === 0) return;
    
    if (!isVerified || !localStorage.getItem('userPhone')) {
      setVerifying('phone');
      return;
    }
    
    executeReservation();
  };

  const executeReservation = () => {
    if (!selectedOffer) return;
    const order = onReserve(selectedOffer.id);
    if (order) {
      setSuccessOrder(order);
    }
  };

  const closeModals = () => {
    setSelectedOffer(null);
    setSuccessOrder(null);
  };

  return (
    <div className="relative">
      {/* HERO SECTION */}
      <div className="text-center py-12 pb-8 px-4">
        <h1 className="text-4xl sm:text-5xl font-black text-[#1a1c18] mb-4 tracking-tight leading-tight">Uštedi do 70% na hrani<br/>koja bi bila bačena.</h1>
        <p className="text-[#6b7264] font-medium text-lg mb-6">Preuzmi svježe pakete iz lokalnih radnji po nižoj cijeni.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm font-bold text-[#4f6d44] bg-[#f0f4ef] py-4 px-6 rounded-3xl sm:rounded-full inline-flex mx-auto w-full sm:w-auto text-left sm:text-center shadow-sm">
          <span className="flex items-center gap-2"><CheckCircle size={18}/> Svježa, neprodana hrana</span>
          <span className="hidden sm:inline opacity-30">•</span>
          <span className="flex items-center gap-2"><CheckCircle size={18}/> Preuzimanje u radnji</span>
          <span className="hidden sm:inline opacity-30">•</span>
          <span className="flex items-center gap-2"><CheckCircle size={18}/> Preko 500+ kupaca</span>
        </div>
      </div>

      {/* QUICK CHIPS */}
      <div className="px-4 mb-3 max-w-5xl mx-auto flex gap-2 overflow-x-auto no-scrollbar py-2">
        <button onClick={() => setQuickFilter(q => q === 'popular' ? 'none' : 'popular')} className={`shrink-0 px-5 py-2.5 rounded-[20px] text-sm font-bold transition-all ${quickFilter === 'popular' ? 'bg-[#b45309] text-white shadow-md' : 'bg-white border border-[#eceae0] text-[#1a1c18] hover:bg-gray-50'} flex items-center gap-2`}>🔥 Popularno</button>
        <button onClick={() => setQuickFilter(q => q === 'ending_soon' ? 'none' : 'ending_soon')} className={`shrink-0 px-5 py-2.5 rounded-[20px] text-sm font-bold transition-all ${quickFilter === 'ending_soon' ? 'bg-[#b45309] text-white shadow-md' : 'bg-white border border-[#eceae0] text-[#1a1c18] hover:bg-gray-50'} flex items-center gap-2`}>⏰ Ističe uskoro</button>
        <button onClick={() => setQuickFilter(q => q === 'discount' ? 'none' : 'discount')} className={`shrink-0 px-5 py-2.5 rounded-[20px] text-sm font-bold transition-all ${quickFilter === 'discount' ? 'bg-[#b45309] text-white shadow-md' : 'bg-white border border-[#eceae0] text-[#1a1c18] hover:bg-gray-50'} flex items-center gap-2`}>💸 Najveći popust</button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-[#fbfaf7] px-4 py-3 sm:rounded-[32px] sm:border border-b border-[#eceae0] mb-6 flex flex-wrap gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)] sm:shadow-sm sticky sm:relative top-[73px] sm:top-0 z-20">
        <div className="w-full flex gap-2 overflow-x-auto pb-1 no-scrollbar items-center">
          <label className="flex items-center gap-2 cursor-pointer group shrink-0 bg-white border border-[#eceae0] px-3 py-1.5 rounded-full">
            <input type="checkbox" className="hidden" checked={filterNoPork} onChange={() => setFilterNoPork(!filterNoPork)} />
            <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center transition-colors ${filterNoPork ? 'border-[#4f6d44] bg-[#f0f4ef]' : 'border-[#d1cfc0]'}`}>
              {filterNoPork && <div className="w-2 h-2 bg-[#4f6d44] rounded-full"></div>}
            </div>
            <span className="text-xs font-bold text-[#2d312a]">🥩 No Pork</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group shrink-0 bg-white border border-[#eceae0] px-3 py-1.5 rounded-full">
            <input type="checkbox" className="hidden" checked={filterVegan} onChange={() => setFilterVegan(!filterVegan)} />
            <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center transition-colors ${filterVegan ? 'border-[#4f6d44] bg-[#f0f4ef]' : 'border-[#d1cfc0]'}`}>
              {filterVegan && <div className="w-2 h-2 bg-[#4f6d44] rounded-full"></div>}
            </div>
            <span className="text-xs font-bold text-[#2d312a]">🥦 Vegan</span>
          </label>

          <div className="w-px h-6 bg-[#eceae0] mx-1 shrink-0"></div>

          <select 
            value={filterPrice} 
            onChange={(e) => setFilterPrice(e.target.value as any)}
            className="shrink-0 bg-white border border-[#eceae0] rounded-full px-3 py-1.5 text-xs font-bold text-[#2d312a] focus:outline-none"
          >
            <option value="all">💰 Sve Cijene</option>
            <option value="under5">0 - 5 KM</option>
            <option value="5to10">5 - 10 KM</option>
          </select>

          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="shrink-0 bg-white border border-[#eceae0] rounded-full px-3 py-1.5 text-xs font-bold text-[#2d312a] focus:outline-none"
          >
            <option value="all">Sve Kategorije</option>
            <option value="bakery">Pekare</option>
            <option value="fast_food">Fast Food</option>
            <option value="grocery">Marketi</option>
            <option value="restaurant">Restorani</option>
          </select>
        </div>
      </div>

      {/* FEED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        <div className="flex items-baseline justify-between mb-2 md:col-span-2">
          <h2 className="text-2xl font-bold text-[#1a1c18]">🔥 Ponude blizu vas</h2>
        </div>
        
        {filteredOffers.map(offer => (
          <div 
            key={offer.id} 
            className={`bg-white rounded-[32px] border border-[#eceae0] overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${offer.quantity === 0 ? 'opacity-60 bg-[#f5f4f0]' : ''}`}
            onClick={() => setSelectedOffer(offer)}
          >
            <div className="relative h-40">
              <img 
                src={IMAGE_MAP[offer.category || 'restaurant']} 
                alt={offer.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-1">
                {offer.noPork && <span className="bg-[#f0f4ef] text-[#4f6d44] text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full shadow-sm">No Pork</span>}
                {offer.vegan && <span className="bg-[#f0f4ef] text-[#4f6d44] text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full shadow-sm">Vegan</span>}
              </div>
              {offer.quantity === 0 && (
                <div className="absolute inset-0 flex items-center justify-center rotate-[-12deg] pointer-events-none">
                  <span className="text-4xl font-black text-black/20 border-4 border-black/20 px-4 py-1 bg-white/40 backdrop-blur-sm">SOLD OUT</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1a1c18] leading-tight">{offer.title}</h3>
                  {offer.quantity > 0 && offer.quantity <= 2 && (
                    <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest mt-2 animate-pulse shadow-sm border border-red-200">
                      ⚡ Rasprodaje se brzo
                    </div>
                  )}
                </div>
                {offer.quantity > 0 && offer.quantity <= 3 && (
                  <span className="text-xs font-bold text-[#b45309] bg-[#fef3c7] px-2 py-1 rounded-lg shrink-0 shadow-sm border border-[#fef3c7]/50">
                    🔥 Ostalo {offer.quantity} paketa!
                  </span>
                )}
              </div>
              
              <p className="text-sm text-[#6b7264] mb-4 flex items-center gap-1">
                <MapPin size={14} /> {offer.location} • {offer.distance} km
              </p>

              <div className="flex items-end justify-between border-t border-[#f5f4ef] pt-4">
                <div>
                  <p className="text-xs text-[#b45309] font-bold flex items-center gap-1 bg-[#fef3c7]/20 px-2 py-0.5 rounded-md inline-flex mb-1">
                    <Clock size={12}/> Ističe za: <CountdownTimer pickupEnd={offer.pickupEnd} />
                  </p>
                  <p className="text-2xl font-black text-[#1a1c18] mt-1">
                    {offer.price} KM <span className="text-sm font-normal text-[#6b7264] line-through">~{offer.valueEstimate} KM</span>
                  </p>
                </div>
                <button 
                  disabled={offer.quantity === 0}
                  className={`px-6 py-2.5 rounded-2xl text-sm font-bold shadow-sm transition-colors ${offer.quantity > 0 ? 'bg-[#4f6d44] text-white active:scale-95' : 'bg-[#d1cfc0] text-white'}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedOffer(offer); }}
                >
                  {offer.quantity > 0 ? 'Rezerviši' : 'SOLD OUT'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredOffers.length === 0 && (
          <div className="text-center text-[#6b7264] py-10 md:col-span-2">
            No offers match your filters.
          </div>
        )}
      </div>

      {/* DETAIL OVERLAY */}
      <AnimatePresence>
        {selectedOffer && !successOrder && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 bg-[#fbfaf7] overflow-y-auto"
          >
            <div className="relative h-64">
              <img 
                src={IMAGE_MAP[selectedOffer.category || 'restaurant']} 
                alt={selectedOffer.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button 
                onClick={closeModals}
                className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-2 rounded-full shadow-sm text-[#1a1c18] font-medium flex items-center gap-1 border border-[#eceae0]"
              >
                <ChevronLeft size={18} /> Back
              </button>
            </div>
            <div className="p-6 pb-32 max-w-5xl mx-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-[#1a1c18] leading-none mb-2">{selectedOffer.title}</h2>
                  <p className="text-[#6b7264] flex items-center gap-1"><MapPin size={16}/> {selectedOffer.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-[#1a1c18]">{selectedOffer.price} KM</div>
                  <div className="text-sm text-[#6b7264] line-through">~{selectedOffer.valueEstimate} KM</div>
                </div>
              </div>

              <div className="flex gap-2 mb-6 border-b border-[#eceae0] pb-6">
                 {selectedOffer.noPork && <span className="bg-[#f0f4ef] text-[#4f6d44] text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full shadow-sm text-[#1a1c18]">No Pork</span>}
                 {selectedOffer.vegan && <span className="bg-[#f0f4ef] text-[#4f6d44] text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full shadow-sm text-[#1a1c18]">Vegan</span>}
              </div>

              <div className="bg-white border border-[#eceae0] shadow-sm rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-2 text-[#1a1c18] font-semibold mb-1">
                  <Clock size={18} className="text-[#4f6d44]" /> Vrijeme preuzimanja
                </div>
                <div className="text-[#6b7264]">Preuzmite danas do <strong className="text-[#1a1c18]">{selectedOffer.pickupEnd}</strong></div>
              </div>

              <h3 className="font-bold text-lg mb-3 text-[#1a1c18]">Šta vas očekuje unutra?</h3>
              
              <div className="bg-[#f0f4ef] rounded-2xl p-5 mb-6 text-sm text-[#4f6d44] font-medium leading-relaxed shadow-sm">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3"><div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#4f6d44]" /> Hrana nije servirana, već neprodana (fresh surplus)</li>
                  <li className="flex items-start gap-3"><div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#4f6d44]" /> Sadržaj paketa može varirati iznenađenjem</li>
                  <li className="flex items-start gap-3"><div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#4f6d44]" /> Plaćanje se vrši na licu mjesta</li>
                  <li className="flex items-start gap-3 text-red-600"><div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-600" /> Bez koda nema preuzimanja</li>
                </ul>
              </div>

              <button onClick={() => onNavigate('/terms')} className="text-sm font-bold text-[#6b7264] underline hover:text-[#1a1c18] transition-colors inline-block mb-10">Pročitaj potpune Uslove Korištenja</button>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#eceae0] p-4 pb-safe flex justify-center z-50">
              <button 
                disabled={selectedOffer.quantity === 0}
                onClick={handleReserveClick}
                className="w-full max-w-md bg-[#4f6d44] hover:bg-[#3d5434] disabled:bg-[#d1cfc0] text-white font-bold text-lg py-4 rounded-[20px] shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {selectedOffer.quantity === 0 ? 'SOLD OUT' : 'Rezerviši paket'}
              </button>
            </div>
          </motion.div>
        )}

        {/* SUCCESS OVERLAY */}
        {successOrder && selectedOffer && (
           <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="fixed inset-0 z-50 bg-[#fbfaf7] text-[#2d312a] flex flex-col items-center p-6 overflow-y-auto"
         >
           <div className="bg-white rounded-[32px] border-2 border-[#4f6d44] shadow-xl p-6 w-full max-w-md mt-12 mb-8">
             <div className="text-center mb-6">
               <div className="w-16 h-16 bg-[#f0f4ef] rounded-full flex items-center justify-center mx-auto mb-3">
                 <CheckCircle size={32} className="text-[#4f6d44]"/>
               </div>
               <h3 className="text-xl font-bold text-[#1a1c18]">Rezervacija Uspješna!</h3>
               <p className="text-xs text-[#6b7264] mt-1">Hvala što spašavate hranu.</p>
             </div>

             <div className="bg-[#fbfaf7] border border-[#eceae0] rounded-2xl p-4 mb-6">
               <p className="text-[10px] font-bold text-[#6b7264] uppercase text-center mb-1">Vaš Kod za Preuzimanje</p>
               <div className="text-3xl font-black text-[#4f6d44] text-center tracking-widest">{successOrder.id}</div>
             </div>

             <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-6 flex items-start gap-2">
               <span className="text-red-500 font-bold text-lg leading-none">!</span>
               <p className="text-xs text-red-800 font-semibold leading-snug">
                 Tvoj kod: {successOrder.id}. Pokaži ga u radnji na kasi. Bez koda nema preuzimanja!
               </p>
             </div>

             <div className="space-y-4">
               <div className="flex items-start gap-3">
                 <div className="w-6 h-6 bg-[#4f6d44] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                 <p className="text-xs leading-relaxed">Otiđite na lokaciju <strong>{selectedOffer.location}</strong> najkasnije do {selectedOffer.pickupEnd}h.</p>
               </div>
               <div className="flex items-start gap-3">
                 <div className="w-6 h-6 bg-[#4f6d44] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                 <p className="text-xs leading-relaxed">Pokaži ovaj kod (<strong>{successOrder.id}</strong>) uposleniku.</p>
               </div>
               <div className="flex items-start gap-3">
                 <div className="w-6 h-6 bg-[#4f6d44] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                 <p className="text-xs leading-relaxed">Platite <strong>{selectedOffer.price} KM</strong> pri preuzimanju.</p>
               </div>
             </div>

             <div className="mt-6 pt-6 border-t border-[#eceae0] space-y-3">
               <button 
                 onClick={() => {
                   closeModals();
                   onNavigate('/my-orders');
                 }}
                 className="w-full py-4 bg-[#fef3c7] hover:bg-[#fde68a] text-[#b45309] border border-[#fef3c7] rounded-2xl text-sm font-bold shadow-sm transition-colors uppercase tracking-widest"
               >
                 Prikaži Moje Rezervacije
               </button>
               <button 
                 onClick={closeModals}
                 className="w-full py-4 bg-[#fbfaf7] hover:bg-[#f5f4ef] text-[#6b7264] border border-[#eceae0] rounded-2xl text-sm font-bold shadow-sm transition-colors"
               >
                 Povratak na Ponude
               </button>
             </div>
           </div>
         </motion.div>
        )}
       </AnimatePresence>

       {/* MOCK SMS NOTIFICATION */}
       {verifying === 'code' && (
         <div className="fixed top-4 right-4 bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-[100] border-l-4 border-[#FF6321] max-w-[300px] animate-bounce">
           <div className="font-bold text-[10px] uppercase tracking-widest text-gray-400 mb-1">Nova Poruka</div>
           <div className="text-sm font-medium text-gray-800">Tvoj Spasi Obrok kod za verifikaciju: <strong className="text-xl text-[#1a1c18] ml-1 tracking-widest">{authCode}</strong></div>
         </div>
       )}

       {/* VERIFICATION DIALOG */}
       <AnimatePresence>
         {verifying !== 'none' && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
           >
             <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-xl">
               <h3 className="text-xl font-bold mb-2 text-[#1a1c18]">
                 {verifying === 'phone' ? 'Potvrdi broj telefona' : 'Unesi SMS kod'}
               </h3>
               <p className="text-sm text-[#6b7264] mb-6">
                 {verifying === 'phone' ? 'Ovo osigurava da prodavci imaju prave narudžbe i sprječava spam rezervacije.' : 'Poslali smo ti 4-cifreni kod na uneseni broj.'}
               </p>
               
               <input 
                 type="text" 
                 placeholder={verifying === 'phone' ? "06X XXX XXX" : "____"}
                 value={verifying === 'phone' ? phoneNumber : inputCode}
                 onChange={e => verifying === 'phone' ? setPhoneNumber(e.target.value) : setInputCode(e.target.value)}
                 className="w-full bg-[#fbfaf7] border border-[#eceae0] rounded-xl px-4 py-3 mb-6 font-bold text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#4f6d44] transition-all"
               />

               <div className="flex gap-3">
                 <button 
                   onClick={() => setVerifying('none')} 
                   className="flex-1 py-3 text-[#6b7264] font-bold bg-[#fbfaf7] rounded-xl hover:bg-[#f0f4ef] transition-colors"
                 >
                   Odustani
                 </button>
                 <button 
                   onClick={() => {
                     if (verifying === 'phone') {
                        if (phoneNumber.length < 6) return;
                        setAuthCode(Math.floor(1000 + Math.random() * 9000).toString());
                        setVerifying('code');
                     } else {
                        if (inputCode === authCode) {
                           localStorage.setItem('phoneVerified', 'true');
                           localStorage.setItem('userPhone', phoneNumber);
                           setIsVerified(true);
                           setVerifying('none');
                           executeReservation();
                        } else {
                           alert("Pogrešan kod!");
                        }
                     }
                   }}
                   className="flex-1 bg-[#4f6d44] text-white rounded-xl font-bold hover:bg-[#3d5434] transition-colors shadow-sm"
                 >
                   {verifying === 'phone' ? 'Pošalji kod' : 'Potvrdi'}
                 </button>
               </div>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}
