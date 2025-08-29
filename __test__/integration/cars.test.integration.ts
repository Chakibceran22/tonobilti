// __tests__/integration/cars.test.integration.js
/**
 * @jest-environment node
 */

// Unmock supabase for this specific test file
jest.unmock('@supabase/supabase-js');

import { carService } from "@/lib/carService";

describe('Car Integration Tests', () => {
  test('should return array of cars', async () => {
    const cars = await carService.getAllCars();
    expect(Array.isArray(cars)).toBe(true);
  });
  
  it('should throw error for non-existent car', async () => {
    const fakeId = '99999999-9999-9999-9999-999999999999';
    
    await expect(carService.getCarById(fakeId))
      .rejects.toThrow('Failed to fetch Car');
  });
});