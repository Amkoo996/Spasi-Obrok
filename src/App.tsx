import { useState, useEffect } from 'react';
import { Store, User, Utensils, Ticket } from 'lucide-react';
import { Offer, Order, OrderStatus, UserProfile } from './types';
import CustomerFeed from './components/CustomerFeed';
import PartnerPanel from './components/PartnerPanel';
import AdminPanel from './components/AdminPanel';
import MyOrders from './components/MyOrders';
import Terms from './components/Terms';
import { auth, db, loginWithGoogle } from './firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, increment, getDoc, runTransaction } from 'firebase/firestore';

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
  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [orderCounter, setOrderCounter] = useState(1);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Initialize Firebase Auth & Load Profile
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        try {
          const userRef = doc(db, 'users', u.uid);
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
             const isAdmin = u.email === 'reddemption19@gmail.com';
             const newUser: UserProfile = { uid: u.uid, email: u.email || '', role: isAdmin ? 'admin' : 'customer', points: 0 };
             await setDoc(userRef, newUser);
             setUserProfile(newUser);
          } else {
             const data = userDoc.data() as UserProfile;
             // Auto-upgrade for testing
             if (u.email === 'reddemption19@gmail.com' && data.role === 'customer') {
               data.role = 'admin';
               await updateDoc(userRef, { role: 'admin' });
             }
             setUserProfile(data);
          }
        } catch (e: any) {
          if (e?.message?.includes('offline')) {
            console.warn("Skipping profile fetch. User offline or Firestore not ready.");
            setUserProfile({ uid: u.uid, email: u.email || '', role: 'customer', points: 0 }); // optimistic fallback
          } else {
            console.warn("Warning loading profile:", e.message);
          }
        }
      } else {
        setUserProfile(null);
      }
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Listen to Firestore
  useEffect(() => {
    if (loading) return;
    
    // Seed initial offers if empty (mocking for dev scale)
    const seedInitial = async () => {
      try {
        const snap = await getDoc(doc(db, 'system', 'seeded'));
        if (!snap.exists()) {
          for (const offer of INITIAL_OFFERS) {
            await setDoc(doc(db, 'offers', offer.id), { ...offer, partnerId: 'admin', reservedCount: 0, pickedUpCount: 0, createdAt: new Date().toISOString() });
          }
          await setDoc(doc(db, 'system', 'meta'), { lastOrderId: 0 });
          await setDoc(doc(db, 'system', 'seeded'), { done: true });
        }
      } catch (e: any) {
        if (e?.message?.includes('offline')) {
          console.warn("Firestore is offline or not yet initialized in the Firebase Console. Seeding skipped.");
        } else {
          console.error("Failed to seed initial data:", e);
        }
      }
    };
    seedInitial();

    let unsubOffers = () => {};
    let unsubOrders = () => {};

    try {
      unsubOffers = onSnapshot(collection(db, 'offers'), (snap) => {
        const loaded: Offer[] = [];
        snap.forEach(d => loaded.push({ id: d.id, ...d.data() } as Offer));
        setOffers(loaded);
      }, (err) => {
        console.warn("Failed to subscribe to offers:", err.message);
      });

      if (user) {
        unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
          const loaded: Order[] = [];
          snap.forEach(d => loaded.push({ id: d.id, ...d.data() } as Order));
          // Sort by latest
          loaded.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(loaded);
        }, (err) => {
           console.warn("Failed to subscribe to orders:", err.message);
        });
      } else {
        setOrders([]);
      }
    } catch(e) {
      console.warn("Firestore listener init failed:", e);
    }

    return () => {
      unsubOffers();
      unsubOrders();
    };
  }, [loading, user]);

  // Setup basic router listener
  useEffect(() => {
    const onLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0,0);
  };

  const handleReserve = async (offerId: string) => {
    // Check locally first, then commit to firestore
    const offer = offers.find(o => o.id === offerId);
    if (!offer || offer.quantity <= 0) return null;

    if (!user) {
      await loginWithGoogle();
      if (!auth.currentUser) return null;
    }

    const myPhone = localStorage.getItem('userPhone') || 'Nepoznato';

    const myActiveOrders = orders.filter(o => o.userId === auth.currentUser?.uid && o.status === 'reserved');
    if (myActiveOrders.length >= 2) {
      alert("Ne možete imati više od 2 aktivne rezervacije istovremeno.");
      return null;
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const myRecentNoShows = orders.filter(o => o.userId === auth.currentUser?.uid && o.status === 'no_show' && o.createdAt > twentyFourHoursAgo);
    
    if (myRecentNoShows.length >= 2) {
      alert("Vaš račun je privremeno blokiran (24h) zbog previše nepreuzetih narudžbi.");
      return null;
    }

    try {
      let orderCode = '';
      
      await runTransaction(db, async (t) => {
        // READS MUST HAPPEN FIRST
        const metaRef = doc(db, 'system', 'meta');
        const offerRef = doc(db, 'offers', offerId);
        
        const metaDoc = await t.get(metaRef);
        const offerDoc = await t.get(offerRef);
        
        let nextId = 1;
        if (metaDoc.exists()) {
          nextId = (metaDoc.data().lastOrderId || 0) + 1;
        }
        
        const offerData = offerDoc.data();
        const currentQty = offerData?.quantity || 0;
        if (currentQty <= 0) throw new Error("SOLD_OUT");

        // Time check (Expiring)
        if (offerData?.pickupEnd) {
          const now = new Date();
          const [hours, minutes] = offerData.pickupEnd.split(':').map(Number);
          const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
          if (now.getTime() > target.getTime()) {
             throw new Error("EXPIRED");
          }
        }

        // NOW ALL WRITES
        orderCode = `SA-${nextId.toString().padStart(4, '0')}`;
        
        t.set(metaRef, { lastOrderId: nextId }, { merge: true });

        t.update(offerRef, {
          quantity: increment(-1),
          reservedCount: increment(1)
        });

        const newOrderRef = doc(db, 'orders', orderCode);
        t.set(newOrderRef, {
          id: orderCode,
          offerId: offerId,
          offerTitle: offer.title,
          status: 'reserved',
          createdAt: new Date().toISOString(),
          userPhone: myPhone,
          userId: auth.currentUser?.uid,
          partnerId: offer.partnerId || 'admin'
        });
      });

      // return local copy to show visually right away
      return {
        id: orderCode,
        offerId: offerId,
        offerTitle: offer.title,
        status: 'reserved',
        createdAt: new Date().toISOString(),
        userPhone: myPhone,
        userId: auth.currentUser.uid,
        partnerId: offer.partnerId || 'admin'
      } as Order;

    } catch (e: any) {
      if (e.message === 'EXPIRED') {
         alert("Ova ponuda je nažalost istekla za danas.");
      } else if (e.message === 'SOLD_OUT') {
         alert("Nažalost, neko je bio brži! Paket je rezervisan.");
      } else {
         console.error("Reserve error:", e);
         alert("Došlo je do greške. Molimo pokušajte ponovo.");
      }
      return null;
    }
  };

  const handleCreateOffer = async (newOffer: Omit<Offer, 'id' | 'distance'>) => {
    const freshId = `o-${Date.now()}`;
    await setDoc(doc(db, 'offers', freshId), {
      ...newOffer,
      partnerId: auth.currentUser?.uid || 'admin',
      reservedCount: 0,
      pickedUpCount: 0,
      createdAt: new Date().toISOString()
    });
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    try {
      if (status === 'picked_up') {
        await updateDoc(doc(db, 'orders', orderId), {
           status,
           pickedUpAt: new Date().toISOString()
        });
        await updateDoc(doc(db, 'offers', order.offerId), {
           pickedUpCount: increment(1)
        });
        // Loyalty points
        if (order.userId) {
          await updateDoc(doc(db, 'users', order.userId), {
            points: increment(1)
          });
        }
      } else if (status === 'no_show') {
         await updateDoc(doc(db, 'orders', orderId), {
           status
        });
        await updateDoc(doc(db, 'offers', order.offerId), {
           quantity: increment(1)
        });
      }
    } catch(e) {
      console.error("Status error:", e);
      alert("Neuspješno ažuriranje. Uvjerite se da ste povezani.");
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#2d312a] flex flex-col font-sans sm:mb-0 mb-16 pb-safe antialiased">
      <header className="bg-white border-b border-[#eceae0] sticky top-0 z-30 shrink-0 px-4 sm:px-8 py-3 sm:py-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-3 cursor-pointer justify-center sm:justify-start w-full sm:w-auto" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-[#4f6d44] rounded-xl flex items-center justify-center text-white text-xl shadow-sm shrink-0">🍱</div>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-xl font-black tracking-tight text-[#1a1c18] leading-none mb-1 sm:mb-0">Spasi<span className="text-[#4f6d44]">Obrok</span></h1>
              <p className="text-[11px] text-[#6b7264] flex items-center gap-1 font-bold tracking-wide uppercase mt-0 sm:mt-0.5">
                <svg className="w-3 h-3 text-[#4f6d44]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Sarajevo, BiH
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-semibold">
             <button onClick={() => navigate('/')} className={`${currentPath === '/' ? 'text-[#4f6d44] border-b-2 border-[#4f6d44] pb-1' : 'text-[#6b7264] hover:text-[#1a1c18]'}`}>Deals</button>
             {user ? (
               <>
                 {userProfile && (
                    <div className="flex items-center gap-1.5 bg-[#fef3c7] text-[#b45309] px-3 py-1.5 rounded-full text-xs font-bold border border-[#fef3c7]/50 shadow-sm cursor-help" title="Svaki preuzet paket nosi bod. Sakupi 5 bodova!">
                       ⭐ {userProfile.points} <span className="hidden lg:inline">Bodova</span>
                    </div>
                 )}
                 <button onClick={() => navigate('/my-orders')} className={`${currentPath === '/my-orders' ? 'text-[#4f6d44] border-b-2 border-[#4f6d44] pb-1' : 'text-[#6b7264] hover:text-[#1a1c18]'}`}>Moje Rezervacije</button>
                 <button onClick={() => navigate('/partner')} className={`${currentPath === '/partner' ? 'text-[#4f6d44] border-b-2 border-[#4f6d44] pb-1' : 'text-[#6b7264] hover:text-[#1a1c18]'}`}>Partner Panel</button>
                 {userProfile?.role === 'admin' && (
                   <button onClick={() => navigate('/admin')} className={`${currentPath === '/admin' ? 'text-[#4f6d44] border-b-2 border-[#4f6d44] pb-1' : 'text-[#6b7264] hover:text-[#1a1c18]'}`}>Admin</button>
                 )}
                 <button onClick={() => auth.signOut()} className="text-red-500 hover:text-red-700">Odjavi se</button>
               </>
             ) : (
               <button onClick={loginWithGoogle} className="bg-[#4f6d44] text-white px-5 py-2 rounded-full hover:bg-[#3d5434] transition-colors">Prijavi se</button>
             )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 overflow-x-hidden">
        {currentPath === '/partner' ? (
          (user && userProfile?.role === 'partner') || (user && userProfile?.role === 'admin') ? (
            <PartnerPanel 
              offers={offers.filter(o => userProfile.role === 'admin' || o.partnerId === user.uid)} 
              orders={userProfile.role === 'admin' ? orders : orders.filter(o => o.partnerId === user.uid)} 
              onCreateOffer={handleCreateOffer}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          ) : (
             <div className="bg-white p-8 rounded-[32px] border border-[#eceae0] shadow-sm max-w-sm mx-auto mt-20 text-center">
               <h2 className="text-xl font-bold mb-2">Partner Pristup</h2>
               <p className="text-sm text-[#6b7264] mb-6">Pristup rezervisan za restorane. Ako mislite da je greška, kontaktirajte podršku.</p>
               {!user ? (
                 <button 
                   onClick={loginWithGoogle}
                   className="w-full bg-[#4f6d44] text-white font-bold py-4 rounded-2xl shadow-sm hover:bg-[#3d5434] transition-colors"
                 >
                   Prijavi se sa Google nalogom
                 </button>
               ) : (
                 <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-bold border border-red-200">
                    Nemate pristup ovom panelu. (Role: {userProfile?.role || 'customer'})
                 </div>
               )}
             </div>
          )
        ) : currentPath === '/admin' ? (
          userProfile?.role === 'admin' ? (
             <AdminPanel orders={orders} offers={offers} users={[]} />
          ) : (
            <div className="text-center py-20 text-red-600 font-bold">Pristup Odbijen</div>
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
