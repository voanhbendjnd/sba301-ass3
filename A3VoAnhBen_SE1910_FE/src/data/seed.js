/**
 * Author: Võ Anh Ben - CE190709
 * Du lieu khoi tao mau ban dau cho FUMiniHotelSystem
 */

export const defaultSettings = {
  displayName: 'Hotel Staff',
  hotelName: 'FUMiniHotel',
};

export function createSeed() {
  return {
    roomTypes: [
      { id: 1, name: 'Standard Room', description: 'Phòng tiêu chuẩn ấm cúng' },
      { id: 2, name: 'Superior Room', description: 'Phòng cao cấp hướng phố' },
      { id: 3, name: 'Deluxe Room', description: 'Phòng sang trọng có ban công' },
      { id: 4, name: 'Executive Suite', description: 'Phòng suite thượng hạng' },
    ],
    rooms: [
      { id: 1, number: '101', type: 'Standard Room', capacity: 2, price: 450000, status: 1 },
      { id: 2, number: '102', type: 'Standard Room', capacity: 2, price: 450000, status: 1 },
      { id: 3, number: '201', type: 'Superior Room', capacity: 3, price: 750000, status: 1 },
      { id: 4, number: '301', type: 'Deluxe Room', capacity: 4, price: 1200000, status: 1 },
    ],
    customers: [
      { id: 1, name: 'Nguyễn Văn An', email: 'customer@gmail.com', phone: '0912345678', status: 1 },
    ],
  };
}
