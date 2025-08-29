import { userService } from "@/lib/userService";
import { supabase } from "@/lib/supabase";

jest.mock("@supabase/supabase-js");

describe("User Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

test("addFavorite adds a favorite car for a user", async () => {
    const mockData = { id: 1, user_id: 'user123', car_id: 'car456' };
    const mockError = null;
    const mockInsert = jest.fn().mockReturnValue({ data: mockData, error: mockError });
    const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
    supabase.from = mockFrom;
    const result = await userService.addFavorite('user123', 'car456');
    expect(mockFrom).toHaveBeenCalledWith('favorites');
    expect(mockInsert).toHaveBeenCalledWith([{ user_id: 'user123', car_id: 'car456' }]);
    expect(result).toEqual(mockData);
})

});
