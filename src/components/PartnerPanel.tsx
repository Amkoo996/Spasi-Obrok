import { useState, FormEvent } from 'react';
import { Offer, Order, OrderStatus } from '../types';
import { CheckCircle, Clock } from 'lucide-react';

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
      imageSeed: 'food' + Math.floor(Math.random() * 100),
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
          <div className="bg-white p-5 rounded-[32px] border border-[#eceae0] shadow-sm flex flex-col justify-center">
            <span className="text-xs font-bold text-[#6b7264] uppercase tracking-widest mb-1">Ukupan prihod</span>
            <span className="text-3xl font-black text-[#1a1c18]">{rawRevenue.toFixed(2)} KM</span>
            <div className="text-xs text-[#6b7264] mt-2 font-medium">
              {pickedUpOrders.length} uspješnih preuzimanja
            </div>
          </div>
          <div className="bg-[#4f6d44] text-white p-5 rounded-[32px] shadow-sm flex flex-col justify-center">
            <span className="text-xs font-bold text-white/80 uppercase tracking-widest mb-1">Vaša zarada</span>
            <span className="text-3xl font-black">{netEarnings.toFixed(2)} KM</span>
            <div className="text-[10px] text-white/80 mt-2 font-medium uppercase tracking-widest">
              Platforma (20%): -{platformFee.toFixed(2)} KM
            </div>
          </div>
          <div className="bg-[#fbfaf7] border border-[#eceae0] p-5 rounded-[32px] flex flex-col justify-center">
            <span className="text-xs font-bold text-[#6b7264] uppercase tracking-widest mb-1">Rezervacije</span>
            <span className="text-2xl font-black text-[#1a1c18]">{totalReservations}</span>
          </div>
          <div className="bg-[#fbfaf7] border border-[#eceae0] p-5 rounded-[32px] flex flex-col justify-center">
            <span className="text-xs font-bold text-[#6b7264] uppercase tracking-widest mb-1">Konverzija</span>
            <span className="text-2xl font-black text-[#1a1c18]">{conversionRate}%</span>
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

      {/* RESERVATIONS */}
      <section>
        <h2 className="font-bold text-xl text-[#1a1c18] mb-4 flex items-center justify-between">
          Active Orders
          <span className="bg-[#f0f4ef] text-[#4f6d44] text-sm px-3 py-1 rounded-full">{activeOrders.length}</span>
        </h2>
        {activeOrders.length === 0 ? (
          <div className="text-[#6b7264] py-8 text-center bg-white rounded-[32px] border border-dashed border-[#d1cfc0]">
            No active reservations yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeOrders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-[#eceae0] flex items-center justify-between">
                <div>
                  <div className="font-mono text-xl font-black tracking-widest text-[#4f6d44] mb-1">{order.id}</div>
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

    </div>
  );
}
