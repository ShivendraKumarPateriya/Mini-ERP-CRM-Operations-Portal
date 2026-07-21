export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type StockStatus = 'ok' | 'low' | 'critical';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Customer = {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  businessName: string;
  gstNumber?: string | null;
  type: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  followUps?: FollowUp[];
  createdAt: string;
  updatedAt: string;
};

export type FollowUp = {
  id: string;
  customerId: string;
  userId: string;
  note: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'role'>;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: string | number;
  currentStock: number;
  minStockAlert: number;
  warehouseLocation?: string | null;
  stockStatus?: StockStatus;
  stockMovements?: StockMovement[];
  createdAt: string;
  updatedAt: string;
};

export type StockMovement = {
  id: string;
  productId: string;
  quantity: number;
  type: MovementType;
  reason: string;
  userId: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'role'>;
};

export type ChallanItem = {
  id: string;
  challanId: string;
  productId: string;
  productName: string;
  productSku: string;
  unitPrice: string | number;
  quantity: number;
  product?: Product;
};

export type Challan = {
  id: string;
  challanNumber: string;
  customerId: string;
  userId: string;
  status: ChallanStatus;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  user?: Pick<User, 'id' | 'name' | 'role'>;
  items?: ChallanItem[];
};

export type Meta = {
  page: number;
  limit: number;
  total: number;
};

export type ApiResult<T> = {
  success: boolean;
  data: T;
  meta?: Meta;
};
