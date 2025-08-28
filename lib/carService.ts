import { supabase } from "./supabase";

export const carService = {
    async getAllCars() {
        const { data, error } = await supabase.from('cars').select('*');
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    async getCarById(id: number) {
        const { data, error} = await supabase.from('cars').select('*').eq('id', id).single();
        if( error){
            throw new Error('Failed to fetch Car');
        }
        return data;

    }
}