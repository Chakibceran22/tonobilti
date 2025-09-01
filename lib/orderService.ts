import { Order, OrderToSend } from "@/types/orderTypes";
import { supabase } from "./supabase";

export const orderService = {
    async getOrders(user_id: string | undefined) {
        const { data, error } = await supabase.from('orders').select('*, cars(*)').eq('user_id', user_id);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    async addOrder(order: OrderToSend) {
        if(!order.user_id) throw new Error("User ID is required to place an order.");
        const { data, error } = await supabase.from('orders').insert([order]).select().single();
        if (error) {
            throw new Error(error.message);
        }
        return data;
    }
}