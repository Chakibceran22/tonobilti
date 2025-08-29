import { supabase } from "./supabase";

export const userService = {
    async addFavorite(userId:string, carId: string) {
        const { data, error } = await supabase.from('favorites').insert([{ user_id: userId, car_id: carId }]);
        if (error) {
            throw new Error(error.message);
        }
        return data;
    },
    async removeFavorite(userId: string, carId: string) {
        const {data , error} = await supabase.from('favorites').delete().match({ user_id: userId, car_id: carId });
        if( error) {
            throw new Error(error.message);
        }
        return data;
    },
    async getFavorites(userId: string) {
const { data, error } = await supabase
        .from('favorites')
        .select(`
            *,
            cars (*)
        `)
        .eq('user_id', userId);
        if( error){
            throw new Error(error.message);
        }

        return data;
    },
    async getFavoriteCarIds(userId: string) {
        const { data, error } = await supabase
            .from('favorites')
            .select('car_id')
            .eq('user_id', userId);
        if (error) {
            throw new Error(error.message);
        }
        return data ? data.map(fav => fav.car_id) : [];
    }
}