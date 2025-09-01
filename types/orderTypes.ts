import { CarData } from "./carTypes";

export interface Order {
  id: string;
  phone: string;
  
  state: string;           
  city: string;            
  specificLocation: string;
  
  shippingOption: string;   
  shippingPrice: number;   
  
  
  customsClearance: "self" | "service";
  
  
  user_id: string;          
  car_id: string;        
  total: number;           
  status: "Pending" | "Confirmed" | "Processing" | "Delivered" | "Cancelled";

  vehiclePrice?: number;        // Car price in DZD
  portDeliveryFee?: number;     // Fixed port fee (~2750 USD converted to DZD)
  serviceFee?: number;          // Service fee if using customs service (~150,000 DZD)
  customsTax?: number;          // Estimated customs tax (30-45% of vehicle price)
  
  // Metadata
  createdAt?: string;
  updatedAt?: Date;
  cars?: CarData;
}

export interface OrderToSend {
  phone: string;
  
  state: string;           
  city: string;            
  specificLocation: string;
  
  shippingOption: string;   
  shippingPrice: number;   
  
  
  customsClearance: "self" | "service";
  
  
  user_id: string;          
  car_id: string;        
  total: number;           
  status: "Pending" | "Confirmed" | "Processing" | "Delivered" | "Cancelled";

  vehiclePrice?: number;        // Car price in DZD
  portDeliveryFee?: number;     // Fixed port fee (~2750 USD converted to DZD)
  serviceFee?: number;          // Service fee if using customs service (~150,000 DZD)
  customsTax?: number;          // Estimated customs tax (30-45% of vehicle price)
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}