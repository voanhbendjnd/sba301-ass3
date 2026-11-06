/**
 * Author: Võ Anh Ben - CE190709
 * Component hien thi thuong hieu FUMiniHotelSystem
 */
import { Hotel } from 'lucide-react';

export default function Brand() {
  return (
    <div className="brand d-flex align-items-center gap-2">
      <div className="d-flex align-items-center justify-content-center bg-primary text-white rounded p-1 shadow-sm" style={{ width: 28, height: 28 }}>
        <Hotel size={18} />
      </div>
      <span className="brand-name fw-bold" style={{ fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
        FUMiniHotel
      </span>
    </div>
  );
}
