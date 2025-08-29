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

test("addFavorite throws an error when insertion fails", async () => {
  const mockData = null;
  const mockError = { message: 'Insertion failed' };
  const mockInsert = jest.fn().mockReturnValue({ data: mockData, error: mockError });
  const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
  supabase.from = mockFrom;
  await expect(userService.addFavorite('user123', 'car456')).rejects.toThrow('Insertion failed');
})

test("removeFavorite removes a favorite car for a user", async () => {
  const mockData = {user_id: 'user123', car_id: 'car456' };
  const mockError = null;
  const mockMatch = jest.fn().mockReturnValue({ data: mockData, error: mockError });
  const mockDelete = jest.fn().mockReturnValue({ match: mockMatch });
  const mockFrom = jest.fn().mockReturnValue({ delete: mockDelete });
  supabase.from = mockFrom;
  const result = await userService.removeFavorite('user123', 'car456');
  expect(mockFrom).toHaveBeenCalledWith('favorites');
  expect(mockMatch).toHaveBeenCalledWith({ user_id: 'user123', car_id: 'car456' });

})
test("removeFavorite throws an error when deletion fails", async () => {
  const mockData = null;
  const mockError = { message: 'Deletion failed' };
  const mockMatch = jest.fn().mockReturnValue({ data: mockData, error: mockError });
  const mockDelete = jest.fn().mockReturnValue({ match: mockMatch });
  const mockFrom = jest.fn().mockReturnValue({ delete: mockDelete });
  supabase.from = mockFrom;
  await expect(userService.removeFavorite('user123', 'car456')).rejects.toThrow('Deletion failed');
})

test("getFavorites retrieves favorite cars for a user", async () => {
  const mockData = [{ user_id: 'user123', car_id: 'car456' }];
  const mockError = null; 
  const mockEq = jest.fn().mockReturnValue({ data: mockData, error: mockError });
  const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
  const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
  supabase.from = mockFrom;
  const result = await userService.getFavorites('user123');
  expect(mockFrom).toHaveBeenCalledWith('favorites');
  expect(mockSelect).toHaveBeenCalledWith('*');
  expect(mockEq).toHaveBeenCalledWith('user_id', 'user123');
  expect(result).toEqual(mockData);
})


test("getFavorites throws an error when retrieval fails", async () => {
  const mockData = null;
  const mockError = { message: 'Retrieval failed' };
  const mockEq = jest.fn().mockReturnValue({ data: mockData, error: mockError });
  const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
  const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });
  supabase.from = mockFrom;
  await expect(userService.getFavorites('user123')).rejects.toThrow('Retrieval failed');
})
});

