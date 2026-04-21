import { useState } from 'react';
import { Offer, Order } from '../types';
import { Clock, MapPin, CheckCircle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  offers: Offer[];
  onReserve: (offerId: string) => Order | null;
}

export default function CustomerFeed({ offers, onReserve }: Props) {
  const [filterNoPork, setFilterNoPork] = useState(false);
  const [filterVegan, setFilterVegan] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  const filteredOffers = offers.filter(o => {
    if (filterNoPork && !o.noPork) return false;
    if (filterVegan && !o.vegan) return false;
    return true;
  });

  const handleReserveClick = () => {
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
      {/* FILTER BAR */}
      <div className="bg-[#fbfaf7] px-4 py-3 sm:rounded-[32px] sm:border border-b border-[#eceae0] mb-6 flex flex-wrap gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] sm:shadow-sm sticky sm:relative top-[73px] sm:top-0 z-20">
        <h2 className="hidden sm:block text-sm font-bold uppercase tracking-widest text-[#6b7264] w-full mb-1">Filters</h2>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input type="checkbox" className="hidden" checked={filterNoPork} onChange={() => setFilterNoPork(!filterNoPork)} />
          <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${filterNoPork ? 'border-[#4f6d44] bg-[#f0f4ef]' : 'border-[#d1cfc0]'}`}>
            {filterNoPork && <div className="w-2.5 h-2.5 bg-[#4f6d44] rounded-sm"></div>}
          </div>
          <span className="text-sm font-medium text-[#2d312a]">No Pork</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input type="checkbox" className="hidden" checked={filterVegan} onChange={() => setFilterVegan(!filterVegan)} />
          <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${filterVegan ? 'border-[#4f6d44] bg-[#f0f4ef]' : 'border-[#d1cfc0]'}`}>
            {filterVegan && <div className="w-2.5 h-2.5 bg-[#4f6d44] rounded-sm"></div>}
          </div>
          <span className="text-sm font-medium text-[#2d312a]">Vegan</span>
        </label>
      </div>

      {/* FEED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        <div className="flex items-baseline justify-between mb-2 md:col-span-2">
          <h2 className="text-2xl font-bold text-[#1a1c18]">🔥 Deals near you</h2>
        </div>
        
        {filteredOffers.map(offer => (
          <div 
            key={offer.id} 
            className={`bg-white rounded-[32px] border border-[#eceae0] overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${offer.quantity === 0 ? 'opacity-60 bg-[#f5f4f0]' : ''}`}
            onClick={() => setSelectedOffer(offer)}
          >
            <div className="relative h-40">
              <img 
                src={`https://picsum.photos/seed/${offer.imageSeed}/400/200?blur=1`} 
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
                <h3 className="text-lg font-bold text-[#1a1c18] leading-tight">{offer.title}</h3>
                {offer.quantity > 0 && offer.quantity <= 3 && (
                  <span className="text-xs font-semibold text-[#b45309] bg-[#fef3c7] px-2 py-1 rounded-lg shrink-0">
                    Only {offer.quantity} left
                  </span>
                )}
              </div>
              
              <p className="text-sm text-[#6b7264] mb-4 flex items-center gap-1">
                <MapPin size={14} /> {offer.location} • {offer.distance} km
              </p>

              <div className="flex items-end justify-between border-t border-[#f5f4ef] pt-4">
                <div>
                  <p className="text-xs text-[#6b7264] font-medium flex items-center gap-1"><Clock size={12}/> Pickup until {offer.pickupEnd}</p>
                  <p className="text-2xl font-black text-[#1a1c18] mt-1">
                    {offer.price} KM <span className="text-sm font-normal text-[#6b7264] line-through">~{offer.valueEstimate} KM</span>
                  </p>
                </div>
                <button 
                  disabled={offer.quantity === 0}
                  className={`px-6 py-2.5 rounded-2xl text-sm font-bold shadow-sm transition-colors ${offer.quantity > 0 ? 'bg-[#4f6d44] text-white active:scale-95' : 'bg-[#d1cfc0] text-white'}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedOffer(offer); }}
                >
                  {offer.quantity > 0 ? 'Reserve' : 'SOLD OUT'}
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
                src={`https://picsum.photos/seed/${selectedOffer.imageSeed}/800/600`} 
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
                  <Clock size={18} className="text-[#4f6d44]" /> Pick up time
                </div>
                <div className="text-[#6b7264]">Collect today before <strong className="text-[#1a1c18]">{selectedOffer.pickupEnd}</strong></div>
              </div>

              <h3 className="font-bold text-lg mb-2 text-[#1a1c18]">What you might get</h3>
              <p className="text-[#6b7264] leading-relaxed max-w-xl">
                Food is unsold but fresh. Contents may vary depending on what hasn't sold during the day. Expected value of the food inside is around {selectedOffer.valueEstimate} KM.
              </p>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#eceae0] p-4 pb-safe flex justify-center z-50">
              <button 
                disabled={selectedOffer.quantity === 0}
                onClick={handleReserveClick}
                className="w-full max-w-md bg-[#4f6d44] hover:bg-[#3d5434] disabled:bg-[#d1cfc0] text-white font-bold text-lg py-4 rounded-[20px] shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {selectedOffer.quantity === 0 ? 'SOLD OUT' : 'Reserve'}
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

             <div className="space-y-4">
               <div className="flex items-start gap-3">
                 <div className="w-6 h-6 bg-[#4f6d44] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                 <p className="text-xs leading-relaxed">Idite na lokaciju <strong>{selectedOffer.location}</strong> prije {selectedOffer.pickupEnd}h.</p>
               </div>
               <div className="flex items-start gap-3">
                 <div className="w-6 h-6 bg-[#4f6d44] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                 <p className="text-xs leading-relaxed">Pokažite <strong>kod {successOrder.id}</strong> uposleniku.</p>
               </div>
               <div className="flex items-start gap-3">
                 <div className="w-6 h-6 bg-[#4f6d44] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                 <p className="text-xs leading-relaxed">Platite <strong>{selectedOffer.price} KM</strong> direktno u objektu.</p>
               </div>
             </div>

             <div className="mt-6 pt-6 border-t border-[#eceae0]">
               <button 
                 onClick={closeModals}
                 className="w-full py-3 bg-[#4f6d44] hover:bg-[#3d5434] text-white rounded-2xl text-sm font-bold shadow-sm transition-colors"
               >
                 Povratak na Ponude
               </button>
             </div>
           </div>
         </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
