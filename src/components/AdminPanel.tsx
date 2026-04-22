import { Offer, Order } from '../types';

interface Props {
  offers: Offer[];
  orders: Order[];
  users: any[];
}

export default function AdminPanel({ offers, orders, users }: Props) {
  const totalRevenue = offers.reduce((sum, offer) => sum + (offer.pickedUpCount || 0) * offer.price, 0);
  const platformFee = totalRevenue * 0.20;

  return (
    <div className="p-4 flex flex-col gap-6">
      <h2 className="text-2xl font-black text-[#1a1c18]">Global Admin Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#eceae0] p-6 rounded-[32px] shadow-sm">
           <h3 className="text-xs font-bold text-[#6b7264] uppercase tracking-wider mb-2">Total Orders</h3>
           <p className="text-4xl font-black text-[#1a1c18]">{orders.length}</p>
        </div>
        <div className="bg-white border border-[#eceae0] p-6 rounded-[32px] shadow-sm">
           <h3 className="text-xs font-bold text-[#6b7264] uppercase tracking-wider mb-2">Platform Earnings (20%)</h3>
           <p className="text-4xl font-black text-[#4f6d44]">{platformFee.toFixed(2)} KM</p>
           <p className="text-xs text-[#6b7264] mt-1">From {totalRevenue.toFixed(2)} KM total volume</p>
        </div>
        <div className="bg-white border border-[#eceae0] p-6 rounded-[32px] shadow-sm">
           <h3 className="text-xs font-bold text-[#6b7264] uppercase tracking-wider mb-2">Active Offers</h3>
           <p className="text-4xl font-black text-[#1a1c18]">{offers.filter(o => o.quantity > 0).length}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-[#eceae0] shadow-sm">
         <h3 className="font-bold text-lg mb-4">Latest Platform Activity</h3>
         <div className="flex flex-col gap-2">
           {orders.slice(0, 10).map(order => (
             <div key={order.id} className="flex justify-between items-center py-2 border-b border-[#eceae0] last:border-0">
               <div>
                  <span className="font-mono text-sm font-bold">{order.id}</span>
                  <span className="text-sm ml-2">{order.offerTitle}</span>
               </div>
               <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                 order.status === 'reserved' ? 'bg-[#fef3c7] text-[#b45309]' :
                 order.status === 'picked_up' ? 'bg-[#f0f4ef] text-[#4f6d44]' : 'bg-red-50 text-red-700'
               }`}>
                 {order.status}
               </span>
             </div>
           ))}
         </div>
      </div>
    </div>
  )
}
