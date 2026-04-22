import { useState, FormEvent } from 'react';
import { Offer, Order, OrderStatus, OfferCategory } from '../types';
import { CheckCircle, Clock, QrCode, X } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  offers: Offer[];
  orders: Order[];
  onCreateOffer: (offer: Omit<Offer, 'id' | 'distance'>) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export default function PartnerPanel({ offers, orders, onCreateOffer, onUpdateOrderStatus }: Props) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('4');
  const [valueEstimate, setValueEstimate] = useState('12');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('5');
  const [pickupEnd, setPickupEnd] = useState('20:00');
  const [noPork, setNoPork] = useState(false);
  const [vegan, setVegan] = useState(false);
  const [category, setCategory] = useState<OfferCategory>('bakery');
  const [scanning, setScanning] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!title || !location) return;

    onCreateOffer({
      title,
      price: Number(price),
      valueEstimate: Number(valueEstimate),
      location,
      quantity: Number(quantity),
      pickupEnd,
      noPork,
      vegan,
      category
    });

    // Reset simple form
    setTitle('');
  };

  const activeOrders = orders.filter(o => o.status === 'reserved');
  const pastOrders = orders.filter(o => o.status !== 'reserved');
  const pickedUpOrders = orders.filter(o => o.status === 'picked_up');

  // Revenue Calculations
  const rawRevenue = pickedUpOrders.reduce((sum, order) => {
    const offer = offers.find(o => o.id === order.offerId);
    return sum + (offer ? offer.price : 0);
  }, 0);
  
  const platformFee = rawRevenue * 0.20; // 20% platform cut
  const netEarnings = rawRevenue - platformFee;

  const totalReservations = orders.length;
  const conversionRate = totalReservations > 0 ? ((pickedUpOrders.length / totalReservations) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-4 flex flex-col gap-8 pb-24">
      
      {/* OBRAČUN / REVENUE DASHBOARD */}
      <section>
        <h2 className="font-bold text-xl text-[#1a1c18] mb-4">Statistika i Obračun</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[32px] border border-[#eceae0] shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><CheckCircle size={64}/></div>
            <span className="text-[10px] font-bold text-[#6b7264] uppercase tracking-widest mb-1">Spasi Obrok Vam Je Donio</span>
            <span className="text-4xl font-black text-[#1a1c18]">{pickedUpOrders.length}</span>
            <div className="text-xs text-[#b45309] mt-1 font-bold">
              nova kupca preko SpasiObrok
            </div>
          </div>
          <div className="bg-[#4f6d44] text-white p-5 rounded-[32px] shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute bottom-0 right-0 p-2 opacity-10"><Clock size={80}/></div>
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1">Dodatna zarada</span>
            <span className="text-3xl font-black">+{netEarnings.toFixed(2)} KM</span>
            <div className="text-[10px] text-white/80 mt-2 font-medium">
              koje biste inače bacili (nakon provizije)
            </div>
          </div>
          <div className="bg-[#fbfaf7] border border-[#eceae0] p-5 rounded-[32px] flex flex-col justify-center">
            <span className="text-xs font-bold text-[#6b7264] uppercase tracking-widest mb-1">Rezervacije</span>
            <span className="text-2xl font-black text-[#1a1c18]">{totalReservations}</span>
          </div>
          {totalReservations > 0 && (
            <div className="bg-[#fbfaf7] border border-[#eceae0] p-5 rounded-[32px] flex flex-col justify-center">
              <span className="text-xs font-bold text-[#6b7264] uppercase tracking-widest mb-1">Konverzija</span>
              <span className="text-2xl font-black text-[#1a1c18]">{conversionRate}%</span>
            </div>
          )}
          <div className="col-span-2 sm:col-span-1 md:col-span-2 bg-[#fef3c7]/40 border border-[#fef3c7] rounded-[24px] p-5 text-center mt-1">
             <p className="text-[#b45309] font-bold text-sm tracking-wide">❤️ SpasiObrok vam je pomogao da prodate hranu koja bi bila bačena.</p>
          </div>
        </div>
      </section>

      {/* ADD OFFER FORM */}
      <section>
        <h2 className="font-bold text-xl text-[#1a1c18] mb-4">Create Offer</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[32px] border border-[#eceae0] shadow-sm flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-[#6b7264] uppercase tracking-wider mb-1">Offer Name</label>
            <input 
              type="text" required 
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Bakery Surprise Box" 
              className="w-full bg-[#fbfaf7] border border-[#eceae0] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4f6d44] text-[#1a1c18]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#6b7264] uppercase tracking-wider mb-1">Kategorija</label>
            <select 
              value={category} onChange={e => setCategory(e.target.value as OfferCategory)}
              className="w-full bg-[#fbfaf7] border border-[#eceae0] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4f6d44] text-[#1a1c18] font-medium"
            >
              <option value="bakery">Pekara</option>
              <option value="fast_food">Fast Food</option>
              <option value="grocery">Market / Voćarna</option>
              <option value="restaurant">Restoran / Bistro</option>
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-[#6b7264] uppercase tracking-wider mb-1">Price (KM)</label>
              <input 
                type="number" required 
                value={price} onChange={e => setPrice(e.target.value)}
                className="w-full bg-[#fbfaf7] border border-[#eceae0] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4f6d44] text-[#1a1c18]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-[#6b7264] uppercase tracking-wider mb-1">Value (KM)</label>
              <input 
                type="number" required 
                value={valueEstimate} onChange={e => setValueEstimate(e.target.value)}
                className="w-full bg-[#fbfaf7] border border-[#eceae0] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4f6d44] text-[#1a1c18]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#6b7264] uppercase tracking-wider mb-1">Location / Store name</label>
            <input 
              type="text" required 
              value={location} onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Grbavica" 
              className="w-full bg-[#fbfaf7] border border-[#eceae0] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4f6d44] text-[#1a1c18]"
            />
          </div>
          <div className="flex gap-4">
             <div className="flex-1">
              <label className="block text-xs font-bold text-[#6b7264] uppercase tracking-wider mb-1">Quantity</label>
              <input 
                type="number" required min="1"
                value={quantity} onChange={e => setQuantity(e.target.value)}
                className="w-full bg-[#fbfaf7] border border-[#eceae0] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4f6d44] text-[#1a1c18]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-[#6b7264] uppercase tracking-wider mb-1">Pickup until</label>
              <input 
                type="time" required 
                value={pickupEnd} onChange={e => setPickupEnd(e.target.value)}
                className="w-full bg-[#fbfaf7] border border-[#eceae0] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4f6d44] text-[#1a1c18]"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="hidden" checked={noPork} onChange={e => setNoPork(e.target.checked)} />
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${noPork ? 'border-[#4f6d44] bg-[#f0f4ef]' : 'border-[#d1cfc0]'}`}>
                {noPork && <div className="w-2.5 h-2.5 bg-[#4f6d44] rounded-sm"></div>}
              </div>
              <span className="text-sm font-medium text-[#2d312a]">No Pork</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="hidden" checked={vegan} onChange={e => setVegan(e.target.checked)} />
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${vegan ? 'border-[#4f6d44] bg-[#f0f4ef]' : 'border-[#d1cfc0]'}`}>
                {vegan && <div className="w-2.5 h-2.5 bg-[#4f6d44] rounded-sm"></div>}
              </div>
              <span className="text-sm font-medium text-[#2d312a]">Vegan</span>
            </label>
          </div>

          <button type="submit" className="mt-4 w-full bg-[#4f6d44] text-white font-bold py-3 rounded-2xl shadow-sm transition-colors hover:bg-[#3d5434] active:scale-95">
            Publish Offer
          </button>
        </form>
      </section>

      {/* MY OFFERS */}
      <section>
        <h2 className="font-bold text-xl text-[#1a1c18] mb-4">Moje Ponude</h2>
        {offers.length === 0 ? (
          <div className="text-[#6b7264] py-8 text-center bg-white rounded-[32px] border border-dashed border-[#d1cfc0]">
            Trenutno nemate aktivnih ponuda.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {offers.map(offer => {
              let isExpired = false;
              if (offer.pickupEnd) {
                const now = new Date();
                const [hours, minutes] = offer.pickupEnd.split(':').map(Number);
                const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
                isExpired = now.getTime() > target.getTime();
              }
              const isSoldOut = offer.quantity <= 0;
              const isActive = !isExpired && !isSoldOut;

              return (
                <div key={offer.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-[#eceae0] flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#1a1c18]">{offer.title}</h3>
                    <div className="flex gap-2 text-xs mt-1">
                      <span className="text-[#6b7264]">Količina: {offer.quantity}</span>
                      <span className="text-[#6b7264]">Ističe: {offer.pickupEnd}</span>
                    </div>
                  </div>
                  <div>
                     {isActive ? (
                       <span className="bg-[#f0f4ef] text-[#4f6d44] text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full border border-[#4f6d44]/20">Aktivno</span>
                     ) : (
                       <span className="bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full border border-red-200">Neaktivno</span>
                     )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* RESERVATIONS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl text-[#1a1c18] flex items-center gap-2">
            Active Orders
            <span className="bg-[#f0f4ef] text-[#4f6d44] text-sm px-3 py-1 rounded-full">{activeOrders.length}</span>
          </h2>
          <button 
            onClick={() => setScanning(true)}
            className="flex items-center gap-2 bg-[#fbfaf7] border border-[#eceae0] text-[#1a1c18] font-bold text-sm px-4 py-2 rounded-xl shadow-sm hover:bg-[#f0f4ef] transition-colors"
          >
            <QrCode size={18}/> Skeniraj
          </button>
        </div>
        {activeOrders.length === 0 ? (
          <div className="text-[#6b7264] py-8 text-center bg-white rounded-[32px] border border-dashed border-[#d1cfc0]">
            No active reservations yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeOrders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-[#eceae0] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-mono text-xl font-black tracking-widest text-[#4f6d44]">{order.id}</div>
                    <span className="bg-[#fef3c7] text-[#b45309] text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded shadow-sm">Reserved</span>
                  </div>
                  <div className="text-sm font-medium text-[#1a1c18]">{order.offerTitle}</div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onUpdateOrderStatus(order.id, 'no_show')}
                    className="bg-white border border-[#eceae0] text-[#6b7264] px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors active:scale-95"
                  >
                    No Show
                  </button>
                  <button 
                    onClick={() => onUpdateOrderStatus(order.id, 'picked_up')}
                    className="bg-[#4f6d44] text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-sm hover:bg-[#3d5434] transition-colors active:scale-95"
                  >
                    PREUZETO
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PAST ORDERS */}
      {pastOrders.length > 0 && (
         <section>
         <h2 className="font-bold text-lg text-[#6b7264] mb-4">Past Orders</h2>
         <div className="flex flex-col gap-3">
             {pastOrders.map(order => (
               <div key={order.id} className="p-4 rounded-[24px] flex items-center justify-between bg-[#fbfaf7] border border-[#eceae0] text-[#6b7264]">
                 <div>
                   <span className="font-mono font-bold tracking-widest text-[#1a1c18]">{order.id}</span>
                   <span className="text-xs ml-3 font-medium text-[#6b7264]">{order.offerTitle}</span>
                 </div>
                 <div className="flex items-center gap-1.5 text-sm font-medium">
                   {order.status === 'picked_up' ? (
                     <div className="flex flex-col items-end">
                       <span className="flex items-center gap-1 text-[#4f6d44]"><CheckCircle size={16}/> Preuzeto</span>
                       {order.pickedUpAt && <span className="text-[10px] opacity-60 font-normal">at {new Date(order.pickedUpAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                     </div>
                   ) : (
                     <span className="text-[#b45309] border border-[#fef3c7] bg-[#fef3c7]/30 px-2 py-1 rounded text-xs font-bold uppercase">Nije se pojavio</span>
                   )}
                 </div>
               </div>
             ))}
           </div>
       </section>
      )}

      <AnimatePresence>
        {scanning && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-4"
          >
            <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl">
              <div className="p-4 flex items-center justify-between border-b border-[#eceae0]">
                <h3 className="font-bold text-[#1a1c18] text-lg">Skeniraj rezervaciju</h3>
                <button onClick={() => setScanning(false)} className="p-2 bg-[#fbfaf7] rounded-full hover:bg-[#eceae0] text-[#1a1c18] transition-colors"><X size={20}/></button>
              </div>
              <div className="aspect-square bg-black">
                <Scanner 
                  onScan={(detectedCodes) => {
                    const code = detectedCodes[0]?.rawValue;
                    if (code) {
                      setScanning(false);
                      const exists = activeOrders.some(o => o.id === code);
                      if (exists) {
                        if (window.confirm(`Pronađena narudžba: ${code}.\nOznačite kao preuzeto?`)) {
                          onUpdateOrderStatus(code, 'picked_up');
                        }
                      } else {
                        alert(`Kod ${code} nije aktivan ili je već obrađen.`);
                      }
                    }
                  }}
                  formats={['qr_code']}
                />
              </div>
              <div className="p-6 text-center">
                <p className="text-sm font-medium text-[#6b7264]">Usmjerite kameru prema QR kodu na uređaju kupca.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
