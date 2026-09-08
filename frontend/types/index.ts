export interface EventFromApi {
  id: number;
  title: string;
  genre: string;
  event_date: string;
  status: string;
  venue_name: string;
  admin_name: string;
}

export interface BestEvent {
  title: string;
  total_ticket: number;
}

export interface RevenueRes {
  total_revenue: number | null;
}

export interface OrdersRes {
  total_orders: number;
}

export interface TicketsRes {
  tickets_sold: number | null;
}