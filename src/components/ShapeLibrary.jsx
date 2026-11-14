import React from 'react';
import * as LucideIcons from 'lucide-react';
import { BASIC_SHAPES, LUCIDE_ICONS, PATH_SHAPES } from '../data/shapeData';

const ShapeLibrary = ({ onAddBasicShape, onAddIcon, onAddPathShape }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '5px', marginBottom: '15px' }}>
      
      {/* Hình Cơ Bản */}
      {BASIC_SHAPES.map(shape => {
        const IconComponent = LucideIcons[shape.iconName];
        return (
          <button 
            key={shape.type} 
            className="btn" 
            style={{ background: '#fff', border: '1px solid #ddd', padding: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            onClick={() => onAddBasicShape(shape.type)}
            title={shape.name}
          >
            {IconComponent && <IconComponent size={24} color="#3b82f6" />}
          </button>
        );
      })}

      {/* Icon Lucide */}
      {LUCIDE_ICONS.map(name => {
        const IconComponent = LucideIcons[name];
        if (!IconComponent) return null;
        return (
          <button 
            key={name} 
            className="btn" 
            style={{ background: '#fff', border: '1px solid #ddd', padding: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} 
            onClick={() => onAddIcon(name)} 
            title={name}
          >
            <IconComponent size={24} color="#3b82f6" />
          </button>
        );
      })}

      {/* Hình SVG */}
      {PATH_SHAPES.map(shape => (
        <button 
          key={shape.id} 
          className="btn" 
          style={{ background: '#fff', border: '1px solid #ddd', padding: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          onClick={() => onAddPathShape(shape.path)}
          title={shape.name}
        >
          <svg viewBox="0 0 100 100" width="24" height="24">
            <path d={shape.path} fill="transparent" stroke="#3b82f6" strokeWidth="6" />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default ShapeLibrary;