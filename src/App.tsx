import { useState, useEffect } from 'react';
import { Store, User, Utensils, Ticket } from 'lucide-react';
import { Offer, Order, OrderStatus } from './types';
import CustomerFeed from './components/CustomerFeed';
import PartnerPanel from './components/PartnerPanel';
import MyOrders from './components/MyOrders';
import Terms from './components/Terms';

const INITIAL_OFFERS: Offer[] = [
  {
    id: 'o-1',
    title: 'Pekara "Zlatno Zrno" - Dnevni Mix',
    price: 4,
    valueEstimate: 12,
    location: 'Grbavica, Sarajevo',
    distance: 0.8,
    quantity: 2,
    pickupEnd: '20:00',
    noPork: true,
    vegan: false,
    category: 'bakery'
  },
  {
    id: 'o-2',
    title: 'Vegan Užina - Zdrava Zdjelica',
    price: 6,
    valueEstimate: 16,
    location: 'Ferhadija, Sarajevo',
    distance: 1.2,
    quantity: 1,
    pickupEnd: '18:30',
    noPork: true,
    vegan: true,
    category: 'restaurant'
  },
  {
    id: 'o-3',
    title: 'Slastičarna "Kutak" - Kolači i Torte',
    price: 5,
    valueEstimate: 15,
    location: 'Baščaršija, Sarajevo',
    distance: 2.1,
    quantity: 4,
    pickupEnd: '21:30',
    noPork: true,
    vegan: false,
    category: 'bakery'
  },
  {
    id: 'o-4',
    title: 'Market "Voćar" - Pakovanje voća',
    price: 3,
    valueEstimate: 10,
    location: 'Čengić Vila, Sarajevo',
    distance: 3.5,
    quantity: 0,
    pickupEnd: '19:00',
    noPork: true,
    vegan: true,
    category: 'grocery'
  },
  {
    id: 'o-5',
    title: 'Fast Food "Burger Bar" - Mix',
    price: 7,
    valueEstimate: 18,
    location: 'Marijin Dvor, Sarajevo',
    distance: 1.5,
    quantity: 2,
    pickupEnd: '22:00',
    noPork: false,
    vegan: false,
    category: 'fast_food'
  },
  {
    id: 'o-6',
    title: 'Pekara "Edin" - Peciva i Hljeb',
    price: 3,
    valueEstimate: 9,
    location: 'Dobrinja, Sarajevo',
    distance: 5.2,
    quantity: 3,
    pickupEnd: '20:30',
    noPork: true,
    vegan: false,
    category: 'bakery'
  },
  {
    id: 'o-7',
    title: 'Wok "Asia" - Nudle Mix',
    price: 5,
    valueEstimate: 14,
    location: 'Novo Sarajevo',
    distance: 2.8,
    quantity: 1,
    pickupEnd: '21:00',
    noPork: true,
    vegan: false,
    category: 'restaurant'
  },
  {
    id: 'o-8',
    title: 'Pizzeria "Napoli" - Ostaci Pizze',
    price: 4,
    valueEstimate: 12,
    location: 'Ilidža, Sarajevo',
    distance: 8.0,
    quantity: 2,
    pickupEnd: '23:00',
    noPork: false,
    vegan: false,
    category: 'fast_food'
  },
  {
    id: 'o-9',
    title: 'Sendvič Bar - Dnevni Sendviči',
    price: 3,
    valueEstimate: 8,
    location: 'Pofalići, Sarajevo',
    distance: 2.0,
    quantity: 0,
    pickupEnd: '17:00',
    noPork: false,
    vegan: false,
    category: 'fast_food'
  },
  {
    id: 'o-10',
    title: 'Bistro "Zdravlje" - Salate i Sokovi',
    price: 5,
    valueEstimate: 14,
    location: 'Centar, Sarajevo',
    distance: 1.0,
    quantity: 5,
    pickupEnd: '19:30',
    noPork: true,
    vegan: true,
    category: 'restaurant'
  }
];

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  const [offers, setOffers] = useState<Offer[]>(() => {
    const saved = localStorage.getItem('offers');
    return saved ? JSON.parse(saved) : INITIAL_OFFERS;
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [orderCounter, setOrderCounter] = useState(() => {
    const saved = localStorage.getItem('orderCounter');
    return saved ? Number(saved) : 1;
  });

  const [partnerAccess, setPartnerAccess] = useState(localStorage.getItem('isPartner') === 'true');
  const [partnerPinInput, setPartnerPinInput] = useState('');

  // Setup basic router listener
  useEffect(() => {
    const onLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('offers', JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('orderCounter', orderCounter.toString());
  }, [orderCounter]);

  const handleReserve = (offerId: string) => {
    const offerIndex = offers.findIndex(o => o.id === offerId);
    if (offerIndex === -1 || offers[offerIndex].quantity <= 0) return null;

    const myPhone = localStorage.getItem('userPhone');
    if (!myPhone) {
      alert("Greška sistema: Nije pronađen Vaš broj. Molimo osvježite stranicu i potvrdite broj telefona ponovo.");
      return null;
    }

    // RULE 1: Max 2 Active Reservations
    const myActiveOrders = orders.filter(o => o.userPhone === myPhone && o.status === 'reserved');
    if (myActiveOrders.length >= 2) {
      alert("Ne možete imati više od 2 aktivne rezervacije istovremeno.");
      return null;
    }

    // RULE 2: No-show Penalties (2 no-shows in 24h = blocked)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const myRecentNoShows = orders.filter(o => o.userPhone === myPhone && o.status === 'no_show' && o.createdAt > twentyFourHoursAgo);
    
    if (myRecentNoShows.length >= 2) {
      alert("Vaš račun je privremeno blokiran (24h) zbog previše nepreuzetih narudžbi.");
      return null;
    }

    const code = `SA-${orderCounter.toString().padStart(4, '0')}`;
    setOrderCounter(c => c + 1);

    const newOrder: Order = {
      id: code,
      offerId: offerId,
      offerTitle: offers[offerIndex].title,
      status: 'reserved',
      createdAt: new Date().toISOString(),
      userPhone: myPhone
    };

    setOrders(prev => [newOrder, ...prev]);
    
    setOffers(prev => {
      const copy = [...prev];
      copy[offerIndex] = { 
        ...copy[offerIndex], 
        quantity: copy[offerIndex].quantity - 1,
        reservedCount: (copy[offerIndex].reservedCount || 0) + 1 
      };
      return copy;
    });

    return newOrder;
  };

  const handleCreateOffer = (newOffer: Omit<Offer, 'id' | 'distance'>) => {
    const offer: Offer = {
      ...newOffer,
      id: `o-${Date.now()}`,
      distance: Number((Math.random() * 3 + 0.1).toFixed(1)) // random distance for mock
    };
    setOffers(prev => [offer, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId && o.status !== status) {
        
        // Handle Offer side-effects
        if (status === 'picked_up') {
          setOffers(offPrev => offPrev.map(offer => 
            offer.id === o.offerId ? { ...offer, pickedUpCount: (offer.pickedUpCount || 0) + 1 } : offer
          ));
        } else if (status === 'no_show') {
          // Restore Quantity
          setOffers(offPrev => offPrev.map(offer => 
            offer.id === o.offerId ? { ...offer, quantity: offer.quantity + 1 } : offer
          ));
        }

        return { 
          ...o, 
          status, 
          ...(status === 'picked_up' ? { pickedUpAt: new Date().toISOString() } : {})
        };
      }
      return o;
    }));
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#2d312a] flex flex-col font-sans sm:mb-0 mb-16 pb-safe antialiased">
      <header className="bg-white border-b border-[#eceae0] sticky top-0 z-30 shrink-0 px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-[#4f6d44] rounded-xl flex items-center justify-center text-white text-xl">🍱</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#22c55e]">SpasiObrok</h1>
              <p className="text-[11px] text-[#6b7264] flex items-center gap-1 font-bold tracking-wide uppercase">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Sarajevo, BiH
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-semibold">
             <button onClick={() => navigate('/')} className={`${currentPath === '/' ? 'text-[#4f6d44] border-b-2 border-[#4f6d44] pb-1' : 'text-[#6b7264] hover:text-[#1a1c18]'}`}>Deals</button>
             <button onClick={() => navigate('/my-orders')} className={`${currentPath === '/my-orders' ? 'text-[#4f6d44] border-b-2 border-[#4f6d44] pb-1' : 'text-[#6b7264] hover:text-[#1a1c18]'}`}>Moje Rezervacije</button>
             <button onClick={() => navigate('/partner')} className={`${currentPath === '/partner' ? 'text-[#4f6d44] border-b-2 border-[#4f6d44] pb-1' : 'text-[#6b7264] hover:text-[#1a1c18]'}`}>Partner Panel</button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 overflow-x-hidden">
        {currentPath === '/partner' ? (
          partnerAccess ? (
            <PartnerPanel 
              offers={offers} 
              orders={orders} 
              onCreateOffer={handleCreateOffer}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          ) : (
             <div className="bg-white p-8 rounded-[32px] border border-[#eceae0] shadow-sm max-w-sm mx-auto mt-20 text-center">
               <h2 className="text-xl font-bold mb-2">Partner Pristup</h2>
               <p className="text-sm text-[#6b7264] mb-6">Pristup rezervisan za restorane.</p>
               <input 
                 type="password" 
                 placeholder="Unesi PIN (1234)" 
                 value={partnerPinInput}
                 onChange={e => setPartnerPinInput(e.target.value)}
                 className="w-full bg-[#fbfaf7] border border-[#eceae0] rounded-xl px-4 py-3 mb-4 text-center text-3xl tracking-[1em] font-mono focus:outline-none focus:ring-2 focus:ring-[#4f6d44]"
               />
               <button 
                 onClick={() => {
                   if(partnerPinInput === '1234') {
                     localStorage.setItem('isPartner', 'true');
                     setPartnerAccess(true);
                   } else {
                     alert('Pogrešan PIN');
                   }
                 }}
                 className="w-full bg-[#4f6d44] text-white font-bold py-4 rounded-2xl shadow-sm hover:bg-[#3d5434] transition-colors"
               >
                 Prijavi se
               </button>
             </div>
          )
        ) : currentPath === '/my-orders' ? (
          <MyOrders orders={orders} offers={offers} />
        ) : currentPath === '/terms' ? (
          <Terms />
        ) : (
          <CustomerFeed offers={offers} onReserve={handleReserve} onNavigate={navigate} />
        )}
      </main>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#eceae0] z-40 pb-safe">
        <div className="max-w-md mx-auto flex">
          <button
            onClick={() => navigate('/')}
            className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors ${currentPath === '/' ? 'text-[#4f6d44]' : 'text-[#6b7264] hover:text-[#1a1c18]'}`}
          >
            <User size={20} className={currentPath === '/' ? 'fill-[#4f6d44]/10' : ''} strokeWidth={currentPath === '/' ? 2.5 : 2} />
            <span className="text-[10px] uppercase tracking-wide font-bold">Istraži</span>
          </button>
          <button
            onClick={() => navigate('/my-orders')}
            className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors ${currentPath === '/my-orders' ? 'text-[#4f6d44]' : 'text-[#6b7264] hover:text-[#1a1c18]'}`}
          >
            <Ticket size={20} className={currentPath === '/my-orders' ? 'fill-[#4f6d44]/10' : ''} strokeWidth={currentPath === '/my-orders' ? 2.5 : 2} />
            <span className="text-[10px] uppercase tracking-wide font-bold">Karte</span>
          </button>
          <button
            onClick={() => navigate('/partner')}
            className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors ${currentPath === '/partner' ? 'text-[#4f6d44]' : 'text-[#6b7264] hover:text-[#1a1c18]'}`}
          >
            <Store size={20} className={currentPath === '/partner' ? 'fill-[#4f6d44]/10' : ''} strokeWidth={currentPath === '/partner' ? 2.5 : 2} />
            <span className="text-[10px] uppercase tracking-wide font-bold">Partner</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
