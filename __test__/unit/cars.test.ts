import { carService } from '@/lib/carService'
import { supabase } from '@/lib/supabase'

jest.mock('@supabase/supabase-js')

describe('Cars Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('getAllCars returns all cars from database', async () => {
    // Mock car data that we expect to get back
    const mockCars = [
      { 
        id: 1, 
        make: 'Toyota', 
        model: 'Camry', 
        year: 2022, 
        color: 'Blue' 
      },
      { 
        id: 2, 
        make: 'Honda', 
        model: 'Civic', 
        year: 2021, 
        color: 'Red' 
      }
    ]

    // Set up the mock to return our test data
    const mockSelect = jest.fn().mockResolvedValue({ 
      data: mockCars, 
      error: null 
    })
    const mockFrom = jest.fn().mockReturnValue({ select: mockSelect })
    
    supabase.from = mockFrom

    // Call the function we're testing
    const result = await carService.getAllCars()

    // Verify the function called Supabase correctly
    expect(mockFrom).toHaveBeenCalledWith('cars')
    expect(mockSelect).toHaveBeenCalledWith('*')
    
    // Verify it returns the expected data
    expect(result).toEqual(mockCars)
  })

  test('getAllCars throws error when Supabase returns error', async () => {
  const mockError = { message: 'Database connection failed' }
  
  const mockSelect = jest.fn().mockResolvedValue({ 
    data: null, 
    error: mockError 
  })
  const mockFrom = jest.fn().mockReturnValue({ select: mockSelect })
  
  supabase.from = mockFrom

  // Test that the function throws an error with the expected message
  await expect(carService.getAllCars()).rejects.toThrow('Database connection failed')
})

  test('getAllCars handles empty result', async () => {
    const mockSelect = jest.fn().mockResolvedValue({ 
      data: [], 
      error: null 
    })
    const mockFrom = jest.fn().mockReturnValue({ select: mockSelect })
    
    supabase.from = mockFrom

    const result = await carService.getAllCars()

    expect(result).toEqual([])
  })

  test(' getCar by id handles error', async() => {
    const mockError = {message : 'Failed to fetch Car'}
    const mockSingle = jest.fn().mockReturnValue({ data: null, error: mockError})
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle})
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq})
    const mockFrom = jest.fn().mockReturnValue({ select: mockSelect})
    supabase.from = mockFrom
    await expect(carService.getCarById(1)).rejects.toThrow(mockError.message)
  })
})