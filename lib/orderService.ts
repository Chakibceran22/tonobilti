import { Order } from "@/types/orderTypes";
import { supabase } from "./supabase";

export const orderService = {
    async getOrders(user_id: string | undefined) {
        if(!user_id) return null;
        const { data, error } = await supabase.from('orders').select('*').eq('user_id', user_id);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    async addOrder(order: Order) {
        if(!order.user_id) throw new Error("User ID is required to place an order.");
        const { data, error } = await supabase.from('orders').insert([order]).select().single();
        if (error) {
            throw new Error(error.message);
        }
        return data;
    }
}