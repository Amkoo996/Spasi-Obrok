export type OfferCategory = 'bakery' | 'fast_food' | 'grocery' | 'restaurant';

export interface Offer {
  id: string;
  title: string;
  price: number;
  valueEstimate: number;
  location: string;
  distance: number;
  quantity: number;
  pickupEnd: string;
  noPork: boolean;
  vegan: boolean;
  imageSeed?: string;
  category: OfferCategory;
  reservedCount?: number;
  pickedUpCount?: number;
  partnerId?: string;
  createdAt?: string;
}

export type OrderStatus = 'reserved' | 'picked_up' | 'no_show';

export interface Order {
  id: string;
  offerId: string;
  offerTitle: string;
  status: OrderStatus;
  createdAt: string;
  pickedUpAt?: string;
  userPhone?: string;
  userId?: string;
  partnerId?: string;
}
