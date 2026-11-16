import React, { useState, useRef, useEffect } from 'react';
import Konva from 'konva';
import { Stage, Layer, Group, Text, Image as KonvaImage, Rect, Circle, Star, RegularPolygon, Arrow, Path, Line, Transformer } from 'react-konva';
import { renderToStaticMarkup } from 'react-dom/server';
import { v4 as uuidv4 } from 'uuid';
import useImage from 'use-image';
import * as LucideIcons from 'lucide-react';
import ShapeLibrary from './components/ShapeLibrary';
import './App.css';

// ============= SVG ICON SET =============
const ICON_PATHS = {
  eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff: <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>,
  folder: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></>,
  folderOpen: <><path d="M6 14l1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></>,
  layers: <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>,
  undo: <><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></>,
  redo: <><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></>,
  brush: <><path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/></>,
  ruler: <><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></>,
  cursor: <><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></>,
  x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  minus: <><line x1="5" y1="12" x2="19" y2="12"/></>,
  trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
  sparkles: <><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></>,
  bend: <><path d="M3 20c4-8 14-16 18-16"/><circle cx="3" cy="20" r="1.5"/><circle cx="21" cy="4" r="1.5"/></>,
  edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  check: <><polyline points="20 6 9 17 4 12"/></>,
  rotateCcw: <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></>,
  refresh: <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/><path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>,
  alert: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
  moon: <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
  book: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
  square: <><rect x="3" y="3" width="18" height="18" rx="2"/></>,
  circle: <><circle cx="12" cy="12" r="10"/></>,
  triangle: <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></>,
  star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
  arrowRight: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  type: <><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></>,
  bold: <><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></>,
  italic: <><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></>,
  underline: <><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></>,
  pen: <><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></>,
  chevronLeft: <><polyline points="15 18 9 12 15 6"/></>,
  chevronRight: <><polyline points="9 18 15 12 9 6"/></>,
  up: <><polyline points="18 15 12 9 6 15"/></>,
  down: <><polyline points="6 9 12 15 18 9"/></>,
  alignLeft: <><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></>,
  alignCenterH: <><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></>,
  alignRight: <><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></>,
  alignTop: <><line x1="6" y1="21" x2="6" y2="3"/><line x1="10" y1="21" x2="10" y2="7"/><line x1="14" y1="21" x2="14" y2="3"/><line x1="18" y1="21" x2="18" y2="7"/></>,
  alignCenterV: <><line x1="12" y1="3" x2="12" y2="21"/><line x1="8" y1="6" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="18"/></>,
  alignBottom: <><line x1="6" y1="3" x2="6" y2="21"/><line x1="10" y1="3" x2="10" y2="17"/><line x1="14" y1="3" x2="14" y2="21"/><line x1="18" y1="3" x2="18" y2="17"/></>,
  copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  sliders: <><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
};

const Icon = ({ name, size = 16, style, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }} {...props}>
    {ICON_PATHS[name] || null}
  </svg>
);

const getLayerIconName = (el) => {
  if (el.type === 'text') return 'type';
  if (el.type === 'image') return 'image';
  if (el.type === 'rect') return 'square';
  if (el.type === 'circle') return 'circle';
  if (el.type === 'polygon') return 'triangle';
  if (el.type === 'star') return 'star';
  if (el.type === 'arrow') return 'arrowRight';
  if (el.type === 'path') return 'pen';
  if (el.type === 'icon') return 'sparkles';
  if (el.type === 'brush') return 'pen';
  if (el.type === 'bentShape') return 'bend';
  return 'file';
};

const getLayerName = (el) => {
  if (el.type === 'text') return el.text?.slice(0, 20) || 'Văn bản';
  if (el.type === 'image') return 'Hình ảnh';
  if (el.type === 'rect') return 'Chữ nhật';
  if (el.type === 'circle') return 'Hình tròn';
  if (el.type === 'polygon') return `Đa giác ${el.sides || 5}`;
  if (el.type === 'star') return `Ngôi sao ${el.numPoints || 5}`;
  if (el.type === 'arrow') return 'Mũi tên';
  if (el.type === 'path') return 'Đường dẫn';
  if (el.type === 'icon') return 'Biểu tượng';
  if (el.type === 'brush') return 'Nét vẽ';
  if (el.type === 'bentShape') return 'Hình uốn cong';
  return el.type;
};

const POOF_BG_API_KEYS = ['pk_f03da1265a86e47c1113d8753f8d5291', 'pk_bcb6518335e63ac9ef2b1fa893f267c1'];
const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const SHAPE_BENDABLE = ['rect', 'polygon', 'star', 'bentShape'];
const getBaseType = (el) => el.baseType || el.type;

const isDarkColor = (hex) => {
  if (!hex || hex.length < 7) return false;
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16); const g = parseInt(c.substr(2, 2), 16); const b = parseInt(c.substr(4, 2), 16);
  return ((0.299 * r + 0.587 * g + 0.114 * b) / 255) < 0.5;
};

const getSvgPoints = (cx, cy, r, sides, isStar = false, innerR = 0) => {
  const points = []; const num = isStar ? sides * 2 : sides;
  for (let i = 0; i < num; i++) {
    const radius = isStar && i % 2 !== 0 ? innerR : r;
    const angle = (i * Math.PI * 2) / num - Math.PI / 2;
    points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
  }
  return points.join(' ');
};

const getIconPaths = (IconComponent) => {
  if (!IconComponent) return [];
  try {
    const svgString = renderToStaticMarkup(<IconComponent />);
    const tempDiv = document.createElement('div'); tempDiv.innerHTML = svgString;
    const svg = tempDiv.querySelector('svg'); if (!svg) return [];
    let paths = [];
    svg.querySelectorAll('path, circle, line, rect, polygon, polyline, ellipse').forEach(node => {
      if (node.tagName === 'path') { const d = node.getAttribute('d') || ""; if (d.trim()) paths.push(d.trim()); }
      else if (node.tagName === 'circle') { const cx = Number(node.getAttribute('cx') || 0), cy = Number(node.getAttribute('cy') || 0), r = Number(node.getAttribute('r') || 0); paths.push(`M ${cx-r} ${cy} a ${r} ${r} 0 1 0 ${r*2} 0 a ${r} ${r} 0 1 0 -${r*2} 0`); }
      else if (node.tagName === 'ellipse') { const cx = Number(node.getAttribute('cx') || 0), cy = Number(node.getAttribute('cy') || 0), rx = Number(node.getAttribute('rx') || 0), ry = Number(node.getAttribute('ry') || 0); paths.push(`M ${cx-rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx*2} 0 a ${rx} ${ry} 0 1 0 -${rx*2} 0`); }
      else if (node.tagName === 'line') { const x1 = Number(node.getAttribute('x1') || 0), y1 = Number(node.getAttribute('y1') || 0), x2 = Number(node.getAttribute('x2') || 0), y2 = Number(node.getAttribute('y2') || 0); paths.push(`M ${x1} ${y1} L ${x2} ${y2}`); }
      else if (node.tagName === 'rect') {
        const x = Number(node.getAttribute('x') || 0), y = Number(node.getAttribute('y') || 0), w = Number(node.getAttribute('width') || 0), h = Number(node.getAttribute('height') || 0), rx = Number(node.getAttribute('rx') || 0);
        if (rx > 0) paths.push(`M ${x+rx} ${y} h ${w-rx*2} a ${rx} ${rx} 0 0 1 ${rx} ${rx} v ${h-rx*2} a ${rx} ${rx} 0 0 1 -${rx} ${rx} h -${w-rx*2} a ${rx} ${rx} 0 0 1 -${rx} -${rx} v -${h-rx*2} a ${rx} ${rx} 0 0 1 ${rx} -${rx} Z`);
        else paths.push(`M ${x} ${y} h ${w} v ${h} h -${w} Z`);
      } else if (node.tagName === 'polygon' || node.tagName === 'polyline') {
        const points = (node.getAttribute('points') || "").trim().split(/[\s,]+/);
        if (points.length >= 4) { let p = `M ${points[0]} ${points[1]} `; for (let i = 2; i < points.length; i += 2) p += `L ${points[i]} ${points[i+1]} `; if (node.tagName === 'polygon') p += ' Z'; paths.push(p); }
      }
    });
    return paths;
  } catch { return []; }
};

const getInitialElements = () => { try { return JSON.parse(localStorage.getItem('design_elements')) || []; } catch { return []; } };
const getInitialCustomShapes = () => { try { return JSON.parse(localStorage.getItem('custom_shapes')) || []; } catch { return []; } };

const toggleFontStyle = (el, style) => {
  const cur = el.fontStyle || 'normal'; const styles = cur.split(' ').filter(s => s && s !== 'normal');
  const idx = styles.indexOf(style); if (idx >= 0) styles.splice(idx, 1); else styles.push(style);
  styles.sort((a, b) => (a === 'italic' ? -1 : b === 'italic' ? 1 : 0));
  return styles.length === 0 ? 'normal' : styles.join(' ');
};

const initLegacyProject = () => {
  const existing = localStorage.getItem('projects');
  if (existing) { try { return JSON.parse(existing); } catch { return []; } }
  const oldElements = localStorage.getItem('design_elements');
  if (oldElements && oldElements !== '[]') {
    try {
      const id = uuidv4(); const now = Date.now();
      const project = { id, name: 'Dự án cũ', elements: JSON.parse(oldElements) || [], bgColor: localStorage.getItem('design_bg') || '#ffffff', bgImage: null, canvasSize: JSON.parse(localStorage.getItem('canvas_size') || '{"width":800,"height":600}'), createdAt: now, updatedAt: now };
      localStorage.setItem(`project_${id}`, JSON.stringify(project));
      const list = [{ id, name: project.name, createdAt: now, updatedAt: now }];
      localStorage.setItem('projects', JSON.stringify(list));
      return list;
    } catch { return []; }
  }
  return [];
};

const MENU_ITEM = { display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: '#1f2937' };

const TEXT_STYLES = [
  { id: 'display',   name: 'Display',    fontFamily: 'Bungee',           fontSize: 72, fontStyle: 'normal', fill: '#1f2937', letterSpacing: 0, lineHeight: 1.1 },
  { id: 'heading',   name: 'Tiêu đề',    fontFamily: 'Anton',            fontSize: 64, fontStyle: 'normal', fill: '#1f2937', letterSpacing: -1, lineHeight: 1.1 },
  { id: 'tech',      name: 'Tech',       fontFamily: 'Orbitron',         fontSize: 48, fontStyle: 'bold', fill: '#3b82f6', letterSpacing: 2, lineHeight: 1.2 },
  { id: 'handwrite', name: 'Viết tay',   fontFamily: 'Permanent Marker', fontSize: 48, fontStyle: 'normal', fill: '#1f2937', letterSpacing: 0, lineHeight: 1.3 },
  { id: 'script',    name: 'Cách điệu',  fontFamily: 'Dancing Script',   fontSize: 56, fontStyle: 'bold', fill: '#8b5cf6', letterSpacing: 0, lineHeight: 1.2 },
  { id: 'bold',      name: 'Đậm',        fontFamily: 'Montserrat',       fontSize: 40, fontStyle: 'bold', fill: '#1f2937', letterSpacing: 0, lineHeight: 1.2 },
  { id: 'body',      name: 'Nội dung',   fontFamily: 'Roboto',           fontSize: 20, fontStyle: 'normal', fill: '#374151', letterSpacing: 0, lineHeight: 1.5 },
  { id: 'quote',     name: 'Trích dẫn',  fontFamily: 'Bebas Neue',       fontSize: 36, fontStyle: 'normal', fill: '#6b7280', letterSpacing: 1, lineHeight: 1.4 },
];

const TEXT_EFFECTS = [
  { id: 'none',    name: 'Không' },
  { id: 'shadow',  name: 'Đổ bóng' },
  { id: 'neon',    name: 'Neon' },
  { id: 'outline', name: 'Viền ngoài' },
  { id: 'hollow',  name: 'Rỗng' },
  { id: 'lift',    name: 'Nổi khối' },
  { id: 'echo',    name: 'Bóng mờ' },
];

const applyTextTransform = (text, transform) => {
  if (!transform || transform === 'none') return text;
  if (transform === 'uppercase') return text.toUpperCase();
  if (transform === 'lowercase') return text.toLowerCase();
  if (transform === 'capitalize') return text.replace(/\b\w/g, c => c.toUpperCase());
  return text;
};

const getActiveTextStyleId = (el) => {
  const match = TEXT_STYLES.find(p =>
    p.fontFamily === (el.fontFamily || 'Montserrat') &&
    p.fontSize === (el.fontSize || 40) &&
    (p.fontStyle || 'normal') === (el.fontStyle || 'normal') &&
    p.letterSpacing === (el.letterSpacing || 0)
  );
  return match ? match.id : 'custom';
};

const getTextEffectProps = (el) => {
  const effect = el.textEffect || 'none';
  if (effect === 'shadow') return { shadowColor: '#000000', shadowBlur: 10, shadowOffsetX: 4, shadowOffsetY: 4, shadowOpacity: 0.5 };
  if (effect === 'neon') return { shadowColor: el.fill || '#3b82f6', shadowBlur: 30, shadowOffsetX: 0, shadowOffsetY: 0, shadowOpacity: 1, shadowForStrokeEnabled: true };
  if (effect === 'lift') return { shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 8, shadowOffsetY: 8, shadowOpacity: 0.35 };
  if (effect === 'echo') return { shadowColor: el.fill || '#3b82f6', shadowBlur: 0, shadowOffsetX: 8, shadowOffsetY: 8, shadowOpacity: 0.5 };
  if (effect === 'outline') return { fillAfterStrokeEnabled: true };
  return {};
};

const clampStagePos = (pos, mainAreaSize, canvasSize, stageScale) => {
  const sw = canvasSize.width * stageScale, sh = canvasSize.height * stageScale;
  const mvx = Math.min(80, sw * 0.25), mvy = Math.min(80, sh * 0.25);
  return { x: Math.max(mvx - sw, Math.min(mainAreaSize.width - mvx, pos.x)), y: Math.max(mvy - sh, Math.min(mainAreaSize.height - mvy, pos.y)) };
};

const getEdgeCount = (el) => {
  const bt = getBaseType(el);
  if (bt === 'rect') return 4;
  if (bt === 'polygon') return el.sides || 5;
  if (bt === 'star') return (el.numPoints || 5) * 2;
  return 0;
};

const getEdgeMidpoints = (el) => {
  const bt = getBaseType(el);
  if (bt === 'rect') { const w = el.width, h = el.height; return [{ x: w/2, y: 0 }, { x: w, y: h/2 }, { x: w/2, y: h }, { x: 0, y: h/2 }]; }
  if (bt === 'polygon') {
    const { radius, sides } = el; const verts = [];
    for (let i = 0; i < sides; i++) { const a = (i * Math.PI * 2) / sides - Math.PI / 2; verts.push({ x: radius * Math.cos(a), y: radius * Math.sin(a) }); }
    const mids = []; for (let i = 0; i < sides; i++) { const nv = verts[(i + 1) % sides]; mids.push({ x: (verts[i].x + nv.x) / 2, y: (verts[i].y + nv.y) / 2 }); }
    return mids;
  }
  if (bt === 'star') {
    const { innerRadius, outerRadius, numPoints } = el; const total = numPoints * 2; const verts = [];
    for (let i = 0; i < total; i++) { const r = i % 2 === 0 ? outerRadius : innerRadius; const a = (i * Math.PI * 2) / total - Math.PI / 2; verts.push({ x: r * Math.cos(a), y: r * Math.sin(a) }); }
    const mids = []; for (let i = 0; i < total; i++) { const nv = verts[(i + 1) % total]; mids.push({ x: (verts[i].x + nv.x) / 2, y: (verts[i].y + nv.y) / 2 }); }
    return mids;
  }
  return [];
};

const buildBentPath = (el) => {
  const bt = getBaseType(el); const bends = el.bends || [];
  if (bt === 'rect') {
    const w = el.width, h = el.height;
    const corners = [{ x:0,y:0 }, { x:w,y:0 }, { x:w,y:h }, { x:0,y:h }];
    const mids = [{ x:w/2,y:0 }, { x:w,y:h/2 }, { x:w/2,y:h }, { x:0,y:h/2 }];
    let data = `M ${corners[0].x} ${corners[0].y} `;
    for (let i = 0; i < 4; i++) { const nc = corners[(i + 1) % 4]; const b = bends[i] || { x: 0, y: 0 }; data += `Q ${mids[i].x + b.x} ${mids[i].y + b.y} ${nc.x} ${nc.y} `; }
    return data + 'Z';
  }
  if (bt === 'polygon') {
    const { radius, sides } = el; const verts = [];
    for (let i = 0; i < sides; i++) { const a = (i * Math.PI * 2) / sides - Math.PI / 2; verts.push({ x: radius * Math.cos(a), y: radius * Math.sin(a) }); }
    let data = `M ${verts[0].x} ${verts[0].y} `;
    for (let i = 0; i < sides; i++) { const nv = verts[(i + 1) % sides]; const mx = (verts[i].x + nv.x) / 2, my = (verts[i].y + nv.y) / 2; const b = bends[i] || { x: 0, y: 0 }; data += `Q ${mx + b.x} ${my + b.y} ${nv.x} ${nv.y} `; }
    return data + 'Z';
  }
  if (bt === 'star') {
    const { innerRadius, outerRadius, numPoints } = el; const total = numPoints * 2; const verts = [];
    for (let i = 0; i < total; i++) { const r = i % 2 === 0 ? outerRadius : innerRadius; const a = (i * Math.PI * 2) / total - Math.PI / 2; verts.push({ x: r * Math.cos(a), y: r * Math.sin(a) }); }
    let data = `M ${verts[0].x} ${verts[0].y} `;
    for (let i = 0; i < total; i++) { const nv = verts[(i + 1) % total]; const mx = (verts[i].x + nv.x) / 2, my = (verts[i].y + nv.y) / 2; const b = bends[i] || { x: 0, y: 0 }; data += `Q ${mx + b.x} ${my + b.y} ${nv.x} ${nv.y} `; }
    return data + 'Z';
  }
  return 'M 0 0 Z';
};

const URLImage = ({ src, brightness, contrast, blurRadius, saturate, ...props }) => {
  const [image] = useImage(src);
  const ref = useRef();
  const hasFilters = (brightness ?? 0) !== 0 || (contrast ?? 0) !== 0 || (blurRadius ?? 0) > 0 || (saturate ?? 1) !== 1;
  useEffect(() => {
    if (!ref.current || !image) return;
    try { if (hasFilters) ref.current.cache(); else ref.current.clearCache(); ref.current.getLayer()?.batchDraw(); } catch {}
  }, [brightness, contrast, blurRadius, saturate, image, hasFilters]);
  return <KonvaImage ref={ref} image={image} filters={[Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.Blur, Konva.Filters.HSL]} brightness={brightness ?? 0} contrast={contrast ?? 0} blurRadius={blurRadius ?? 0} saturation={saturate ?? 1} {...props} />;
};

const CanvasBg = ({ bgImage, bgColor, canvasSize }) => {
  const [img] = useImage(bgImage || '');
  return (
    <Group listening={false}>
      <Rect width={canvasSize.width} height={canvasSize.height} fill={bgColor} shadowColor="#000" shadowBlur={20} shadowOpacity={0.2} listening={false} />
      {bgImage && img && img.width > 0 && (() => {
        const scale = Math.max(canvasSize.width / img.width, canvasSize.height / img.height);
        return (
          <Rect width={canvasSize.width} height={canvasSize.height}
            fillPatternImage={img}
            fillPatternScaleX={scale} fillPatternScaleY={scale}
            fillPatternOffsetX={(img.width * scale - canvasSize.width) / scale / 2}
            fillPatternOffsetY={(img.height * scale - canvasSize.height) / scale / 2}
            fillPatternRepeat="no-repeat" listening={false} />
        );
      })()}
    </Group>
  );
};

const ArcText = ({ text, fontSize, fontFamily, fontStyle, fill, stroke, strokeWidth, bendAmount, textDecoration, align, width, letterSpacing = 0, lineHeight = 1.2, effectProps = {}, ...rest }) => {
  const baseOffsetX = (width || 200) / 2; const baseOffsetY = (fontSize || 40) / 2;
  if (!bendAmount || bendAmount === 0) {
    return <Text {...rest} {...effectProps} text={text} fontSize={fontSize} fontFamily={fontFamily} fontStyle={fontStyle} fill={fill} stroke={stroke} strokeWidth={strokeWidth} textDecoration={textDecoration} align={align} width={width} letterSpacing={letterSpacing} lineHeight={lineHeight} />;
  }
  const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
  const isBold = fontStyle && fontStyle.includes('bold') ? 'bold ' : '';
  const isItalic = fontStyle && fontStyle.includes('italic') ? 'italic ' : '';
  ctx.font = `${isItalic}${isBold}${fontSize}px ${fontFamily || 'Arial'}`;
  const chars = [...text];
  const charWidths = chars.map(c => ctx.measureText(c).width + letterSpacing);
  const totalWidth = charWidths.reduce((a, b) => a + b, 0);
  if (totalWidth === 0) return null;
  const bendRad = (bendAmount / 100) * Math.PI;
  const absBendRad = Math.abs(bendRad);
  if (absBendRad < 0.001) return <Text {...rest} {...effectProps} text={text} fontSize={fontSize} fontFamily={fontFamily} fontStyle={fontStyle} fill={fill} stroke={stroke} strokeWidth={strokeWidth} textDecoration={textDecoration} align={align} width={width} letterSpacing={letterSpacing} lineHeight={lineHeight} />;
  const radius = totalWidth / absBendRad;
  let cumWidth = 0;
  const charNodes = chars.map((char, i) => {
    const cw = charWidths[i];
    const localOffset = cumWidth + cw / 2 - totalWidth / 2;
    cumWidth += cw;
    const angle = localOffset / radius;
    let charX, charY, charRotation;
    if (bendAmount > 0) { charX = Math.sin(angle) * radius; charY = radius - Math.cos(angle) * radius; charRotation = angle * (180 / Math.PI); }
    else { charX = Math.sin(angle) * radius; charY = -radius + Math.cos(angle) * radius; charRotation = -angle * (180 / Math.PI); }
    return (
      <Text key={i} text={char} {...effectProps}
        x={charX + baseOffsetX} y={charY + baseOffsetY} rotation={charRotation}
        fontSize={fontSize} fontFamily={fontFamily} fontStyle={fontStyle}
        fill={fill} stroke={stroke} strokeWidth={strokeWidth}
        textDecoration={textDecoration} offsetX={cw / 2} offsetY={fontSize / 2} />
    );
  });
  return <Group {...rest}>{charNodes}</Group>;
};

const IconBtn = ({ icon, size = 14, label, active, onClick, title, variant = 'default', disabled }) => {
  const bg = active ? '#3b82f6' : variant === 'danger' ? '#fee2e2' : variant === 'success' ? '#10b981' : '#fff';
  const color = active ? '#fff' : variant === 'danger' ? '#ef4444' : variant === 'success' ? '#fff' : '#333';
  return (
    <button onClick={onClick} disabled={disabled} title={title || label}
      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', fontSize: '12px', fontWeight: '600', borderRadius: '4px', border: '1px solid #ccc', background: bg, color, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap', flexShrink: 0 }}>
      <Icon name={icon} size={size} />
      {label && <span>{label}</span>}
    </button>
  );
};

function App() {
  const [view, setView] = useState('lobby');
  const [projects, setProjects] = useState(initLegacyProject);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [openProjectIds, setOpenProjectIds] = useState([]);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showAddTabPopup, setShowAddTabPopup] = useState(false);
  const addTabBtnRef = useRef(null);
  const [addTabPopupPos, setAddTabPopupPos] = useState({ left: 0, top: 0 });
  const projectBtnRef = useRef(null);
  const [projectMenuPos, setProjectMenuPos] = useState({ left: 0, top: 0 });
  const [bendMode, setBendMode] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [exportScale, setExportScale] = useState(2);
  const [mobileDragHint, setMobileDragHint] = useState(false);
  const mobileHintTimeoutRef = useRef(null);
  const dragStartPositions = useRef({});

  const promptResolveRef = useRef(null); const confirmResolveRef = useRef(null);
  const [promptState, setPromptState] = useState(null); const [confirmState, setConfirmState] = useState(null);

  const [elements, setElements] = useState(getInitialElements);
  const elementsRef = useRef(null);
  useEffect(() => { elementsRef.current = elements; }, [elements]);
  const arrowNudgePendingRef = useRef(false);
  const [customShapes, setCustomShapes] = useState(getInitialCustomShapes);
  const [selectedIds, setSelectedIds] = useState([]);
  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
  const setSelectedId = (id) => setSelectedIds(id ? [id] : []);
  const [canvasSize, setCanvasSize] = useState(() => { const s = localStorage.getItem('canvas_size'); return s ? JSON.parse(s) : { width: 800, height: 600 }; });
  const [bgColor, setBgColor] = useState(() => localStorage.getItem('design_bg') || '#ffffff');
  const [bgImage, setBgImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [activeTab, setActiveTab] = useState('basic');
  const [mainAreaSize, setMainAreaSize] = useState({ width: 800, height: 600 });
  const mainAreaRef = useRef(null);
  const isCanvasDragging = useRef(false);
  const userHasMovedCanvas = useRef(false);
  const lastCanvasSizeRef = useRef({ width: 800, height: 600 });
  const [zoomPopupPos, setZoomPopupPos] = useState(() => { try { const s = localStorage.getItem('zoom_popup_pos'); return s ? JSON.parse(s) : { x: 16, y: null }; } catch { return { x: 16, y: null }; } });
  const [isDraggingZoom, setIsDraggingZoom] = useState(false);
  const zoomDragOffset = useRef({ x: 0, y: 0 });
  const [isEditingZoom, setIsEditingZoom] = useState(false);
  const [zoomInputValue, setZoomInputValue] = useState('');

  const showPrompt = (title, defaultValue = '') => new Promise((resolve) => { promptResolveRef.current = resolve; setPromptState({ title, value: defaultValue }); });
  const handlePromptConfirm = () => { const v = promptState?.value?.trim() || ''; setPromptState(null); promptResolveRef.current?.(v || null); promptResolveRef.current = null; };
  const handlePromptCancel = () => { setPromptState(null); promptResolveRef.current?.(null); promptResolveRef.current = null; };
  const showConfirm = (title) => new Promise((resolve) => { confirmResolveRef.current = resolve; setConfirmState({ title }); });
  const handleConfirmYes = () => { setConfirmState(null); confirmResolveRef.current?.(true); confirmResolveRef.current = null; };
  const handleConfirmNo = () => { setConfirmState(null); confirmResolveRef.current?.(false); confirmResolveRef.current = null; };

  useEffect(() => {
    if (document.getElementById('pixelcraft-fonts')) return;
    const link = document.createElement('link');
    link.id = 'pixelcraft-fonts'; link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Roboto:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Anton&family=Bebas+Neue&family=Dancing+Script:ital,wght@0,400;0,700;1,400;1,700&family=Bungee&family=Orbitron:wght@400;700;900&family=Permanent+Marker&display=swap';
    document.head.appendChild(link);
  }, []);

  useEffect(() => { if (selectedIds.length === 1) setBendMode(false); }, [selectedIds]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('project'); if (!projectId) return;
    try {
      const data = localStorage.getItem(`project_${projectId}`); if (!data) { alert('Dự án không tồn tại'); return; }
      const project = JSON.parse(data);
      setElements(project.elements || []); setBgColor(project.bgColor || '#ffffff'); setBgImage(project.bgImage || null);
      setCanvasSize(project.canvasSize || { width: 800, height: 600 });
      setHistory([project.elements || []]); setHistoryStep(0);
      setCurrentProjectId(projectId); setOpenProjectIds([projectId]); setView('editor');
      window.history.replaceState({}, '', window.location.pathname);
    } catch { alert('Không thể mở dự án'); }
  }, []);

  useEffect(() => { const h = () => setIsMobile(window.innerWidth <= 1024); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);
  useEffect(() => { const h = () => { setShowAddTabPopup(false); setShowProjectMenu(false); }; window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);
  useEffect(() => { if (!mainAreaRef.current) return; const o = new ResizeObserver((es) => { for (let e of es) setMainAreaSize({ width: e.contentRect.width, height: e.contentRect.height }); }); o.observe(mainAreaRef.current); return () => o.disconnect(); }, []);

  const [isLeftOpen, setIsLeftOpen] = useState(!isMobile);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentTool, setCurrentTool] = useState('select');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const isDrawing = useRef(false);
  const lastDist = useRef(0);
  const [isRulerMode, setIsRulerMode] = useState(false);
  const [tempLine, setTempLine] = useState(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [draftShape, setDraftShape] = useState({ type: 'rect', width: 200, height: 150, cornerRadius: 0, radius: 80, sides: 5, innerRadius: 40, outerRadius: 80, numPoints: 5, fill: '#3b82f6', stroke: '#000000', strokeWidth: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([getInitialElements()]);
  const [historyStep, setHistoryStep] = useState(0);
  const stageRef = useRef(null); const trRef = useRef(null); const layerRef = useRef(null); const fileInputRef = useRef(null);

  useEffect(() => { localStorage.setItem('custom_shapes', JSON.stringify(customShapes)); }, [customShapes]);
  useEffect(() => {
    if (!currentProjectId) return;
    const name = projects.find(p => p.id === currentProjectId)?.name || 'Untitled';
    const pd = { id: currentProjectId, name, elements, bgColor, bgImage, canvasSize, updatedAt: Date.now() };
    localStorage.setItem(`project_${currentProjectId}`, JSON.stringify(pd));
    setProjects(prev => { if (!prev.find(p => p.id === currentProjectId)) return prev; return prev.map(p => p.id === currentProjectId ? { ...p, updatedAt: pd.updatedAt } : p); });
  }, [elements, bgColor, bgImage, canvasSize, currentProjectId]);

  useEffect(() => {
    if (mainAreaSize.width <= 0 || mainAreaSize.height <= 0) return;
    const cc = lastCanvasSizeRef.current.width !== canvasSize.width || lastCanvasSizeRef.current.height !== canvasSize.height;
    lastCanvasSizeRef.current = canvasSize;
    if (cc) userHasMovedCanvas.current = false;
    if (!userHasMovedCanvas.current) setStagePos({ x: mainAreaSize.width / 2 - (canvasSize.width * stageScale) / 2, y: mainAreaSize.height / 2 - (canvasSize.height * stageScale) / 2 });
    else setStagePos(prev => clampStagePos(prev, mainAreaSize, canvasSize, stageScale));
    // eslint-disable-next-line
  }, [mainAreaSize.width, mainAreaSize.height, canvasSize.width, canvasSize.height]);

  useEffect(() => {
    if (selectedIds.length > 0 && currentTool === 'select' && !isRulerMode && !bendMode) {
      const nodes = selectedIds.map(id => layerRef.current?.findOne('#' + id)).filter(Boolean);
      if (trRef.current) trRef.current.nodes(nodes);
    } else if (trRef.current) trRef.current.nodes([]);
    if (layerRef.current) layerRef.current.batchDraw();
  }, [selectedIds, elements, currentTool, isRulerMode, bendMode]);

  useEffect(() => { if (mainAreaSize.height > 0 && zoomPopupPos.y === null) setZoomPopupPos({ x: 16, y: Math.max(16, mainAreaSize.height - 60) }); }, [mainAreaSize.height, zoomPopupPos.y]);
  useEffect(() => { if (zoomPopupPos.y !== null) localStorage.setItem('zoom_popup_pos', JSON.stringify(zoomPopupPos)); }, [zoomPopupPos]);
  useEffect(() => {
    if (zoomPopupPos.y === null) return;
    const pw = 210, ph = 44;
    const nx = Math.min(zoomPopupPos.x, Math.max(0, mainAreaSize.width - pw));
    const ny = Math.min(zoomPopupPos.y, Math.max(0, mainAreaSize.height - ph));
    if (nx !== zoomPopupPos.x || ny !== zoomPopupPos.y) setZoomPopupPos({ x: nx, y: ny });
  }, [mainAreaSize.width, mainAreaSize.height]);

  useEffect(() => {
    if (!isDraggingZoom) return;
    const onMove = (e) => {
      if (e.type === 'touchmove') e.preventDefault();
      const rect = mainAreaRef.current?.getBoundingClientRect(); if (!rect) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX, cy = e.touches ? e.touches[0].clientY : e.clientY;
      const pw = 210, ph = 44;
      setZoomPopupPos({ x: Math.max(0, Math.min(rect.width - pw, cx - rect.left - zoomDragOffset.current.x)), y: Math.max(0, Math.min(rect.height - ph, cy - rect.top - zoomDragOffset.current.y)) });
    };
    const onUp = () => setIsDraggingZoom(false);
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false }); window.addEventListener('touchend', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp); };
  }, [isDraggingZoom, mainAreaSize.width, mainAreaSize.height]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT') return;
      if (e.ctrlKey && e.key.toLowerCase() === 'z') { e.preventDefault(); handleUndo(); }
      else if (e.ctrlKey && e.key.toLowerCase() === 'y') { e.preventDefault(); handleRedo(); }
      else if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedIds.length === 0) return;
        e.preventDefault();
        if (e.key === 'Backspace' && selectedId) { const el = elements.find(i => i.id === selectedId); if (el && el.type === 'text' && el.text && el.text.length > 0) { updateElement(selectedId, { text: '' }); return; } }
        deleteSelected();
      }
      else if (ARROW_KEYS.includes(e.key)) {
        if (selectedIds.length === 0 || bendMode) return;
        e.preventDefault(); arrowNudgePendingRef.current = true;
        const step = e.shiftKey ? 10 : 1;
        let dx = 0, dy = 0;
        if (e.key === 'ArrowUp') dy = -step; if (e.key === 'ArrowDown') dy = step;
        if (e.key === 'ArrowLeft') dx = -step; if (e.key === 'ArrowRight') dx = step;
        setElements(prev => prev.map(i => selectedIds.includes(i.id) ? { ...i, x: (i.x || 0) + dx, y: (i.y || 0) + dy } : i));
      }
      else if (e.key === 'Escape') {
        e.preventDefault();
        if (promptState) { handlePromptCancel(); return; }
        if (confirmState) { handleConfirmNo(); return; }
        if (showAddTabPopup) { setShowAddTabPopup(false); return; }
        if (showProjectMenu) { setShowProjectMenu(false); return; }
        if (showLayers) { setShowLayers(false); return; }
        if (bendMode) { setBendMode(false); return; }
        if (isRulerMode) { setIsRulerMode(false); setTempLine(null); }
        else if (currentTool !== 'select') setCurrentTool('select');
        else if (selectedIds.length > 0) setSelectedIds([]);
      }
    };
    const handleKeyUp = (e) => {
      if (ARROW_KEYS.includes(e.key) && arrowNudgePendingRef.current) {
        const cur = elementsRef.current;
        const nh = history.slice(0, historyStep + 1); nh.push(cur);
        setHistory(nh); setHistoryStep(nh.length - 1); arrowNudgePendingRef.current = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [historyStep, history, selectedIds, selectedId, elements, currentTool, isRulerMode, showAddTabPopup, showProjectMenu, promptState, confirmState, bendMode, showLayers]);

  useEffect(() => {
    if (!isMobile) return;
    if (selectedIds.length === 0) { setMobileDragHint(false); return; }
    setMobileDragHint(true);
    if (mobileHintTimeoutRef.current) clearTimeout(mobileHintTimeoutRef.current);
    mobileHintTimeoutRef.current = setTimeout(() => setMobileDragHint(false), 1800);
    return () => { if (mobileHintTimeoutRef.current) clearTimeout(mobileHintTimeoutRef.current); };
  }, [selectedIds, isMobile]);

  const saveToHistory = (newElements) => {
    const nh = history.slice(0, historyStep + 1); nh.push(newElements);
    setHistory(nh); setHistoryStep(nh.length - 1); setElements(newElements);
  };
  const handleUndo = () => { if (historyStep > 0) { const ps = historyStep - 1; setHistoryStep(ps); setElements(history[ps]); setSelectedIds([]); } };
  const handleRedo = () => { if (historyStep < history.length - 1) { const ns = historyStep + 1; setHistoryStep(ns); setElements(history[ns]); setSelectedIds([]); } };
  const handleReset = async () => {
    const ok = await showConfirm("Bạn có chắc chắn muốn đặt lại toàn bộ thiết kế?"); if (!ok) return;
    setElements([]); setBgColor('#ffffff'); setBgImage(null); setSelectedIds([]); setCurrentTool('select'); setHistory([[]]); setHistoryStep(0);
    setStageScale(1); userHasMovedCanvas.current = false;
    setStagePos({ x: mainAreaSize.width / 2 - canvasSize.width / 2, y: mainAreaSize.height / 2 - canvasSize.height / 2 });
  };

  const setZoomLevel = (newPercent) => {
    const ns = Math.max(0.1, Math.min(5, newPercent / 100));
    if (Math.abs(ns - stageScale) < 0.001) return;
    const vcx = mainAreaSize.width / 2, vcy = mainAreaSize.height / 2;
    const mpt = { x: (vcx - stagePos.x) / stageScale, y: (vcy - stagePos.y) / stageScale };
    userHasMovedCanvas.current = true;
    setStageScale(ns);
    setStagePos(clampStagePos({ x: vcx - mpt.x * ns, y: vcy - mpt.y * ns }, mainAreaSize, canvasSize, ns));
  };
  const commitZoom = () => { const v = parseFloat(zoomInputValue); if (!isNaN(v)) setZoomLevel(Math.max(10, Math.min(500, v))); setIsEditingZoom(false); };
  const handleZoomPopupDragStart = (e) => {
    const t = e.target; if (t.closest('button') || t.closest('input')) return;
    const rect = mainAreaRef.current?.getBoundingClientRect(); if (!rect) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX, cy = e.touches ? e.touches[0].clientY : e.clientY;
    zoomDragOffset.current = { x: cx - rect.left - zoomPopupPos.x, y: cy - rect.top - zoomPopupPos.y };
    setIsDraggingZoom(true);
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const oldScale = stageRef.current.scaleX();
    const pointerPosition = stageRef.current.getPointerPosition(); if (!pointerPosition) return;
    const mpt = { x: (pointerPosition.x - stageRef.current.x()) / oldScale, y: (pointerPosition.y - stageRef.current.y()) / oldScale };
    const newScale = e.evt.deltaY > 0 ? oldScale / 1.1 : oldScale * 1.1;
    if (newScale < 0.1 || newScale > 5) return;
    userHasMovedCanvas.current = true;
    setStageScale(newScale);
    setStagePos({ x: pointerPosition.x - mpt.x * newScale, y: pointerPosition.y - mpt.y * newScale });
  };

  const handleTouchMove = (e) => {
    e.evt.preventDefault();
    const t1 = e.evt.touches[0], t2 = e.evt.touches[1];
    if (t1 && t2) {
      isDrawing.current = false;
      if (stageRef.current.isDragging()) stageRef.current.stopDrag();
      try { layerRef.current?.getChildren().forEach(c => { if (c.isDragging && c.isDragging()) c.stopDrag(); }); } catch {}
      const p1 = { x: t1.clientX, y: t1.clientY }, p2 = { x: t2.clientX, y: t2.clientY };
      const nd = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      const nc = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      if (lastDist.current === 0) { lastDist.current = nd; return; }
      const sb = nd / lastDist.current; const os = stageRef.current.scaleX();
      let ns = os * sb; if (ns < 0.1) ns = 0.1; if (ns > 5) ns = 5;
      const pt = { x: (nc.x - stageRef.current.x()) / os, y: (nc.y - stageRef.current.y()) / os };
      userHasMovedCanvas.current = true;
      setStageScale(ns); setStagePos({ x: nc.x - pt.x * ns, y: nc.y - pt.y * ns }); lastDist.current = nd;
      return;
    }
    const stage = e.target.getStage(); const point = stage.getRelativePointerPosition();
    if (currentTool === 'brush' && isDrawing.current) {
      let ll = elements[elements.length - 1];
      if (ll && ll.type === 'brush') { ll.points = ll.points.concat([point.x, point.y]); setElements(elements.slice(0, elements.length - 1).concat(ll)); }
    } else if (isRulerMode && tempLine) setTempLine(prev => ({ ...prev, points: [0, 0, point.x - prev.x, point.y - prev.y] }));
  };

  const handleTouchEnd = () => {
    lastDist.current = 0;
    if (isRulerMode && tempLine) {
      const ex = tempLine.x + tempLine.points[2], ey = tempLine.y + tempLine.points[3];
      saveToHistory([...elements, { id: uuidv4(), type: 'brush', points: [tempLine.x, tempLine.y, ex, ey], stroke: brushColor, strokeWidth: brushSize, opacity: 1, shadowEnabled: false, shadowColor: '#000000' }]);
      setTempLine(null);
    } else if (isDrawing.current) { isDrawing.current = false; saveToHistory(elements); }
  };

  const handleStageMouseDown = (e) => {
    const pos = e.target.getStage().getRelativePointerPosition();
    if (isRulerMode) { setTempLine({ x: pos.x, y: pos.y, points: [0, 0, 0, 0] }); return; }
    if (currentTool !== 'brush') return;
    isDrawing.current = true;
    setElements([...elements, { id: uuidv4(), type: 'brush', points: [pos.x, pos.y], stroke: brushColor, strokeWidth: brushSize, tension: 0.5, opacity: 1, shadowEnabled: false, shadowColor: '#000000' }]);
  };
  const handleStageMouseMove = (e) => {
    const pos = e.target.getStage().getRelativePointerPosition();
    if (isRulerMode && tempLine) { setTempLine(prev => ({ ...prev, points: [0, 0, pos.x - prev.x, pos.y - prev.y] })); return; }
    if (!isDrawing.current || currentTool !== 'brush') return;
    let ll = elements[elements.length - 1];
    if (ll && ll.type === 'brush') { ll.points = ll.points.concat([pos.x, pos.y]); setElements(elements.slice(0, elements.length - 1).concat(ll)); }
  };
  const handleStageMouseUp = () => {
    if (isRulerMode && tempLine) {
      const ex = tempLine.x + tempLine.points[2], ey = tempLine.y + tempLine.points[3];
      saveToHistory([...elements, { id: uuidv4(), type: 'brush', points: [tempLine.x, tempLine.y, ex, ey], stroke: brushColor, strokeWidth: brushSize, opacity: 1, shadowEnabled: false, shadowColor: '#000000' }]);
      setTempLine(null); return;
    }
    if (isDrawing.current) { isDrawing.current = false; saveToHistory(elements); }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0]; if (!file) return;
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.elements) saveToHistory(parsed.elements);
          if (parsed.bgColor) setBgColor(parsed.bgColor);
          if (parsed.bgImage !== undefined) setBgImage(parsed.bgImage);
          if (parsed.canvasSize) setCanvasSize(parsed.canvasSize);
          setSelectedIds([]); alert("Đã nhập dự án thành công");
        } catch { alert("Tệp JSON không hợp lệ"); }
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const center = getCenterPosition(); const maxDim = 300;
          let w = img.width, h = img.height;
          if (w > h) { if (w > maxDim) { h *= maxDim / w; w = maxDim; } } else { if (h > maxDim) { w *= maxDim / h; h = maxDim; } }
          saveToHistory([...elements, { id: uuidv4(), type: 'image', x: center.x - w / 2, y: center.y - h / 2, width: w, height: h, src: reader.result, opacity: 1, shadowEnabled: false, shadowColor: '#000000', blendMode: 'source-over' }]);
          setCurrentTool('select'); if (isMobile) { setIsLeftOpen(false); setIsRightOpen(true); }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const center = getCenterPosition(); const maxDim = 300;
        let w = img.width, h = img.height;
        if (w > h) { if (w > maxDim) { h *= maxDim / w; w = maxDim; } } else { if (h > maxDim) { w *= maxDim / h; h = maxDim; } }
        saveToHistory([...elements, { id: uuidv4(), type: 'image', x: center.x - w / 2, y: center.y - h / 2, width: w, height: h, src: reader.result, opacity: 1, shadowEnabled: false, shadowColor: '#000000', blendMode: 'source-over' }]);
        setCurrentTool('select'); if (isMobile) { setIsLeftOpen(false); setIsRightOpen(true); }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file); e.target.value = null;
  };
  const handleBgImageUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBgImage(reader.result);
    reader.readAsDataURL(file); e.target.value = null;
  };

  const resizeImage = (dataUrl, maxSize) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > h) { if (w > maxSize) { h *= maxSize / w; w = maxSize; } } else { if (h > maxSize) { w *= maxSize / h; h = maxSize; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = dataUrl;
  });

  const handleRemoveBg = async () => {
    if (!selectedId) return;
    setIsProcessing(true);
    setProcessingText('Đang tách nền bằng AI...');
    try {
      const element = elements.find(el => el.id === selectedId);
      if (!element || element.type !== 'image') return;
      const resized = await resizeImage(element.src, 1600);
      const blob = await (await fetch(resized)).blob();
      const fd = new FormData(); fd.append('file', blob, 'image.jpg');
      let sb = null;
      for (let i = 0; i < POOF_BG_API_KEYS.length; i++) {
        try { const r = await fetch('https://api.poof.bg/v1/remove', { method: 'POST', headers: { 'x-api-key': POOF_BG_API_KEYS[i] }, body: fd }); if (r.ok) { sb = await r.blob(); break; } } catch {}
      }
      if (sb) {
        const reader = new FileReader();
        reader.onload = () => { saveToHistory(elements.map(el => el.id === selectedId ? { ...el, src: reader.result } : el)); setIsProcessing(false); };
        reader.readAsDataURL(sb);
      } else throw new Error('Không thể tách nền. Vui lòng thử lại sau.');
    } catch (error) { alert("Lỗi: " + error.message); setIsProcessing(false); }
  };

  const getCenterPosition = () => {
    if (!stageRef.current) return { x: canvasSize.width / 2, y: canvasSize.height / 2 };
    let vw = mainAreaSize.width, vh = mainAreaSize.height;
    if (isMobile && isRightOpen) vh = vh * 0.6;
    const cx = (vw / 2 - stagePos.x) / stageScale;
    const cy = (vh / 2 - stagePos.y) / stageScale;
    const PADDING = 30;
    if (cx < PADDING || cx > canvasSize.width - PADDING || cy < PADDING || cy > canvasSize.height - PADDING) {
      return { x: canvasSize.width / 2, y: canvasSize.height / 2 };
    }
    return { x: cx, y: cy };
  };

  const centerSelected = () => {
    if (selectedIds.length === 0) return;
    const dxL = [], dyL = [];
    selectedIds.forEach(id => {
      const node = layerRef.current?.findOne('#' + id); if (!node) return;
      const box = node.getClientRect({ relativeTo: layerRef.current });
      dxL.push(canvasSize.width / 2 - (box.x + box.width / 2));
      dyL.push(canvasSize.height / 2 - (box.y + box.height / 2));
    });
    if (dxL.length === 0) return;
    const ax = dxL.reduce((a, b) => a + b, 0) / dxL.length, ay = dyL.reduce((a, b) => a + b, 0) / dyL.length;
    saveToHistory(elements.map(el => selectedIds.includes(el.id) ? { ...el, x: (el.x || 0) + ax, y: (el.y || 0) + ay } : el));
  };

  const alignSelected = (dir) => {
    if (selectedIds.length < 2) return;
    const boxes = selectedIds.map(id => { const n = layerRef.current?.findOne('#' + id); const e = elements.find(x => x.id === id); if (!n || !e) return null; return { id, el: e, box: n.getClientRect({ relativeTo: layerRef.current }) }; }).filter(Boolean);
    if (boxes.length < 2) return;
    let target;
    if (dir === 'left') target = Math.min(...boxes.map(b => b.box.x));
    if (dir === 'right') target = Math.max(...boxes.map(b => b.box.x + b.box.width));
    if (dir === 'center-h') { const mnX = Math.min(...boxes.map(b => b.box.x)), mxX = Math.max(...boxes.map(b => b.box.x + b.box.width)); target = (mnX + mxX) / 2; }
    if (dir === 'top') target = Math.min(...boxes.map(b => b.box.y));
    if (dir === 'bottom') target = Math.max(...boxes.map(b => b.box.y + b.box.height));
    if (dir === 'center-v') { const mnY = Math.min(...boxes.map(b => b.box.y)), mxY = Math.max(...boxes.map(b => b.box.y + b.box.height)); target = (mnY + mxY) / 2; }
    saveToHistory(elements.map(el => {
      const b = boxes.find(x => x.id === el.id); if (!b) return el;
      let nx = el.x || 0, ny = el.y || 0;
      if (dir === 'left') nx += target - b.box.x;
      if (dir === 'right') nx += target - (b.box.x + b.box.width);
      if (dir === 'center-h') nx += target - (b.box.x + b.box.width / 2);
      if (dir === 'top') ny += target - b.box.y;
      if (dir === 'bottom') ny += target - (b.box.y + b.box.height);
      if (dir === 'center-v') ny += target - (b.box.y + b.box.height / 2);
      return { ...el, x: nx, y: ny };
    }));
  };

  const addBasicShape = (type) => {
    setCurrentTool('select'); setIsRulerMode(false);
    const c = getCenterPosition();
    const base = { id: uuidv4(), rotation: 0, scaleX: 1, scaleY: 1, stroke: '#000000', strokeWidth: 0, opacity: 1, shadowEnabled: false, shadowColor: '#000000', blendMode: 'source-over' };
    let newEl = {};
    if (type === 'text') newEl = { ...base, type, x: c.x - 100, y: c.y - 20, text: 'Văn bản mới', fontSize: 40, fontFamily: 'Montserrat', fontStyle: 'normal', fill: '#000000', width: 200, align: 'center', bendAmount: 0, textStrokeEnabled: false, textStrokeColor: '#000000', textStrokeWidth: 0, letterSpacing: 0, lineHeight: 1.2, textTransform: 'none', textEffect: 'none' };
    if (type === 'rect') newEl = { ...base, type, x: c.x - 100, y: c.y - 75, width: 200, height: 150, cornerRadius: 0, fill: '#3b82f6', dashEnabled: false, dashPattern: [10, 5], lineCap: 'butt', lineJoin: 'miter', fillType: 'solid', gradientColor1: '#3b82f6', gradientColor2: '#8b5cf6', gradientAngle: 0 };
    if (type === 'circle') newEl = { ...base, type, x: c.x, y: c.y, radius: 80, fill: '#ef4444', dashEnabled: false, dashPattern: [10, 5], lineCap: 'butt', lineJoin: 'miter', fillType: 'solid', gradientColor1: '#ef4444', gradientColor2: '#f97316', gradientAngle: 0 };
    if (type === 'triangle' || type === 'polygon') newEl = { ...base, type: 'polygon', x: c.x, y: c.y, radius: 80, sides: type === 'triangle' ? 3 : 5, fill: '#eab308', dashEnabled: false, dashPattern: [10, 5], lineCap: 'butt', lineJoin: 'miter', fillType: 'solid', gradientColor1: '#eab308', gradientColor2: '#84cc16', gradientAngle: 0 };
    if (type === 'star') newEl = { ...base, type, x: c.x, y: c.y, innerRadius: 40, outerRadius: 80, numPoints: 5, fill: '#8b5cf6', dashEnabled: false, dashPattern: [10, 5], lineCap: 'butt', lineJoin: 'miter', fillType: 'solid', gradientColor1: '#8b5cf6', gradientColor2: '#ec4899', gradientAngle: 0 };
    if (type === 'arrow') newEl = { ...base, type, x: c.x - 75, y: c.y, points: [0, 0, 150, 0], stroke: '#000000', strokeWidth: 4, pointerLength: 20, pointerWidth: 20, dashEnabled: false, dashPattern: [10, 5], lineCap: 'butt', lineJoin: 'miter' };
    if (newEl.type) {
      saveToHistory([...elements, newEl]); setSelectedIds([newEl.id]);
      if (isMobile) { setIsLeftOpen(false); setIsRightOpen(true); }
    }
  };

  const addLucideIcon = (iconName) => {
    setCurrentTool('select'); setIsRulerMode(false);
    const paths = getIconPaths(LucideIcons[iconName]);
    if (paths.length === 0) return;
    const c = getCenterPosition();
    const newEl = { id: uuidv4(), type: 'icon', x: c.x, y: c.y, offsetX: 12, offsetY: 12, rotation: 0, data: paths, stroke: '#3b82f6', strokeWidth: 1.5, fill: 'transparent', scaleX: 8, scaleY: 8, opacity: 1, shadowEnabled: false, shadowColor: '#000000', blendMode: 'source-over' };
    saveToHistory([...elements, newEl]); setSelectedIds([newEl.id]);
    if (isMobile) { setIsLeftOpen(false); setIsRightOpen(true); }
  };

  const addCustomShape = (st) => {
    setCurrentTool('select'); setIsRulerMode(false);
    const c = getCenterPosition();
    const ne = { ...st, id: uuidv4(), x: c.x, y: c.y, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, shadowEnabled: false, shadowColor: '#000000', blendMode: 'source-over' };
    saveToHistory([...elements, ne]); setSelectedIds([ne.id]);
    if (isMobile) { setIsLeftOpen(false); setIsRightOpen(true); }
  };
  const saveCustomShape = () => { setCustomShapes([...customShapes, { ...draftShape, id: 'custom_' + uuidv4(), name: 'Hình tùy chỉnh' }]); setIsBuilderOpen(false); };
  const deleteCustomShape = async (e, id) => { e.stopPropagation(); const ok = await showConfirm("Xóa hình này khỏi thư viện?"); if (!ok) return; setCustomShapes(customShapes.filter(s => s.id !== id)); };
  const deleteAllCustomShapes = async () => { const ok = await showConfirm("Xóa toàn bộ hình tùy chỉnh?"); if (!ok) return; setCustomShapes([]); };

  const addPathShape = (pathData) => {
    setCurrentTool('select'); setIsRulerMode(false);
    const c = getCenterPosition();
    const ne = {
      id: uuidv4(), type: 'path',
      x: c.x, y: c.y,
      offsetX: 12, offsetY: 12,
      rotation: 0, data: [pathData],
      stroke: '#3b82f6', strokeWidth: 3, fill: 'transparent',
      scaleX: 2.5, scaleY: 2.5,
      opacity: 1, shadowEnabled: false, shadowColor: '#000000', blendMode: 'source-over'
    };
    saveToHistory([...elements, ne]); setSelectedIds([ne.id]);
    if (isMobile) { setIsLeftOpen(false); setIsRightOpen(true); }
  };

  const updateElement = (id, na) => { saveToHistory(elements.map(el => el.id === id ? { ...el, ...na } : el)); };
  const deleteSelected = () => { if (selectedIds.length === 0) return; saveToHistory(elements.filter(el => !selectedIds.includes(el.id))); setSelectedIds([]); };
  const duplicateSelected = () => {
    if (selectedIds.length === 0) return;
    const newIds = []; const ne = [...elements];
    selectedIds.forEach(id => { const el = elements.find(e => e.id === id); if (el) { const n = { ...el, id: uuidv4(), x: (el.x || 0) + 30, y: (el.y || 0) + 30 }; ne.push(n); newIds.push(n.id); } });
    saveToHistory(ne); setSelectedIds(newIds);
  };
  const moveLayer = (dir) => {
    if (selectedIds.length === 0) return;
    const ne = [...elements];
    selectedIds.forEach(id => { const idx = ne.findIndex(e => e.id === id); if (idx === -1) return; const [el] = ne.splice(idx, 1); if (dir === 'up') ne.push(el); else ne.unshift(el); });
    saveToHistory(ne);
  };

  const handleTransformEnd = (e, el) => {
    const node = e.target;
    const sx = node.scaleX(), sy = node.scaleY();
    let np = { x: node.x(), y: node.y(), rotation: node.rotation() };

    if (el.type === 'text' && el.bendAmount && el.bendAmount !== 0) {
      np = { ...np, scaleX: sx, scaleY: sy };
    } else if (['image', 'rect', 'path', 'icon', 'bentShape', 'brush'].includes(el.type)) {
      np = { ...np, scaleX: sx, scaleY: sy };
    } else if (el.type === 'text') {
      node.scaleX(1); node.scaleY(1);
      np = { ...np, width: Math.max(20, node.width() * sx), fontSize: Math.max(10, node.fontSize() * sy) };
    } else if (['circle', 'polygon'].includes(el.type)) {
      node.scaleX(1); node.scaleY(1);
      np = { ...np, radius: Math.max(10, node.radius() * sx) };
    } else if (el.type === 'star') {
      node.scaleX(1); node.scaleY(1);
      np = { ...np, innerRadius: Math.max(10, node.innerRadius() * sx), outerRadius: Math.max(10, node.outerRadius() * sx) };
    } else if (el.type === 'arrow') {
      node.scaleX(1); node.scaleY(1);
      np = { ...np, points: node.points().map(p => p * sx), strokeWidth: Math.max(1, node.strokeWidth() * sx) };
    }
    saveToHistory(elements.map(i => i.id === el.id ? { ...i, ...np } : i));
  };

  const exportPng = async () => {
    const fn = await showPrompt("Nhập tên tệp ảnh:", "pixelcraft-image"); if (!fn) return;
    if (trRef.current) trRef.current.hide();
    const oS = stageRef.current.scaleX(), oP = stageRef.current.position();
    stageRef.current.scale({ x: 1, y: 1 }); stageRef.current.position({ x: 0, y: 0 }); stageRef.current.batchDraw();
    const uri = stageRef.current.toDataURL({ x: 0, y: 0, width: canvasSize.width, height: canvasSize.height, pixelRatio: exportScale });
    stageRef.current.scale({ x: oS, y: oS }); stageRef.current.position(oP); stageRef.current.batchDraw();
    if (trRef.current) trRef.current.show();
    const link = document.createElement('a'); link.download = `${fn}@${exportScale}x.png`; link.href = uri;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };
  const saveProject = async () => {
    const fn = await showPrompt("Nhập tên tệp dự án:", "pixelcraft-project"); if (!fn) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ elements, bgColor, bgImage, canvasSize }));
    const a = document.createElement('a'); a.setAttribute("href", dataStr); a.setAttribute("download", `${fn}.json`);
    document.body.appendChild(a); a.click(); a.remove();
  };
  const loadProject = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const p = JSON.parse(event.target.result);
        if (p.elements) saveToHistory(p.elements);
        if (p.bgColor) setBgColor(p.bgColor);
        if (p.bgImage !== undefined) setBgImage(p.bgImage);
        if (p.canvasSize) setCanvasSize(p.canvasSize);
        setSelectedIds([]); alert("Đã tải dự án thành công");
      } catch { alert("Tệp không hợp lệ"); }
    };
    reader.readAsText(file); e.target.value = null;
  };

  const selectedEl = elements.find(el => el.id === selectedId);
  const multiSelect = selectedIds.length > 1;

  const getGradientProps = (el) => {
    if (el.fillType !== 'gradient') return {};
    const angle = (el.gradientAngle || 0) * Math.PI / 180;
    const w = el.width || el.radius * 2 || 200, h = el.height || el.radius * 2 || 200;
    const cx = w / 2, cy = h / 2;
    const r = Math.max(w, h) / 2;
    return {
      fillLinearGradientStartPoint: { x: cx - Math.cos(angle) * r, y: cy - Math.sin(angle) * r },
      fillLinearGradientEndPoint: { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r },
      fillLinearGradientColorStops: [0, el.gradientColor1 || '#3b82f6', 1, el.gradientColor2 || '#8b5cf6'],
    };
  };

  const renderShape = (el) => {
    const shadowProps = el.shadowEnabled ? { shadowColor: (el.shadowColor && el.shadowColor !== 'transparent') ? el.shadowColor : '#000000', shadowBlur: el.shadowBlur ?? 10, shadowOffsetX: el.shadowOffsetX ?? 5, shadowOffsetY: el.shadowOffsetY ?? 5, shadowForStrokeEnabled: true } : {};
    const dashProps = el.dashEnabled ? { dash: el.dashPattern || [10, 5] } : {};
    const blendProps = el.blendMode && el.blendMode !== 'source-over' ? { globalCompositeOperation: el.blendMode } : {};
    const gradientProps = getGradientProps(el);
    const commonProps = {
      id: el.id, x: el.x || 0, y: el.y || 0, rotation: el.rotation || 0,
      draggable: currentTool === 'select' && !isRulerMode && !bendMode && (!isMobile || selectedIds.includes(el.id)),
      opacity: el.opacity ?? 1, visible: el.visible !== false,
      ...shadowProps, ...dashProps, ...blendProps,
      lineCap: el.lineCap || 'butt', lineJoin: el.lineJoin || 'miter',
      onMouseDown: (e) => {
        e.cancelBubble = true;
        if (currentTool !== 'select' || isRulerMode || bendMode) return;
        if (e.evt.shiftKey || e.evt.metaKey || e.evt.ctrlKey) setSelectedIds(prev => prev.includes(el.id) ? prev.filter(x => x !== el.id) : [...prev, el.id]);
        else if (!selectedIds.includes(el.id)) setSelectedIds([el.id]);
        if (isMobile) setIsRightOpen(true);
      },
      onTap: (e) => { e.cancelBubble = true; if (currentTool !== 'select' || isRulerMode || bendMode) return; setSelectedIds([el.id]); if (isMobile) setIsRightOpen(true); },
      onDragStart: () => { if (selectedIds.includes(el.id) && selectedIds.length > 1) { dragStartPositions.current = {}; selectedIds.forEach(id => { const n = layerRef.current?.findOne('#' + id); if (n) dragStartPositions.current[id] = { x: n.x(), y: n.y() }; }); } },
      onDragMove: (e) => {
        if (selectedIds.includes(el.id) && selectedIds.length > 1 && dragStartPositions.current[el.id]) {
          const s = dragStartPositions.current[el.id]; const dx = e.target.x() - s.x, dy = e.target.y() - s.y;
          selectedIds.forEach(id => { if (id === el.id) return; const n = layerRef.current?.findOne('#' + id); if (n && dragStartPositions.current[id]) n.position({ x: dragStartPositions.current[id].x + dx, y: dragStartPositions.current[id].y + dy }); });
          layerRef.current?.batchDraw();
        }
      },
      onDragEnd: (e) => {
        if (selectedIds.includes(el.id) && selectedIds.length > 1 && dragStartPositions.current[el.id]) {
          const s = dragStartPositions.current[el.id]; const dx = e.target.x() - s.x, dy = e.target.y() - s.y;
          saveToHistory(elements.map(item => selectedIds.includes(item.id) ? { ...item, x: (item.x || 0) + dx, y: (item.y || 0) + dy } : item));
          dragStartPositions.current = {};
        } else saveToHistory(elements.map(item => item.id === el.id ? { ...item, x: e.target.x(), y: e.target.y() } : item));
      },
      onTransformEnd: (e) => handleTransformEnd(e, el),
    };

    if (el.type === 'icon') {
      return (
        <Group key={el.id} {...commonProps} scaleX={el.scaleX || 1} scaleY={el.scaleY || 1} offsetX={el.offsetX ?? 0} offsetY={el.offsetY ?? 0}>
          {el.data.map((p, i) => (
            <Path key={i} data={p} stroke={el.stroke} strokeWidth={el.strokeWidth} fill={el.fill}
              {...shadowProps} {...blendProps}
              lineCap="round" lineJoin="round" />
          ))}
        </Group>
      );
    }
    if (el.type === 'bentShape') {
      return <Path key={el.id} {...commonProps} {...gradientProps} data={buildBentPath(el)} fill={el.fillType === 'gradient' ? undefined : el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth} scaleX={el.scaleX || 1} scaleY={el.scaleY || 1} />;
    }
    if (el.type === 'text') {
      const effect = el.textEffect || 'none';
      const effectProps = getTextEffectProps(el);
      const isHollow = effect === 'hollow';
      const isOutline = effect === 'outline';
      const tp = {
        ...commonProps,
        text: applyTextTransform(el.text, el.textTransform),
        fontSize: el.fontSize,
        fontFamily: el.fontFamily || 'Montserrat',
        fontStyle: el.fontStyle || 'normal',
        textDecoration: el.textDecoration || '',
        align: el.align,
        fill: isHollow ? 'transparent' : el.fill,
        stroke: el.textStrokeEnabled
          ? el.textStrokeColor
          : isOutline
            ? '#000000'
            : isHollow
              ? el.fill
              : undefined,
        strokeWidth: el.textStrokeEnabled
          ? el.textStrokeWidth
          : (isOutline || isHollow)
            ? (el.textStrokeWidth || 2)
            : undefined,
        width: el.width,
        bendAmount: el.bendAmount || 0,
        letterSpacing: el.letterSpacing || 0,
        lineHeight: el.lineHeight || 1.2,
      };
      if (el.bendAmount && el.bendAmount !== 0) {
        return <ArcText key={el.id} {...tp} effectProps={effectProps} />;
      }
      return <Text key={el.id} {...tp} {...effectProps} />;
    }

    const finalProps = {
      ...commonProps, stroke: el.stroke, strokeWidth: el.strokeWidth,
      fill: el.fillType === 'gradient' ? undefined : el.fill,
      ...gradientProps,
      ...(el.type === 'rect' && { width: el.width, height: el.height, cornerRadius: el.cornerRadius || 0, scaleX: el.scaleX || 1, scaleY: el.scaleY || 1 }),
      ...(el.type === 'circle' && { radius: el.radius }),
      ...(el.type === 'polygon' && { radius: el.radius, sides: el.sides }),
      ...(el.type === 'star' && { innerRadius: el.innerRadius, outerRadius: el.outerRadius, numPoints: el.numPoints }),
      ...(el.type === 'arrow' && { points: el.points, pointerLength: el.pointerLength, pointerWidth: el.pointerWidth }),
      ...(el.type === 'image' && { src: el.src, width: el.width, height: el.height, scaleX: el.scaleX || 1, scaleY: el.scaleY || 1, brightness: el.brightness, contrast: el.contrast, blurRadius: el.blurRadius, saturate: el.saturate }),
      ...(el.type === 'path' && {
        data: el.data[0],
        scaleX: el.scaleX || 1, scaleY: el.scaleY || 1,
        offsetX: el.offsetX ?? 0, offsetY: el.offsetY ?? 0,
        hitStrokeWidth: Math.max(20, (el.strokeWidth || 3) * 3)
      }),
      ...(el.type === 'brush' && {
        points: el.points, tension: el.tension,
        scaleX: el.scaleX || 1, scaleY: el.scaleY || 1,
        hitStrokeWidth: Math.max(20, (el.strokeWidth || 5) * 2),
        lineCap: 'round', lineJoin: 'round'
      }),
    };
    if (el.type === 'image') return <URLImage key={el.id} {...finalProps} />;
    if (el.type === 'rect') return <Rect key={el.id} {...finalProps} />;
    if (el.type === 'circle') return <Circle key={el.id} {...finalProps} />;
    if (el.type === 'polygon') return <RegularPolygon key={el.id} {...finalProps} />;
    if (el.type === 'star') return <Star key={el.id} {...finalProps} />;
    if (el.type === 'arrow') return <Arrow key={el.id} {...finalProps} />;
    if (el.type === 'path') return <Path key={el.id} {...finalProps} />;
    if (el.type === 'brush') return <Line key={el.id} {...finalProps} />;
    return null;
  };

  const saveCurrentProjectIfAny = () => { if (!currentProjectId) return; const name = projects.find(p => p.id === currentProjectId)?.name || 'Untitled'; localStorage.setItem(`project_${currentProjectId}`, JSON.stringify({ id: currentProjectId, name, elements, bgColor, bgImage, canvasSize, updatedAt: Date.now() })); };
  const loadProjectData = (id) => {
    try {
      const data = localStorage.getItem(`project_${id}`); if (!data) return false;
      const p = JSON.parse(data);
      setElements(p.elements || []); setBgColor(p.bgColor || '#ffffff'); setBgImage(p.bgImage || null);
      setCanvasSize(p.canvasSize || { width: 800, height: 600 });
      setHistory([p.elements || []]); setHistoryStep(0); setSelectedIds([]); setCurrentProjectId(id); userHasMovedCanvas.current = false;
      return true;
    } catch { return false; }
  };
  const openProject = (id) => { if (currentProjectId && currentProjectId !== id) saveCurrentProjectIfAny(); if (!loadProjectData(id)) return alert('Dự án không tồn tại'); setOpenProjectIds(prev => prev.includes(id) ? prev : [...prev, id]); setView('editor'); };
  const switchProject = (id) => { if (id === currentProjectId) return; saveCurrentProjectIfAny(); loadProjectData(id); };
  const closeProjectTab = (id) => { const f = openProjectIds.filter(p => p !== id); if (currentProjectId === id) { if (f.length > 0) switchProject(f[f.length - 1]); else { saveCurrentProjectIfAny(); setView('lobby'); setCurrentProjectId(null); setSelectedIds([]); } } setOpenProjectIds(f); };
  const createProjectWithName = (name) => {
    saveCurrentProjectIfAny(); const id = uuidv4(); const now = Date.now();
    localStorage.setItem(`project_${id}`, JSON.stringify({ id, name, elements: [], bgColor: '#ffffff', bgImage: null, canvasSize: { width: 800, height: 600 }, createdAt: now, updatedAt: now }));
    const nl = [...projects, { id, name, createdAt: now, updatedAt: now }];
    localStorage.setItem('projects', JSON.stringify(nl)); setProjects(nl); openProject(id);
  };
  const handleCreateProject = async () => { const n = await showPrompt('Tên dự án mới:', `Dự án ${projects.length + 1}`); if (!n) return; createProjectWithName(n); };
  const handleExitProject = () => { saveCurrentProjectIfAny(); setView('lobby'); setCurrentProjectId(null); setSelectedIds([]); setShowProjectMenu(false); setOpenProjectIds([]); };
  const handleNewTabProject = () => { setShowProjectMenu(false); handleCreateProject(); };
  const deleteProject = async (id) => { const ok = await showConfirm('Xóa dự án này? Hành động không thể hoàn tác.'); if (!ok) return; localStorage.removeItem(`project_${id}`); const nl = projects.filter(p => p.id !== id); localStorage.setItem('projects', JSON.stringify(nl)); setProjects(nl); setOpenProjectIds(prev => prev.filter(p => p !== id)); if (currentProjectId === id) { setView('lobby'); setCurrentProjectId(null); setSelectedIds([]); } };
  const renameProject = async (id) => { const p = projects.find(x => x.id === id); if (!p) return; const n = await showPrompt('Tên mới:', p.name); if (!n || n === p.name) return; const nl = projects.map(x => x.id === id ? { ...x, name: n } : x); localStorage.setItem('projects', JSON.stringify(nl)); setProjects(nl); const d = localStorage.getItem(`project_${id}`); if (d) { try { const pd = JSON.parse(d); pd.name = n; localStorage.setItem(`project_${id}`, JSON.stringify(pd)); } catch {} } };

  const openAddTabPopup = () => { if (showAddTabPopup) { setShowAddTabPopup(false); return; } if (addTabBtnRef.current) { const r = addTabBtnRef.current.getBoundingClientRect(); const pw = 280, pd = 8; let l = r.left; if (l + pw > window.innerWidth - pd) l = window.innerWidth - pw - pd; if (l < pd) l = pd; setAddTabPopupPos({ left: l, top: r.bottom + 4 }); } setShowAddTabPopup(true); };
  const openProjectMenu = () => { if (showProjectMenu) { setShowProjectMenu(false); return; } if (projectBtnRef.current) { const r = projectBtnRef.current.getBoundingClientRect(); const pw = 230, pd = 8; let l = r.left; if (l + pw > window.innerWidth - pd) l = window.innerWidth - pw - pd; if (l < pd) l = pd; setProjectMenuPos({ left: l, top: r.bottom + 6 }); } setShowProjectMenu(true); };
  const availableProjects = projects.filter(p => !openProjectIds.includes(p.id));

  const convertToBentShape = () => { if (!selectedEl) return; if (SHAPE_BENDABLE.includes(selectedEl.type) && selectedEl.type !== 'bentShape') { const ec = getEdgeCount(selectedEl); const be = { ...selectedEl, type: 'bentShape', baseType: selectedEl.type, bends: Array.from({ length: ec }, () => ({ x: 0, y: 0 })) }; saveToHistory(elements.map(it => it.id === selectedId ? be : it)); setBendMode(true); } };

  const renderBendControlPoints = () => {
    if (!bendMode || !selectedEl || selectedEl.type !== 'bentShape') return null;
    const mps = getEdgeMidpoints(selectedEl); const bends = selectedEl.bends || [];
    return mps.map((mp, i) => {
      const b = bends[i] || { x: 0, y: 0 };
      return (
        <Circle key={`bp-${i}`} x={mp.x + b.x} y={mp.y + b.y} radius={8 / stageScale} fill="#fbbf24" stroke="#1f2937" strokeWidth={2 / stageScale} draggable
          onMouseDown={(e) => { e.cancelBubble = true; }} onTouchStart={(e) => { e.cancelBubble = true; }}
          onDragMove={(e) => { const nb = { x: e.target.x() - mp.x, y: e.target.y() - mp.y }; const arr = [...bends]; arr[i] = nb; const nel = elementsRef.current.map(it => it.id === selectedEl.id ? { ...it, bends: arr } : it); elementsRef.current = nel; setElements(nel); }}
          onDragEnd={() => { const l = elementsRef.current; const nh = history.slice(0, historyStep + 1); nh.push(l); setHistory(nh); setHistoryStep(nh.length - 1); }}
          onDblClick={(e) => { e.cancelBubble = true; const nb = [...bends]; nb[i] = { x: 0, y: 0 }; saveToHistory(elements.map(it => it.id === selectedEl.id ? { ...it, bends: nb } : it)); }}
          onDblTap={(e) => { e.cancelBubble = true; const nb = [...bends]; nb[i] = { x: 0, y: 0 }; saveToHistory(elements.map(it => it.id === selectedEl.id ? { ...it, bends: nb } : it)); }} />
      );
    });
  };

  const renderLayersPanel = () => {
    if (!showLayers) return null;
    return (
      <div style={{ position: 'absolute', top: '10px', right: '10px', width: '260px', maxHeight: '70%', background: 'white', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 25, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb' }}>
          <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="layers" size={14} /> Lớp ({elements.length})
          </h3>
          <button onClick={() => setShowLayers(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: '#6b7280' }}>
            <Icon name="x" size={16} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {elements.length === 0 && <div style={{ padding: '20px', fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>Chưa có lớp nào</div>}
          {[...elements].reverse().map(el => {
            const isSel = selectedIds.includes(el.id);
            const isHidden = el.visible === false;
            return (
              <div key={el.id} onClick={() => setSelectedIds([el.id])} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '12px', background: isSel ? '#dbeafe' : 'transparent', borderBottom: '1px solid #f3f4f6' }}>
                <Icon name={getLayerIconName(el)} size={14} style={{ color: isSel ? '#1d4ed8' : '#6b7280' }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isSel ? 'bold' : 'normal', color: isHidden ? '#9ca3af' : '#1f2937' }}>{getLayerName(el)}</span>
                <button onClick={(e) => { e.stopPropagation(); updateElement(el.id, { visible: isHidden ? true : false }); }}
                  title={isHidden ? 'Hiện lớp' : 'Ẩn lớp'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: isHidden ? '#d1d5db' : '#6b7280' }}>
                  <Icon name={isHidden ? 'eyeOff' : 'eye'} size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderProperties = () => {
    if (selectedIds.length === 0 || currentTool !== 'select' || isRulerMode) return null;
    if (multiSelect) {
      return (
        <div style={{ padding: '15px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '16px', margin: 0 }}>Đã chọn {selectedIds.length} đối tượng</h2>
            <button onClick={() => setIsRightOpen(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>
              <Icon name="x" size={18} />
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>Kéo bất kỳ đối tượng để di chuyển cả nhóm</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginBottom: '15px' }}>
            <button onClick={() => alignSelected('left')} title="Căn trái" style={{ padding: '8px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}><Icon name="alignLeft" size={16} /></button>
            <button onClick={() => alignSelected('center-h')} title="Căn giữa ngang" style={{ padding: '8px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}><Icon name="alignCenterH" size={16} /></button>
            <button onClick={() => alignSelected('right')} title="Căn phải" style={{ padding: '8px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}><Icon name="alignRight" size={16} /></button>
            <button onClick={() => alignSelected('top')} title="Căn trên" style={{ padding: '8px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}><Icon name="alignTop" size={16} /></button>
            <button onClick={() => alignSelected('center-v')} title="Căn giữa dọc" style={{ padding: '8px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}><Icon name="alignCenterV" size={16} /></button>
            <button onClick={() => alignSelected('bottom')} title="Căn dưới" style={{ padding: '8px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}><Icon name="alignBottom" size={16} /></button>
          </div>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            <button onClick={() => centerSelected()} style={{ flex: 1, padding: '8px', background: '#bfdbfe', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Căn giữa canvas</button>
            <button onClick={duplicateSelected} style={{ flex: 1, padding: '8px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Icon name="copy" size={14} /> Nhân bản</button>
          </div>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            <button onClick={() => moveLayer('up')} style={{ flex: 1, padding: '8px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Icon name="up" size={14} /> Lên trên</button>
            <button onClick={() => moveLayer('down')} style={{ flex: 1, padding: '8px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Icon name="down" size={14} /> Xuống dưới</button>
          </div>
          <button onClick={deleteSelected} style={{ marginTop: 'auto', padding: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Xóa {selectedIds.length} đối tượng</button>
        </div>
      );
    }
    if (!selectedEl) return null;
    const isShapeWithFill = ['rect', 'circle', 'polygon', 'star', 'bentShape'].includes(selectedEl.type);
    return (
      <div style={{ padding: '15px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '16px', margin: 0 }}>Thuộc tính</h2>
          <button onClick={() => setIsRightOpen(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>
            <Icon name="x" size={18} />
          </button>
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '15px' }}>
          {['basic', 'effects', 'colors'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '8px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: activeTab === t ? '2px solid #3b82f6' : 'none', color: activeTab === t ? '#3b82f6' : '#6b7280', fontWeight: 'bold' }}>{t === 'basic' ? 'Cơ bản' : t === 'effects' ? 'Hiệu ứng' : 'Màu sắc'}</button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'basic' && (
            <div>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <button className="btn" style={{ flex: 1, background: '#e5e7eb', fontSize: '12px', padding: '8px 0' }} onClick={() => moveLayer('up')}>Lên trên</button>
                <button className="btn" style={{ flex: 1, background: '#e5e7eb', fontSize: '12px', padding: '8px 0' }} onClick={() => moveLayer('down')}>Xuống dưới</button>
                <button className="btn" style={{ flex: 1, background: '#bfdbfe', fontSize: '12px', fontWeight: 'bold', padding: '8px 0' }} onClick={centerSelected}>Căn giữa</button>
                <button className="btn" style={{ flex: 1, background: '#e5e7eb', fontSize: '12px', padding: '8px 0' }} onClick={duplicateSelected}>Nhân bản</button>
              </div>

              {selectedEl.type === 'text' && (
                <div style={{ marginBottom: '15px' }}>
                  {/* KIỂU CHỮ */}
                  <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                    <h4 style={{ fontWeight: 'bold', color: '#065f46', marginBottom: '8px', fontSize: '13px' }}>Kiểu chữ</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                      {TEXT_STYLES.map(style => {
                        const isActive = getActiveTextStyleId(selectedEl) === style.id;
                        return (
                          <button key={style.id}
                            onClick={() => updateElement(selectedId, {
                              fontFamily: style.fontFamily,
                              fontSize: style.fontSize,
                              fontStyle: style.fontStyle,
                              fill: style.fill,
                              letterSpacing: style.letterSpacing,
                              lineHeight: style.lineHeight,
                            })}
                            style={{
                              padding: '8px 6px', borderRadius: '4px',
                              border: isActive ? '2px solid #10b981' : '1px solid #ccc',
                              cursor: 'pointer', background: isActive ? '#d1fae5' : '#fff',
                              fontFamily: style.fontFamily,
                              fontWeight: style.fontStyle.includes('bold') ? 'bold' : 'normal',
                              fontSize: '12px', color: '#1f2937',
                            }}>
                            {style.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* HIỆU ỨNG CHỮ */}
                  <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                    <h4 style={{ fontWeight: 'bold', color: '#991b1b', marginBottom: '8px', fontSize: '13px' }}>Hiệu ứng chữ</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
                      {TEXT_EFFECTS.map(effect => {
                        const isActive = (selectedEl.textEffect || 'none') === effect.id;
                        return (
                          <button key={effect.id}
                            onClick={() => updateElement(selectedId, { textEffect: effect.id })}
                            style={{
                              padding: '6px 4px', borderRadius: '4px',
                              border: isActive ? '2px solid #ef4444' : '1px solid #ccc',
                              cursor: 'pointer', background: isActive ? '#fee2e2' : '#fff',
                              fontSize: '11px', fontWeight: 'bold', color: '#1f2937',
                            }}>
                            {effect.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* HOA/THƯỜNG */}
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Kiểu chữ hoa/thường:</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[
                        { id: 'none', label: 'Aa' },
                        { id: 'uppercase', label: 'AA' },
                        { id: 'lowercase', label: 'aa' },
                        { id: 'capitalize', label: 'Ab' },
                      ].map(t => {
                        const isActive = (selectedEl.textTransform || 'none') === t.id;
                        return (
                          <button key={t.id}
                            onClick={() => updateElement(selectedId, { textTransform: t.id })}
                            style={{
                              flex: 1, padding: '6px', borderRadius: '4px',
                              border: isActive ? '2px solid #3b82f6' : '1px solid #ccc',
                              background: isActive ? '#dbeafe' : '#fff',
                              cursor: 'pointer', fontSize: '13px', fontWeight: 'bold',
                            }}>
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* NỘI DUNG CHỮ */}
                  <div className="input-group" style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px' }}>Nội dung chữ:</label>
                    <input type="text" value={selectedEl.text} onChange={(e) => { const v = e.target.value; setElements(elements.map(el => el.id === selectedId ? { ...el, text: v } : el)); }} onBlur={() => saveToHistory(elements)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }} />
                  </div>

                  {/* FONT */}
                  <div className="input-group" style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px' }}>Font chữ:</label>
                    <select value={selectedEl.fontFamily} onChange={(e) => updateElement(selectedId, { fontFamily: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="Montserrat">Montserrat</option><option value="Roboto">Roboto</option><option value="Anton">Anton</option><option value="Bebas Neue">Bebas Neue</option><option value="Dancing Script">Dancing Script</option>
                      <option value="Bungee">Bungee</option><option value="Orbitron">Orbitron</option><option value="Permanent Marker">Permanent Marker</option>
                    </select>
                  </div>

                  {/* B I U */}
                  <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                    <button className="btn" style={{ flex: 1, background: selectedEl.fontStyle?.includes('bold') ? '#bfdbfe' : '#fff', border: '1px solid #ccc', display: 'flex', justifyContent: 'center', padding: '8px' }} onClick={() => updateElement(selectedId, { fontStyle: toggleFontStyle(selectedEl, 'bold') })} title="In đậm"><Icon name="bold" size={16} /></button>
                    <button className="btn" style={{ flex: 1, background: selectedEl.fontStyle?.includes('italic') ? '#bfdbfe' : '#fff', border: '1px solid #ccc', display: 'flex', justifyContent: 'center', padding: '8px' }} onClick={() => updateElement(selectedId, { fontStyle: toggleFontStyle(selectedEl, 'italic') })} title="In nghiêng"><Icon name="italic" size={16} /></button>
                    <button className="btn" style={{ flex: 1, background: selectedEl.textDecoration === 'underline' ? '#bfdbfe' : '#fff', border: '1px solid #ccc', display: 'flex', justifyContent: 'center', padding: '8px' }} onClick={() => updateElement(selectedId, { textDecoration: selectedEl.textDecoration === 'underline' ? '' : 'underline' })} title="Gạch chân"><Icon name="underline" size={16} /></button>
                  </div>

                  {/* LETTER SPACING + LINE HEIGHT */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ fontSize: '12px' }}>Khoảng cách chữ: {selectedEl.letterSpacing || 0}px</label>
                      <input type="range" min="-5" max="20" value={selectedEl.letterSpacing || 0} onChange={(e) => updateElement(selectedId, { letterSpacing: parseInt(e.target.value) })} style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px' }}>Chiều cao dòng: {selectedEl.lineHeight || 1.2}</label>
                      <input type="range" min="0.8" max="3" step="0.1" value={selectedEl.lineHeight || 1.2} onChange={(e) => updateElement(selectedId, { lineHeight: parseFloat(e.target.value) })} style={{ width: '100%' }} />
                    </div>
                  </div>

                  {/* VIỀN CHỮ */}
                  <div style={{ background: '#dbeafe', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <input type="checkbox" checked={selectedEl.textStrokeEnabled || false} onChange={(e) => updateElement(selectedId, { textStrokeEnabled: e.target.checked })} />
                      <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Viền chữ</label>
                    </div>
                    {selectedEl.textStrokeEnabled && (<>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                        <label style={{ fontSize: '12px' }}>Màu viền:</label>
                        <input type="color" value={selectedEl.textStrokeColor || '#000000'} onChange={(e) => updateElement(selectedId, { textStrokeColor: e.target.value })} style={{ width: '30px', height: '25px' }} />
                      </div>
                      <label style={{ fontSize: '12px' }}>Độ dày: {selectedEl.textStrokeWidth || 0}px</label>
                      <input type="range" min="0" max="10" value={selectedEl.textStrokeWidth || 0} onChange={(e) => updateElement(selectedId, { textStrokeWidth: parseInt(e.target.value) })} style={{ width: '100%' }} />
                    </>)}
                  </div>

                  {/* BẺ CONG */}
                  <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '6px' }}>
                    <h4 style={{ fontWeight: 'bold', color: '#92400e', marginBottom: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Icon name="bend" size={16} /> Bẻ cong chữ</h4>
                    <label style={{ fontSize: '13px' }}>Độ cong: {selectedEl.bendAmount || 0}%</label>
                    <input type="range" min="-100" max="100" value={selectedEl.bendAmount || 0} onChange={(e) => updateElement(selectedId, { bendAmount: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '8px' }} />
                    <button className="btn" style={{ width: '100%', background: '#fde68a', fontSize: '12px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }} onClick={() => updateElement(selectedId, { bendAmount: 0 })}><Icon name="rotateCcw" size={12} /> Đặt lại</button>
                  </div>
                </div>
              )}

              {SHAPE_BENDABLE.includes(selectedEl.type) && (
                <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#92400e', marginBottom: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Icon name="bend" size={16} /> Bẻ cong hình</h4>
                  {!bendMode && selectedEl.type !== 'bentShape' && (
                    <button className="btn" style={{ width: '100%', background: '#fbbf24', fontWeight: 'bold', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={convertToBentShape}>
                      <Icon name="edit" size={14} /> Bật chế độ bẻ cong
                    </button>
                  )}
                  {!bendMode && selectedEl.type === 'bentShape' && (
                    <button className="btn" style={{ width: '100%', background: '#fbbf24', fontWeight: 'bold', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => setBendMode(true)}>
                      <Icon name="edit" size={14} /> Chỉnh sửa độ cong
                    </button>
                  )}
                  {bendMode && (<>
                    <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '8px', lineHeight: 1.4 }}>Kéo các điểm điều khiển để uốn cong hình. Nhấp đúp để đặt lại cạnh.</p>
                    <button className="btn" style={{ width: '100%', background: '#10b981', color: 'white', fontWeight: 'bold', marginBottom: '6px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => setBendMode(false)}>
                      <Icon name="check" size={14} /> Hoàn tất
                    </button>
                    <button className="btn" style={{ width: '100%', background: '#fee2e2', color: '#ef4444', fontSize: '12px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }} onClick={() => { const nb = (selectedEl.bends || []).map(() => ({ x: 0, y: 0 })); saveToHistory(elements.map(it => it.id === selectedId ? { ...it, bends: nb } : it)); }}>
                      <Icon name="rotateCcw" size={12} /> Đặt lại toàn bộ
                    </button>
                  </>)}
                </div>
              )}

              {['rect', 'circle', 'polygon', 'star', 'bentShape'].includes(selectedEl.type) && (
                <div style={{ background: '#e0e7ff', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#3730a3', marginBottom: '10px', fontSize: '14px' }}>Tùy chỉnh hình dạng</h4>
                  {selectedEl.type === 'rect' && <><label style={{ fontSize: '13px' }}>Bo góc: {selectedEl.cornerRadius || 0}px</label><input type="range" min="0" max="100" value={selectedEl.cornerRadius || 0} onChange={(e) => updateElement(selectedId, { cornerRadius: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} /></>}
                  {['circle', 'polygon', 'bentShape'].includes(selectedEl.type) && ['circle', 'polygon'].includes(getBaseType(selectedEl)) && <><label style={{ fontSize: '13px' }}>Bán kính: {Math.round(selectedEl.radius)}px</label><input type="range" min="10" max="300" value={selectedEl.radius || 80} onChange={(e) => updateElement(selectedId, { radius: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} /></>}
                  {getBaseType(selectedEl) === 'polygon' && <><label style={{ fontSize: '13px' }}>Số cạnh: {selectedEl.sides}</label><input type="range" min="3" max="20" value={selectedEl.sides || 3} onChange={(e) => { const ns = parseInt(e.target.value); const nb = Array.from({ length: ns }, (_, i) => (selectedEl.bends && selectedEl.bends[i]) || { x: 0, y: 0 }); updateElement(selectedId, { sides: ns, bends: selectedEl.type === 'bentShape' ? nb : selectedEl.bends }); }} style={{ width: '100%', marginBottom: '10px' }} /></>}
                  {getBaseType(selectedEl) === 'star' && (<>
                    <label style={{ fontSize: '13px' }}>Số góc: {selectedEl.numPoints}</label><input type="range" min="3" max="20" value={selectedEl.numPoints || 5} onChange={(e) => { const n = parseInt(e.target.value); const nb = Array.from({ length: n * 2 }, (_, i) => (selectedEl.bends && selectedEl.bends[i]) || { x: 0, y: 0 }); updateElement(selectedId, { numPoints: n, bends: selectedEl.type === 'bentShape' ? nb : selectedEl.bends }); }} style={{ width: '100%', marginBottom: '10px' }} />
                    <label style={{ fontSize: '13px' }}>Độ sắc: {selectedEl.innerRadius || 40}px</label><input type="range" min="10" max={selectedEl.outerRadius - 5} value={selectedEl.innerRadius || 40} onChange={(e) => updateElement(selectedId, { innerRadius: parseInt(e.target.value) })} style={{ width: '100%' }} />
                  </>)}
                </div>
              )}

              {['rect', 'circle', 'polygon', 'star', 'bentShape', 'arrow'].includes(selectedEl.type) && (
                <div style={{ background: '#fce7f3', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#831843', marginBottom: '10px', fontSize: '14px' }}>Kiểu nét viền</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <input type="checkbox" checked={selectedEl.dashEnabled || false} onChange={(e) => updateElement(selectedId, { dashEnabled: e.target.checked })} />
                    <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Nét đứt</label>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '8px' }}>
                    <div><label style={{ fontSize: '11px' }}>Đầu nét:</label><select value={selectedEl.lineCap || 'butt'} onChange={(e) => updateElement(selectedId, { lineCap: e.target.value })} style={{ width: '100%', padding: '4px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc' }}><option value="butt">Phẳng</option><option value="round">Tròn</option><option value="square">Vuông</option></select></div>
                    <div><label style={{ fontSize: '11px' }}>Nối nét:</label><select value={selectedEl.lineJoin || 'miter'} onChange={(e) => updateElement(selectedId, { lineJoin: e.target.value })} style={{ width: '100%', padding: '4px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc' }}><option value="miter">Nhọn</option><option value="round">Tròn</option><option value="bevel">Vát</option></select></div>
                  </div>
                  {selectedEl.dashEnabled && (
                    <div>
                      <label style={{ fontSize: '12px' }}>Mẫu nét:</label>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                        {[[5,5],[10,5],[15,5],[3,3],[20,10]].map((pat, i) => (
                          <button key={i} onClick={() => updateElement(selectedId, { dashPattern: pat })} style={{ flex: 1, padding: '5px', background: JSON.stringify(selectedEl.dashPattern) === JSON.stringify(pat) ? '#bfdbfe' : '#fff', border: '1px solid #ccc', borderRadius: '3px', fontSize: '9px', cursor: 'pointer' }}>{pat.join('-')}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedEl.type === 'image' && (
                <button className="btn" style={{ width: '100%', background: '#8b5cf6', color: 'white', marginTop: '15px', padding: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={handleRemoveBg} disabled={isProcessing}>
                  <Icon name="sparkles" size={16} /> Tách nền bằng AI
                </button>
              )}
            </div>
          )}

          {activeTab === 'effects' && (
            <div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '13px' }}>Độ mờ: {Math.round((selectedEl.opacity ?? 1) * 100)}%</label>
                <input type="range" min="0" max="1" step="0.05" value={selectedEl.opacity ?? 1} onChange={(e) => updateElement(selectedId, { opacity: parseFloat(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Chế độ hòa trộn:</label>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginTop: '4px' }}>
                  <select value={selectedEl.blendMode || 'source-over'} onChange={(e) => updateElement(selectedId, { blendMode: e.target.value })}
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <option value="source-over">Bình thường</option>
                    <option value="multiply">Nhân (Multiply)</option>
                    <option value="screen">Màn hình (Screen)</option>
                    <option value="overlay">Chồng lớp (Overlay)</option>
                    <option value="darken">Tối hơn (Darken)</option>
                    <option value="lighten">Sáng hơn (Lighten)</option>
                    <option value="color-dodge">Color Dodge</option>
                    <option value="color-burn">Color Burn</option>
                    <option value="hard-light">Hard Light</option>
                    <option value="soft-light">Soft Light</option>
                    <option value="difference">Difference</option>
                    <option value="exclusion">Exclusion</option>
                  </select>
                  <button onClick={() => setBgColor(isDarkColor(bgColor) ? '#ffffff' : '#1f2937')}
                    title="Đổi nền sáng/tối để kiểm tra"
                    style={{ padding: '8px 10px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Icon name={isDarkColor(bgColor) ? 'sun' : 'moon'} size={16} />
                  </button>
                </div>
                {selectedEl.blendMode && selectedEl.blendMode !== 'source-over' && (
                  <div style={{ marginTop: '8px', padding: '8px', background: '#fef3c7', borderRadius: '4px', border: '1px solid #fde047' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#92400e', lineHeight: 1.5, display: 'flex', gap: '6px' }}>
                      <Icon name="alert" size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <span>Chế độ hòa trộn kết hợp đối tượng với nền và các lớp bên dưới. Nếu đối tượng biến mất, hãy đổi màu nền hoặc vị trí.</span>
                    </p>
                  </div>
                )}
              </div>

              {selectedEl.type === 'image' && (
                <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#14532d', marginBottom: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Icon name="sliders" size={16} /> Bộ lọc ảnh</h4>
                  <label style={{ fontSize: '12px' }}>Độ sáng: {selectedEl.brightness ?? 0}</label>
                  <input type="range" min="-1" max="1" step="0.05" value={selectedEl.brightness ?? 0} onChange={(e) => updateElement(selectedId, { brightness: parseFloat(e.target.value) })} style={{ width: '100%', marginBottom: '6px' }} />
                  <label style={{ fontSize: '12px' }}>Độ tương phản: {selectedEl.contrast ?? 0}</label>
                  <input type="range" min="-100" max="100" step="1" value={selectedEl.contrast ?? 0} onChange={(e) => updateElement(selectedId, { contrast: parseFloat(e.target.value) })} style={{ width: '100%', marginBottom: '6px' }} />
                  <label style={{ fontSize: '12px' }}>Độ mờ: {selectedEl.blurRadius ?? 0}px</label>
                  <input type="range" min="0" max="30" step="1" value={selectedEl.blurRadius ?? 0} onChange={(e) => updateElement(selectedId, { blurRadius: parseFloat(e.target.value) })} style={{ width: '100%', marginBottom: '6px' }} />
                  <label style={{ fontSize: '12px' }}>Độ bão hòa: {selectedEl.saturate ?? 1}</label>
                  <input type="range" min="0" max="3" step="0.1" value={selectedEl.saturate ?? 1} onChange={(e) => updateElement(selectedId, { saturate: parseFloat(e.target.value) })} style={{ width: '100%' }} />
                  <button className="btn" style={{ width: '100%', background: '#e5e7eb', fontSize: '12px', padding: '6px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }} onClick={() => updateElement(selectedId, { brightness: 0, contrast: 0, blurRadius: 0, saturate: 1 })}>
                    <Icon name="rotateCcw" size={12} /> Đặt lại bộ lọc
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                <input type="checkbox" checked={selectedEl.shadowEnabled || false} onChange={(e) => updateElement(selectedId, { shadowEnabled: e.target.checked })} />
                <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Đổ bóng</label>
              </div>
              {selectedEl.shadowEnabled && (
                <div style={{ paddingLeft: '10px', borderLeft: '2px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                    <label style={{ fontSize: '12px' }}>Màu bóng:</label>
                    <input type="color" value={selectedEl.shadowColor || '#000000'} onChange={(e) => updateElement(selectedId, { shadowColor: e.target.value })} style={{ width: '30px', height: '25px' }} />
                  </div>
                  <label style={{ fontSize: '12px' }}>Độ mờ bóng: {selectedEl.shadowBlur ?? 10}px</label>
                  <input type="range" min="0" max="50" value={selectedEl.shadowBlur ?? 10} onChange={(e) => updateElement(selectedId, { shadowBlur: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '5px' }} />
                  <label style={{ fontSize: '12px' }}>Lệch ngang: {selectedEl.shadowOffsetX ?? 5}px</label>
                  <input type="range" min="-20" max="20" value={selectedEl.shadowOffsetX ?? 5} onChange={(e) => updateElement(selectedId, { shadowOffsetX: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '5px' }} />
                  <label style={{ fontSize: '12px' }}>Lệch dọc: {selectedEl.shadowOffsetY ?? 5}px</label>
                  <input type="range" min="-20" max="20" value={selectedEl.shadowOffsetY ?? 5} onChange={(e) => updateElement(selectedId, { shadowOffsetY: parseInt(e.target.value) })} style={{ width: '100%' }} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'colors' && (
            <div>
              {['text', 'rect', 'circle', 'polygon', 'star', 'path', 'icon', 'bentShape'].includes(selectedEl.type) && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '13px' }}>{selectedEl.type === 'text' ? 'Màu chữ:' : 'Màu nền:'}</label>
                  <input type="color" value={selectedEl.fill === 'transparent' ? '#ffffff' : (selectedEl.fill || '#3b82f6')} onChange={(e) => updateElement(selectedId, { fill: e.target.value })} style={{ height: '30px', cursor: 'pointer', width: '100%', marginBottom: '10px' }} />

                  {isShapeWithFill && (
                    <div style={{ background: '#f3e8ff', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
                        <button onClick={() => updateElement(selectedId, { fillType: 'solid' })} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', fontSize: '12px', background: (selectedEl.fillType !== 'gradient') ? '#bfdbfe' : '#fff', fontWeight: 'bold' }}>Đơn sắc</button>
                        <button onClick={() => updateElement(selectedId, { fillType: 'gradient' })} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', fontSize: '12px', background: selectedEl.fillType === 'gradient' ? '#bfdbfe' : '#fff', fontWeight: 'bold' }}>Chuyển sắc</button>
                      </div>
                      {selectedEl.fillType === 'gradient' && (<>
                        <div style={{ display: 'flex', gap: '5px', marginBottom: '6px' }}>
                          <div style={{ flex: 1 }}><label style={{ fontSize: '11px' }}>Màu đầu:</label><input type="color" value={selectedEl.gradientColor1 || '#3b82f6'} onChange={(e) => updateElement(selectedId, { gradientColor1: e.target.value })} style={{ width: '100%', height: '28px' }} /></div>
                          <div style={{ flex: 1 }}><label style={{ fontSize: '11px' }}>Màu cuối:</label><input type="color" value={selectedEl.gradientColor2 || '#8b5cf6'} onChange={(e) => updateElement(selectedId, { gradientColor2: e.target.value })} style={{ width: '100%', height: '28px' }} /></div>
                        </div>
                        <label style={{ fontSize: '12px' }}>Góc: {selectedEl.gradientAngle || 0}°</label>
                        <input type="range" min="0" max="360" value={selectedEl.gradientAngle || 0} onChange={(e) => updateElement(selectedId, { gradientAngle: parseInt(e.target.value) })} style={{ width: '100%' }} />
                      </>)}
                    </div>
                  )}

                  {['rect', 'circle', 'polygon', 'star', 'path', 'icon', 'bentShape'].includes(selectedEl.type) && (<>
                    <label style={{ fontSize: '13px' }}>Màu viền:</label>
                    <input type="color" value={selectedEl.stroke || '#000000'} onChange={(e) => updateElement(selectedId, { stroke: e.target.value })} style={{ height: '30px', cursor: 'pointer', width: '100%', marginBottom: '10px' }} />
                    <label style={{ fontSize: '13px' }}>Độ dày viền: {selectedEl.strokeWidth || 0}px</label>
                    <input type="range" min="0" max="20" value={selectedEl.strokeWidth || 0} onChange={(e) => updateElement(selectedId, { strokeWidth: parseInt(e.target.value) })} style={{ width: '100%' }} />
                  </>)}
                </div>
              )}
            </div>
          )}
        </div>
        <button onClick={deleteSelected} style={{ marginTop: '10px', padding: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Xóa đối tượng này</button>
      </div>
    );
  };

  if (view === 'lobby') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f7', padding: '40px 20px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ color: '#1f2937', fontSize: '48px', marginBottom: '8px' }}><span style={{ color: '#8b5cf6' }}>Pixel</span>Craft</h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Chọn dự án để tiếp tục, hoặc tạo dự án mới</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
            <button onClick={handleCreateProject} style={{ padding: '14px 32px', fontSize: '16px', fontWeight: 'bold', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="plus" size={18} /> Tạo dự án mới
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {projects.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#9ca3af', padding: '60px 20px' }}>Chưa có dự án nào. Bấm "Tạo dự án mới" để bắt đầu.</div>}
            {projects.map(p => (
              <div key={p.id} onClick={() => openProject(p.id)} style={{ background: 'white', borderRadius: '12px', padding: '20px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.05)', position: 'relative' }}>
                <div style={{ marginBottom: '10px', color: '#8b5cf6' }}><Icon name="file" size={32} /></div>
                <h3 style={{ margin: '0 0 6px', color: '#1f2937', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>{new Date(p.updatedAt).toLocaleDateString('vi-VN')}</p>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '4px' }}>
                  <button onClick={e => { e.stopPropagation(); renameProject(p.id); }} title="Đổi tên" style={{ background: '#dbeafe', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}><Icon name="edit" size={13} /></button>
                  <button onClick={e => { e.stopPropagation(); deleteProject(p.id); }} title="Xóa" style={{ background: '#fee2e2', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><Icon name="trash" size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {promptState && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '10px', padding: '20px', maxWidth: '400px', width: '100%' }}>
              <h3 style={{ margin: '0 0 15px', fontSize: '16px' }}>{promptState.title}</h3>
              <input autoFocus type="text" value={promptState.value} onChange={(e) => setPromptState({ ...promptState, value: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') handlePromptConfirm(); if (e.key === 'Escape') handlePromptCancel(); }} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', marginBottom: '15px', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={handlePromptCancel} style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Hủy</button>
                <button onClick={handlePromptConfirm} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Xác nhận</button>
              </div>
            </div>
          </div>
        )}
        {confirmState && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '10px', padding: '20px', maxWidth: '400px', width: '100%' }}>
              <h3 style={{ margin: '0 0 15px', fontSize: '15px', lineHeight: 1.5 }}>{confirmState.title}</h3>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={handleConfirmNo} style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Hủy</button>
                <button onClick={handleConfirmYes} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Xác nhận</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container" style={{ flexDirection: 'column' }} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {isDragging && <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(59, 130, 246, 0.8)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '10px dashed white', boxSizing: 'border-box' }}><h2 style={{ color: 'white', fontSize: '28px' }}>Thả tệp ảnh hoặc .json vào đây</h2></div>}

      {isProcessing && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ border: '4px solid rgba(243,243,243,0.3)', borderTop: '4px solid #8b5cf6', borderRadius: '50%', width: '56px', height: '56px', animation: 'spin 1s linear infinite' }}></div>
          <h3 style={{ marginTop: '20px', fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="sparkles" size={20} /> {processingText}
          </h3>
          <p style={{ marginTop: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Vui lòng đợi trong giây lát</p>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', background: '#d1d5db', padding: '6px 10px 0', overflowX: 'auto', flexShrink: 0, borderBottom: '1px solid #9ca3af', minHeight: '36px', WebkitOverflowScrolling: 'touch' }}>
        {openProjectIds.map(id => {
          const proj = projects.find(p => p.id === id); if (!proj) return null;
          const isActive = currentProjectId === id;
          return (
            <div key={id} onClick={() => switchProject(id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: isActive ? '#fff' : '#e5e7eb', color: '#1f2937', borderRadius: '6px 6px 0 0', cursor: 'pointer', fontSize: '12px', fontWeight: isActive ? 'bold' : 'normal', maxWidth: '180px', minWidth: '80px', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: isActive ? 'inset 0 2px 0 #3b82f6' : 'none' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{proj.name}</span>
              <button onClick={(e) => { e.stopPropagation(); closeProjectTab(id); }} title="Đóng tab" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0 2px', display: 'flex', alignItems: 'center' }}><Icon name="x" size={14} /></button>
            </div>
          );
        })}
        <button ref={addTabBtnRef} onClick={openAddTabPopup} title="Thêm tab" style={{ padding: '5px 10px', background: showAddTabPopup ? '#3b82f6' : 'rgba(255,255,255,0.4)', color: showAddTabPopup ? '#fff' : '#374151', border: '1px solid #9ca3af', borderRadius: '4px 4px 0 0', cursor: 'pointer', marginLeft: '4px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <Icon name="plus" size={14} />
        </button>
      </div>

      {showAddTabPopup && (<>
        <div onClick={() => setShowAddTabPopup(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
        <div style={{ position: 'fixed', top: addTabPopupPos.top, left: addTabPopupPos.left, background: 'white', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', width: '280px', zIndex: 999, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #eee', background: '#f9fafb' }}><div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Thêm tab</div></div>
          <button onClick={() => { setShowAddTabPopup(false); handleCreateProject(); }} style={{ ...MENU_ITEM, fontWeight: 'bold', color: '#10b981', borderBottom: '1px solid #eee' }}>
            <Icon name="plus" size={16} /> Tạo dự án mới
          </button>
          <div style={{ padding: '8px 14px 4px', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold', borderBottom: '1px solid #f3f4f6' }}>Dự án có sẵn</div>
          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {availableProjects.length === 0 ? <div style={{ padding: '14px', fontSize: '12px', color: '#9ca3af', textAlign: 'center', fontStyle: 'italic' }}>Không có dự án khả dụng</div> :
              availableProjects.map(p => (<button key={p.id} onClick={() => { setShowAddTabPopup(false); openProject(p.id); }} style={{ ...MENU_ITEM, borderBottom: '1px solid #f9fafb' }}><Icon name="file" size={14} /> {p.name}</button>))}
          </div>
        </div>
      </>)}

      {showProjectMenu && (<>
        <div onClick={() => setShowProjectMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
        <div style={{ position: 'fixed', top: projectMenuPos.top, left: projectMenuPos.left, background: 'white', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', minWidth: '230px', zIndex: 999, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #eee', background: '#f9fafb' }}>
            <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Dự án hiện tại</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f2937', marginTop: '2px' }}>{projects.find(p => p.id === currentProjectId)?.name || 'Chưa đặt tên'}</div>
          </div>
          <button onClick={() => { setShowProjectMenu(false); handleExitProject(); }} style={MENU_ITEM}><Icon name="logout" size={14} /> Thoát dự án</button>
          <button onClick={handleNewTabProject} style={MENU_ITEM}><Icon name="plus" size={14} /> Dự án mới</button>
        </div>
      </>)}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'space-between', background: '#e5e7eb', padding: isMobile ? '8px 10px' : '10px 15px', borderBottom: '1px solid #d1d5db', gap: '10px', flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: isMobile ? 'auto' : 'visible', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', gap: isMobile ? '8px' : '10px', alignItems: 'center', flexWrap: isMobile ? 'nowrap' : 'wrap', flexShrink: 0 }}>
          <button ref={projectBtnRef} onClick={openProjectMenu} style={{ padding: '5px 10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', border: '1px solid #ccc', background: showProjectMenu ? '#3b82f6' : '#fff', color: showProjectMenu ? '#fff' : '#333', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Icon name="folder" size={14} /> Dự án
          </button>
          <button onClick={() => setShowLayers(!showLayers)} style={{ padding: '5px 10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', border: '1px solid #ccc', background: showLayers ? '#3b82f6' : '#fff', color: showLayers ? '#fff' : '#333', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Icon name="layers" size={14} /> Lớp
          </button>
          <h2 style={{ fontSize: '18px', color: '#1f2937', margin: 0, fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 }}><span style={{ color: '#8b5cf6' }}>Pixel</span>Craft</h2>
          <select value={`${canvasSize.width}x${canvasSize.height}`} onChange={(e) => { const [w, h] = e.target.value.split('x').map(Number); setCanvasSize({ width: w, height: h }); }} style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
            <option value="800x600">800x600</option><option value="1080x1080">1080x1080</option><option value="1080x1920">1080x1920</option><option value="1920x1080">1920x1080</option><option value="1200x630">1200x630</option>
          </select>
          <div style={{ display: 'flex', gap: '5px', borderLeft: '1px solid #ccc', paddingLeft: '10px', flexShrink: 0 }}>
            <button style={{ border: '1px solid #ccc', background: currentTool === 'brush' ? '#3b82f6' : '#fff', color: currentTool === 'brush' ? '#fff' : '#333', padding: '5px 10px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }} onClick={() => { setCurrentTool('brush'); setIsRulerMode(false); }}>
              <Icon name="brush" size={14} /> Bút
            </button>
            <button style={{ border: '1px solid #ccc', background: isRulerMode ? '#10b981' : '#fff', color: isRulerMode ? '#fff' : '#333', padding: '5px 10px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }} onClick={() => { setIsRulerMode(true); setCurrentTool('select'); }}>
              <Icon name="ruler" size={14} /> Thước
            </button>
            <button style={{ border: '1px solid #ccc', background: currentTool === 'select' && !isRulerMode ? '#3b82f6' : '#fff', color: currentTool === 'select' && !isRulerMode ? '#fff' : '#333', padding: '5px 10px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }} onClick={() => { setCurrentTool('select'); setIsRulerMode(false); }}>
              <Icon name="cursor" size={14} /> Chọn
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', borderLeft: '1px solid #ccc', paddingLeft: '10px', flexWrap: 'nowrap', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Màu:</label><input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} style={{ width: '25px', height: '25px', padding: 0, border: 'none' }} /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><label style={{ fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Độ dày:</label><input type="range" min="1" max="30" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} style={{ width: '60px' }} /><span style={{ fontSize: '12px', width: '15px' }}>{brushSize}</span></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'nowrap', flexShrink: 0 }}>
          <IconBtn icon="save" onClick={saveProject} title="Lưu dự án (.json)" />
          <IconBtn icon="folderOpen" onClick={() => fileInputRef.current.click()} title="Mở dự án (.json)" />
          <input type="file" accept=".json" ref={fileInputRef} onChange={loadProject} style={{ display: 'none' }} />
          <IconBtn icon="undo" onClick={handleUndo} disabled={historyStep <= 0} title="Hoàn tác (Ctrl+Z)" />
          <IconBtn icon="redo" onClick={handleRedo} disabled={historyStep >= history.length - 1} title="Làm lại (Ctrl+Y)" />
          <IconBtn icon="trash" variant="danger" onClick={handleReset} label="Xóa hết" />
          <select value={exportScale} onChange={(e) => setExportScale(parseInt(e.target.value))} title="Độ phân giải xuất ảnh" style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px', fontWeight: 'bold' }}>
            <option value={1}>1x</option><option value={2}>2x</option><option value={3}>3x</option><option value={4}>4x</option>
          </select>
          <button className="btn btn-success" onClick={exportPng} style={{ padding: '5px 12px', fontSize: '12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
            <Icon name="download" size={14} /> Xuất PNG
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
        <div style={{ width: isLeftOpen ? (isMobile ? '100%' : '250px') : '0px', overflow: 'hidden', transition: 'width 0.3s', background: 'white', position: 'absolute', left: 0, zIndex: 100, height: '100%', borderRight: isLeftOpen ? '1px solid #ddd' : 'none' }}>
          <div style={{ padding: '15px', overflowY: 'auto', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '16px', margin: 0 }}>Thư viện hình</h2>
              <button onClick={() => setIsLeftOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', color: '#6b7280' }}><Icon name="x" size={20} /></button>
            </div>
            <ShapeLibrary onAddBasicShape={addBasicShape} onAddIcon={addLucideIcon} onAddPathShape={addPathShape} />
            <button className="btn" style={{ width: '100%', background: '#fef08a', color: '#854d0e', fontWeight: 'bold', marginBottom: '10px', border: '1px solid #fde047', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => setIsBuilderOpen(true)}>
              <Icon name="sparkles" size={14} /> Tạo hình tùy chỉnh
            </button>
            {customShapes.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <h3 style={{ fontSize: '13px', margin: 0 }}>Hình của bạn:</h3>
                  <button onClick={deleteAllCustomShapes} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}>Xóa tất cả</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
                  {customShapes.map((shape, idx) => (
                    <div key={shape.id || idx} style={{ position: 'relative' }}>
                      <button className="btn" style={{ width: '100%', background: '#fff', border: '1px solid #ddd', padding: '5px', display: 'flex', justifyContent: 'center' }} onClick={() => addCustomShape(shape)}>
                        <svg width="20" height="20" viewBox="0 0 100 100">
                          {shape.type === 'rect' && <rect x="10" y="20" width="80" height="60" rx={shape.cornerRadius} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />}
                          {shape.type === 'circle' && <circle cx="50" cy="50" r="40" fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />}
                          {shape.type === 'polygon' && <polygon points={getSvgPoints(50, 50, 40, shape.sides)} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />}
                          {shape.type === 'star' && <polygon points={getSvgPoints(50, 50, 40, shape.numPoints, true, 20)} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />}
                        </svg>
                      </button>
                      <button onClick={(e) => deleteCustomShape(e, shape.id)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><Icon name="x" size={10} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ padding: '10px', border: '1px dashed #ccc', borderRadius: '6px', marginBottom: '15px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}><Icon name="image" size={14} /> Tải ảnh lên:</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: '12px', width: '100%' }} />
            </div>
            <div style={{ padding: '10px', border: '1px dashed #ccc', borderRadius: '6px', marginBottom: '15px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}><Icon name="image" size={14} /> Ảnh nền canvas:</label>
              <input type="file" accept="image/*" onChange={handleBgImageUpload} style={{ fontSize: '12px', width: '100%', marginBottom: '5px' }} />
              {bgImage && <button onClick={() => setBgImage(null)} style={{ width: '100%', padding: '4px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Xóa ảnh nền</button>}
            </div>
            <div className="input-group">
              <label>Màu nền:</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
            </div>
          </div>
        </div>

        {!isMobile && <button onClick={() => setIsLeftOpen(!isLeftOpen)} style={{ position: 'absolute', left: isLeftOpen ? '250px' : '0px', top: '50%', transform: 'translateY(-50%)', zIndex: 100, background: '#fff', border: '1px solid #ccc', borderLeft: 'none', borderRadius: '0 5px 5px 0', padding: '10px 5px', cursor: 'pointer', transition: 'left 0.3s', display: 'flex', alignItems: 'center', color: '#6b7280' }}><Icon name={isLeftOpen ? 'chevronLeft' : 'chevronRight'} size={14} /></button>}

        <div ref={mainAreaRef} className="main-area" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#e5e7eb', touchAction: 'none', minHeight: 0 }}>
          {!isLeftOpen && <button onClick={() => setIsLeftOpen(true)} style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 100, background: '#fff', border: '1px solid #ccc', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6b7280' }}><Icon name="book" size={18} /></button>}
          {selectedIds.length > 0 && isMobile && !bendMode && <button onClick={() => setSelectedIds([])} title="Bỏ chọn" style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: '1px solid #d1d5db', borderRadius: '50%', width: '40px', height: '40px', zIndex: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}><Icon name="x" size={18} /></button>}
          {isMobile && mobileDragHint && selectedIds.length > 0 && !bendMode && <div style={{ position: 'absolute', top: '60px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(31,41,55,0.9)', color: 'white', padding: '8px 14px', borderRadius: '20px', fontSize: '12px', zIndex: 21, pointerEvents: 'none', whiteSpace: 'nowrap' }}>Chạm lần nữa để di chuyển</div>}
          {bendMode && <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(251,191,36,0.95)', color: '#78350f', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', zIndex: 22, pointerEvents: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="bend" size={14} /> Kéo điểm điều khiển. Nhấp đúp để đặt lại.
          </div>}

          <Stage width={mainAreaSize.width} height={mainAreaSize.height}
            onWheel={handleWheel} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
            onMouseDown={handleStageMouseDown} onMousemove={handleStageMouseMove} onMouseup={handleStageMouseUp} onTouchStart={handleStageMouseDown}
            onClick={(e) => { if (e.target === e.target.getStage() && currentTool === 'select' && !isRulerMode && !isCanvasDragging.current && !bendMode) setSelectedIds([]); }}
            onTap={(e) => { if (e.target === e.target.getStage() && currentTool === 'select' && !isRulerMode && !isCanvasDragging.current && !bendMode) setSelectedIds([]); }}
            onDragStart={(e) => { if (e.target === e.target.getStage()) isCanvasDragging.current = true; }}
            onDragEnd={(e) => { if (e.target === e.target.getStage()) { const c = clampStagePos({ x: e.target.x(), y: e.target.y() }, mainAreaSize, canvasSize, stageScale); e.target.position(c); setStagePos(c); userHasMovedCanvas.current = true; setTimeout(() => { isCanvasDragging.current = false; }, 50); } }}
            dragBoundFunc={(pos) => clampStagePos(pos, mainAreaSize, canvasSize, stageScale)}
            scaleX={stageScale} scaleY={stageScale} x={stagePos.x} y={stagePos.y}
            draggable={currentTool === 'select' && !isRulerMode && !bendMode}
            ref={stageRef}
            style={{ cursor: (currentTool === 'brush' || isRulerMode) ? 'crosshair' : 'grab' }}
          >
            <Layer ref={layerRef}>
              <CanvasBg bgImage={bgImage} bgColor={bgColor} canvasSize={canvasSize} />
              {elements.map(renderShape)}
              {isRulerMode && tempLine && <Line x={tempLine.x} y={tempLine.y} points={tempLine.points} stroke={brushColor} strokeWidth={brushSize} dash={[10, 5]} />}
              <Transformer ref={trRef} keepRatio={false} anchorSize={isMobile ? 28 : 22} anchorCornerRadius={isMobile ? 14 : 10} anchorStroke="#3b82f6" anchorStrokeWidth={2} anchorFill="#ffffff" borderStroke="#3b82f6" borderStrokeWidth={2} rotateAnchorOffset={isMobile ? 48 : 40} ignoreStroke={true}
                boundBoxFunc={(o, n) => { if (n.width < 20 || n.height < 20) return o; return n; }} />
            </Layer>
            {bendMode && selectedEl && selectedEl.type === 'bentShape' && (
              <Layer>
                <Group x={selectedEl.x || 0} y={selectedEl.y || 0} rotation={selectedEl.rotation || 0} scaleX={selectedEl.scaleX || 1} scaleY={selectedEl.scaleY || 1}>
                  {renderBendControlPoints()}
                </Group>
              </Layer>
            )}
          </Stage>

          {renderLayersPanel()}

          {zoomPopupPos.y !== null && (
            <div onMouseDown={handleZoomPopupDragStart} onTouchStart={handleZoomPopupDragStart}
              style={{ position: 'absolute', left: zoomPopupPos.x, top: zoomPopupPos.y, background: 'white', padding: '4px 6px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', gap: '4px', alignItems: 'center', zIndex: 20, userSelect: 'none', cursor: isDraggingZoom ? 'grabbing' : 'grab', touchAction: 'none' }}>
              <button onClick={() => setZoomLevel(Math.round(stageScale * 100) - 10)} style={{ width: '28px', height: '28px', border: 'none', background: '#f3f4f6', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1f2937' }}><Icon name="minus" size={14} /></button>
              {isEditingZoom ? <input autoFocus type="number" value={zoomInputValue} onChange={(e) => setZoomInputValue(e.target.value)} onBlur={commitZoom} onKeyDown={(e) => { if (e.key === 'Enter') commitZoom(); if (e.key === 'Escape') setIsEditingZoom(false); }} style={{ width: '58px', padding: '4px 2px', fontSize: '12px', fontWeight: 'bold', textAlign: 'center', border: '2px solid #3b82f6', borderRadius: '6px', outline: 'none' }} /> :
                <div onClick={() => { setZoomInputValue(Math.round(stageScale * 100).toString()); setIsEditingZoom(true); }} style={{ minWidth: '48px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#1f2937', padding: '4px 6px', borderRadius: '6px', cursor: 'text', background: '#f9fafb', border: '1px solid #e5e7eb' }}>{Math.round(stageScale * 100)}%</div>}
              <button onClick={() => setZoomLevel(Math.round(stageScale * 100) + 10)} style={{ width: '28px', height: '28px', border: 'none', background: '#f3f4f6', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1f2937' }}><Icon name="plus" size={14} /></button>
              <button onClick={() => { setStageScale(1); userHasMovedCanvas.current = false; setStagePos({ x: mainAreaSize.width / 2 - canvasSize.width / 2, y: mainAreaSize.height / 2 - canvasSize.height / 2 }); }} title="Đặt lại 100%" style={{ width: '28px', height: '28px', border: 'none', background: '#e5e7eb', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1f2937' }}><Icon name="refresh" size={14} /></button>
            </div>
          )}
        </div>

        {selectedIds.length > 0 && currentTool === 'select' && !isRulerMode && !bendMode && (
          <button onClick={() => setIsRightOpen(!isRightOpen)} style={{ position: 'absolute', right: isMobile ? '20px' : (isRightOpen ? '300px' : '0px'), bottom: isMobile ? (isRightOpen ? 'calc(40vh + 20px)' : '20px') : 'auto', top: isMobile ? 'auto' : '50%', transform: isMobile ? 'none' : 'translateY(-50%)', zIndex: 101, background: '#fff', border: '1px solid #ccc', borderRadius: isMobile ? '50%' : '5px 0 0 5px', width: isMobile ? '50px' : 'auto', height: isMobile ? '50px' : 'auto', padding: isMobile ? '0' : '10px 5px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1f2937' }}>
            <Icon name={isRightOpen ? (isMobile ? 'x' : 'chevronRight') : 'settings'} size={isMobile ? 20 : 18} />
          </button>
        )}

        <div style={{ position: isMobile ? 'fixed' : 'absolute', bottom: 0, right: 0, width: isMobile ? '100%' : (isRightOpen && selectedIds.length > 0 ? '300px' : '0px'), height: isMobile ? '40vh' : '100%', backgroundColor: '#f8fafc', zIndex: 9999, transform: (isRightOpen && selectedIds.length > 0) ? 'translateY(0)' : (isMobile ? 'translateY(100%)' : 'translateX(100%)'), transition: 'transform 0.3s ease-in-out', borderTopLeftRadius: isMobile ? '15px' : '0', borderTopRightRadius: isMobile ? '15px' : '0', borderLeft: (!isMobile && isRightOpen && selectedIds.length > 0) ? '1px solid #ddd' : 'none', borderTop: (isMobile && isRightOpen && selectedIds.length > 0) ? '1px solid #ddd' : 'none', display: 'flex', flexDirection: 'column', onMouseDown: (e) => e.stopPropagation(), onTouchStart: (e) => e.stopPropagation(), onClick: (e) => e.stopPropagation() }}>
          {isMobile && <div style={{ width: '100%', height: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ width: '40px', height: '5px', background: '#cbd5e1', borderRadius: '5px' }} /></div>}
          {renderProperties()}
        </div>
      </div>

      {promptState && (<div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '10px', padding: '20px', maxWidth: '400px', width: '100%' }}>
          <h3 style={{ margin: '0 0 15px', fontSize: '16px' }}>{promptState.title}</h3>
          <input autoFocus type="text" value={promptState.value} onChange={(e) => setPromptState({ ...promptState, value: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') handlePromptConfirm(); if (e.key === 'Escape') handlePromptCancel(); }} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', marginBottom: '15px', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={handlePromptCancel} style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Hủy</button>
            <button onClick={handlePromptConfirm} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Xác nhận</button>
          </div>
        </div>
      </div>)}

      {confirmState && (<div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '10px', padding: '20px', maxWidth: '400px', width: '100%' }}>
          <h3 style={{ margin: '0 0 15px', fontSize: '15px', lineHeight: 1.5 }}>{confirmState.title}</h3>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={handleConfirmNo} style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Hủy</button>
            <button onClick={handleConfirmYes} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Xác nhận</button>
          </div>
        </div>
      </div>)}

      {isBuilderOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', width: '90%', maxWidth: '350px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>Tạo hình tùy chỉnh</h3>
            <div className="input-group" style={{ marginBottom: '10px' }}>
              <label>Loại hình:</label>
              <select value={draftShape.type} onChange={(e) => setDraftShape({ ...draftShape, type: e.target.value })} style={{ padding: '8px', width: '100%', borderRadius: '5px', border: '1px solid #ddd' }}>
                <option value="rect">Chữ nhật</option><option value="circle">Hình tròn</option><option value="polygon">Đa giác</option><option value="star">Ngôi sao</option>
              </select>
            </div>
            {draftShape.type === 'rect' && (<>
              <label>Bo góc: {draftShape.cornerRadius}px</label><input type="range" min="0" max="100" value={draftShape.cornerRadius} onChange={(e) => setDraftShape({ ...draftShape, cornerRadius: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} />
              <label>Chiều rộng: {draftShape.width}px</label><input type="range" min="20" max="400" value={draftShape.width} onChange={(e) => setDraftShape({ ...draftShape, width: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} />
              <label>Chiều cao: {draftShape.height}px</label><input type="range" min="20" max="400" value={draftShape.height} onChange={(e) => setDraftShape({ ...draftShape, height: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} />
            </>)}
            {(draftShape.type === 'circle' || draftShape.type === 'polygon') && <><label>Bán kính: {draftShape.radius}px</label><input type="range" min="10" max="200" value={draftShape.radius} onChange={(e) => setDraftShape({ ...draftShape, radius: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} /></>}
            {draftShape.type === 'polygon' && <><label>Số cạnh: {draftShape.sides}</label><input type="range" min="3" max="20" value={draftShape.sides} onChange={(e) => setDraftShape({ ...draftShape, sides: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} /></>}
            {draftShape.type === 'star' && (<>
              <label>Số cánh: {draftShape.numPoints}</label><input type="range" min="3" max="20" value={draftShape.numPoints} onChange={(e) => setDraftShape({ ...draftShape, numPoints: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} />
              <label>Bán kính ngoài: {draftShape.outerRadius}px</label><input type="range" min="20" max="200" value={draftShape.outerRadius} onChange={(e) => setDraftShape({ ...draftShape, outerRadius: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} />
              <label>Bán kính trong: {draftShape.innerRadius}px</label><input type="range" min="5" max={draftShape.outerRadius - 5} value={draftShape.innerRadius} onChange={(e) => setDraftShape({ ...draftShape, innerRadius: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} />
            </>)}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}><label>Màu nền:</label><input type="color" value={draftShape.fill} onChange={(e) => setDraftShape({ ...draftShape, fill: e.target.value })} style={{ width: '100%', height: '30px' }} /></div>
              <div style={{ flex: 1 }}><label>Màu viền:</label><input type="color" value={draftShape.stroke} onChange={(e) => setDraftShape({ ...draftShape, stroke: e.target.value })} style={{ width: '100%', height: '30px' }} /></div>
            </div>
            <label>Độ dày viền: {draftShape.strokeWidth}px</label><input type="range" min="0" max="20" value={draftShape.strokeWidth} onChange={(e) => setDraftShape({ ...draftShape, strokeWidth: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '15px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn" style={{ flex: 1, background: '#e5e7eb' }} onClick={() => setIsBuilderOpen(false)}>Hủy</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveCustomShape}>Lưu hình</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
