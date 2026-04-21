import { useState } from 'react';
import { Order, Offer } from '../types';
import { X, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  orders: Order[];
  offers: Offer[];
}

export default function MyOrders({ orders, offers }: Props) {
  const myPhone = localStorage.getItem('userPhone');
  const myOrders = orders.filter(o => o.userPhone === myPhone);
  const [fullscreenCode, setFullscreenCode] = useState<string | null>(null);

  if (!myPhone || myOrders.length === 0) {
     return (
       <div className="text-center py-20 px-4">
         <div className="w-20 h-20 bg-[#f0f4ef] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🛒</div>
         <h2 className="text-2xl font-bold mb-2 text-[#1a1c18]">Nemate rezervacija</h2>
         <p className="text-[#6b7264] max-w-sm mx-auto">Vaše aktivne i prošle rezervacije će se prikazati ovdje nakon što nešto rezervišete.</p>
       </div>
     );
  }

  return (
    <div className="pb-20 max-w-lg mx-auto w-full">
      <h2 className="text-2xl font-bold mb-6 text-[#1a1c18]">Moje rezervacije</h2>
      <div className="flex flex-col gap-4">
        {myOrders.map(order => {
          const offer = offers.find(o => o.id === order.offerId);
          return (
            <div key={order.id} className="bg-white p-5 rounded-[24px] border border-[#eceae0] shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="font-mono text-2xl font-black text-[#4f6d44] tracking-widest">{order.id}</div>
                {order.status === 'reserved' && <span className="bg-[#fef3c7] text-[#b45309] text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg shadow-sm">Aktivno</span>}
                {order.status === 'picked_up' && <span className="bg-[#f0f4ef] text-[#4f6d44] text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg shadow-sm">Preuzeto</span>}
                {order.status === 'no_show' && <span className="bg-red-50 text-red-600 text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg shadow-sm">Nije preuzeto</span>}
              </div>
              <h3 className="font-bold text-lg text-[#1a1c18] leading-tight mb-2">{order.offerTitle}</h3>
              {offer && (
                <div className="text-sm text-[#6b7264] space-y-1 mb-4">
                  <div className="flex items-center gap-1.5"><MapPin size={14}/> {offer.location}</div>
                  <div className="flex items-center gap-1.5"><Clock size={14}/> Preuzimanje do {offer.pickupEnd}</div>
                </div>
              )}
              {order.status === 'reserved' && (
                <button 
                  onClick={() => setFullscreenCode(order.id)}
                  className="w-full bg-[#fbfaf7] border-2 border-[#4f6d44] text-[#4f6d44] hover:bg-[#4f6d44] hover:text-white transition-colors font-bold py-3 rounded-xl text-sm shadow-sm"
                >
                  Prikaži Kod za Kasu
                </button>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {fullscreenCode && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center"
          >
            <button onClick={() => setFullscreenCode(null)} className="absolute top-6 right-6 p-3 bg-[#fbfaf7] rounded-full shadow-sm text-[#1a1c18]">
              <X size={24} />
            </button>
            <p className="text-[#b45309] font-bold uppercase tracking-widest mb-4 bg-[#fef3c7] px-4 py-2 rounded-full text-sm">Pokaži ekran radniku na kasi</p>
            <div className="text-7xl sm:text-8xl font-black text-[#4f6d44] tracking-widest break-all">
              {fullscreenCode}
            </div>
            <p className="text-[#6b7264] font-medium mt-8 max-w-xs text-sm">
              Skeniranjem ili upisom ovog koda radnik će potvrditi vašu narudžbu i predati vam paket. Plaćanje vršite direktno njima.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
