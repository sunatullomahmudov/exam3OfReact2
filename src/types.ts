export interface Contact {
  id: string;
  name: string;
  phone?: string;
  note?: string;
  folder_id?: string;
}
export interface Folder {
  id: string;
  name: string;
  color?: string;
}
export interface Debt {
  id: string;
  contact_id: string;
  direction: string;
  amount: number;
  currency: string;
  description?: string;
  due_date?: string;
  status: string;
  created_at: string;
}
export interface Payment {
  id: string;
  debt_id: string;
  amount: number;
  note?: string;
  paid_at: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
}
