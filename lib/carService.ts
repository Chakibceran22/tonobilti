import { CarData } from "@/types/carTypes";
import { supabase } from "./supabase";

export const carService = {
  async getAllCars() {
    const { data, error } = await supabase.from("cars").select("*");
    if (error) {
      throw new Error(error.message);
    }
    return data;
  },
  async getCarById(id: string) {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      throw new Error("Failed to fetch Car");
    }
    return data;
  },
  async getFirstFourCars() {
    const { data, error } = await supabase.from("cars").select("*").range(0, 3);
    if (error) {
      throw new Error("Failed to fetch Cars");
    }
    return data;
  },
  async getPaginatedFilteredCars(
    pageNumber: number,
    pageSize: number,
    fuelType?: string
  ): Promise<CarData[] | undefined> {
    const beg = (pageNumber - 1) * pageSize;
    const end = beg + pageSize - 1;

    let query = supabase
      .from("cars")
      .select("*", { count: "exact" })
      .range(beg, end);

    // apply filter only if fuelType is given
    if (fuelType) {
      query = query.eq("fuel", fuelType);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error("Failed to fetch Cars");
    }
    return data;
  },
  async getFilteredCarsCount(fuelType?: string): Promise<number> {
    let query = supabase
      .from("cars")
      .select("*", { count: "exact", head: true });

    if (fuelType) {
      query = query.eq("fuel", fuelType);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error("Failed to count Cars");
    }
    return count || 0;
  },
};
