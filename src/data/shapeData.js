export const BASIC_SHAPES = [
  { type: 'text', iconName: 'Type', name: 'Chữ' },
  { type: 'rect', iconName: 'Square', name: 'Chữ Nhật' },
  { type: 'circle', iconName: 'Circle', name: 'Tròn' },
  { type: 'triangle', iconName: 'Triangle', name: 'Tam Giác' },
  { type: 'star', iconName: 'Star', name: 'Ngôi Sao' },
  { type: 'arrow', iconName: 'ArrowRight', name: 'Mũi Tên' },
];

export const LUCIDE_ICONS = [
  // Giao tiếp & Cảm xúc
  'Heart', 'Smile', 'Frown', 'ThumbsUp', 'ThumbsDown', 'MessageCircle', 'Mail', 'Phone', 'Send',
  // Công nghệ & Thiết bị
  'Camera', 'Image', 'Music', 'Video', 'Monitor', 'Smartphone', 'Wifi', 'Battery', 'Bluetooth', 'Zap',
  // Thời tiết & Thiên nhiên
  'Sun', 'Moon', 'Cloud', 'CloudRain', 'Wind', 'Droplet', 'Flame', 'Snowflake',
  // Cuộc sống & Đồ vật
  'Coffee', 'Gift', 'ShoppingBag', 'ShoppingCart', 'CreditCard', 'MapPin', 'Globe', 'Home',
  // Biểu tượng & Hệ thống
  'Shield', 'Lock', 'Unlock', 'Key', 'Settings', 'Search', 'Bell', 'User', 'Users',
  // Mũi tên điều hướng
  'ChevronLeft', 'ChevronRight', 'ChevronUp', 'ChevronDown', 'ArrowUp', 'ArrowDown', 'ArrowLeft',
  // Trạng thái
  'Check', 'X', 'Plus', 'Minus', 'AlertCircle', 'Info', 'HelpCircle', 'Trash', 'Download', 'Upload'
];

export const PATH_SHAPES = [
  // Hình cơ bản (MS Paint style)
  { id: 'line', name: 'Đường thẳng', path: 'M 10 90 L 90 10' },
  { id: 'curve', name: 'Đường cong', path: 'M 10 50 Q 50 0 50 50 T 90 50' },
  { id: 'right-triangle', name: 'Tam giác vuông', path: 'M 10 10 L 10 90 L 90 90 Z' },
  { id: 'diamond', name: 'Hình thoi', path: 'M 50 10 L 90 50 L 50 90 L 10 50 Z' },
  { id: 'pentagon', name: 'Ngũ giác', path: 'M 50 10 L 90 40 L 75 90 L 25 90 L 10 40 Z' },
  { id: 'hexagon', name: 'Lục giác', path: 'M 50 10 L 90 25 L 90 75 L 50 90 L 10 75 L 10 25 Z' },
  
  // Mũi tên
  { id: 'arrow-right-block', name: 'Mũi tên phải', path: 'M 10 40 H 60 V 20 L 90 50 L 60 80 V 60 H 10 Z' },
  { id: 'arrow-left-block', name: 'Mũi tên trái', path: 'M 90 40 H 40 V 20 L 10 50 L 40 80 V 60 H 90 Z' },
  { id: 'arrow-up-block', name: 'Mũi tên lên', path: 'M 40 90 V 40 H 20 L 50 10 L 80 40 H 60 V 90 Z' },
  { id: 'arrow-down-block', name: 'Mũi tên xuống', path: 'M 40 10 V 60 H 20 L 50 90 L 80 60 H 60 V 10 Z' },
  
  // Ngôi sao & Đa giác
  { id: 'star-4', name: 'Sao 4 cánh', path: 'M 50 10 L 60 40 L 90 50 L 60 60 L 50 90 L 40 60 L 10 50 L 40 40 Z' },
  { id: 'star-6', name: 'Sao 6 cánh', path: 'M 50 10 L 65 25 L 90 25 L 75 50 L 90 75 L 65 75 L 50 90 L 35 75 L 10 75 L 25 50 L 10 25 L 35 25 Z' },
  { id: 'cross', name: 'Dấu cộng', path: 'M 40 10 H 60 V 40 H 90 V 60 H 60 V 90 H 40 V 60 H 10 V 40 H 40 Z' },
  
  // Bong bóng chat
  { id: 'callout-rect', name: 'Bong bóng vuông', path: 'M 10 10 H 90 V 70 H 40 L 20 90 V 70 H 10 Z' },
  { id: 'callout-oval', name: 'Bong bóng tròn', path: 'M 50 10 Q 90 10 90 40 Q 90 70 50 70 Q 40 70 30 60 L 20 80 L 25 60 Q 10 50 10 40 Q 10 10 50 10 Z' },
  { id: 'callout-cloud', name: 'Bong bóng mây', path: 'M 20 50 a 15 15 0 0 1 0 -30 a 20 20 0 0 1 40 0 a 15 15 0 0 1 20 30 a 15 15 0 0 1 -20 20 h -40 a 15 15 0 0 1 0 -20 Z' },
  
  // Tự nhiên & Đồ vật
  { id: 'heart', name: 'Trái tim', path: 'M 50 30 A 20 20 0 0 1 90 30 A 20 20 0 0 1 130 30 Q 130 70 90 100 Q 50 70 50 30 Z' },
  { id: 'moon', name: 'Trăng khuyết', path: 'M 50 10 A 40 40 0 1 0 90 50 A 30 30 0 1 1 50 10 Z' },
  { id: 'droplet', name: 'Giọt nước', path: 'M 50 10 C 90 50 90 80 50 90 C 10 80 10 50 50 10 Z' },
  { id: 'shield', name: 'Khiên', path: 'M 50 10 L 90 25 V 50 C 90 80 50 90 50 90 C 50 90 10 80 10 50 V 25 Z' },
  { id: 'lightning', name: 'Tia chớp', path: 'M 50 10 L 20 50 H 50 L 40 90 L 80 40 H 50 Z' }
];