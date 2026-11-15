import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Group, Text, Image as KonvaImage, Rect, Circle, Star, RegularPolygon, Arrow, Path, Line, Transformer } from 'react-konva';
import { renderToStaticMarkup } from 'react-dom/server';
import { v4 as uuidv4 } from 'uuid';
import useImage from 'use-image';
import * as LucideIcons from 'lucide-react';
import ShapeLibrary from './components/ShapeLibrary';
import './App.css';

const POOF_BG_API_KEYS = [
  'pk_f03da1265a86e47c1113d8753f8d5291',
  'pk_bcb6518335e63ac9ef2b1fa893f267c1'
];

const getSvgPoints = (cx, cy, r, sides, isStar = false, innerR = 0) => {
  const points = [];
  const num = isStar ? sides * 2 : sides;
  for (let i = 0; i < num; i++) {
    const radius = isStar && i % 2 !== 0 ? innerR : r;
    const angle = (i * Math.PI * 2) / num - Math.PI / 2;
    points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
  }
  return points.join(' ');
};

const URLImage = ({ src, ...props }) => {
  const [image] = useImage(src);
  return <KonvaImage image={image} {...props} />;
};

const getIconPaths = (IconComponent) => {
  if (!IconComponent) return [];
  try {
    const svgString = renderToStaticMarkup(<IconComponent />);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = svgString;
    const svg = tempDiv.querySelector('svg');
    if (!svg) return [];
    let paths = [];
    svg.querySelectorAll('path, circle, line, rect, polygon, polyline, ellipse').forEach(node => {
      if (node.tagName === 'path') {
        const d = node.getAttribute('d') || "";
        if (d.trim()) paths.push(d.trim());
      } else if (node.tagName === 'circle') {
        const cx = Number(node.getAttribute('cx') || 0); const cy = Number(node.getAttribute('cy') || 0); const r = Number(node.getAttribute('r') || 0);
        paths.push(`M ${cx-r} ${cy} a ${r} ${r} 0 1 0 ${r*2} 0 a ${r} ${r} 0 1 0 -${r*2} 0`);
      } else if (node.tagName === 'ellipse') {
        const cx = Number(node.getAttribute('cx') || 0); const cy = Number(node.getAttribute('cy') || 0); const rx = Number(node.getAttribute('rx') || 0); const ry = Number(node.getAttribute('ry') || 0);
        paths.push(`M ${cx-rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx*2} 0 a ${rx} ${ry} 0 1 0 -${rx*2} 0`);
      } else if (node.tagName === 'line') {
        const x1 = Number(node.getAttribute('x1') || 0); const y1 = Number(node.getAttribute('y1') || 0); const x2 = Number(node.getAttribute('x2') || 0); const y2 = Number(node.getAttribute('y2') || 0);
        paths.push(`M ${x1} ${y1} L ${x2} ${y2}`);
      } else if (node.tagName === 'rect') {
        const x = Number(node.getAttribute('x') || 0); const y = Number(node.getAttribute('y') || 0); const w = Number(node.getAttribute('width') || 0); const h = Number(node.getAttribute('height') || 0);
        const rx = Number(node.getAttribute('rx') || 0);
        if (rx > 0) paths.push(`M ${x+rx} ${y} h ${w-rx*2} a ${rx} ${rx} 0 0 1 ${rx} ${rx} v ${h-rx*2} a ${rx} ${rx} 0 0 1 -${rx} ${rx} h -${w-rx*2} a ${rx} ${rx} 0 0 1 -${rx} -${rx} v -${h-rx*2} a ${rx} ${rx} 0 0 1 ${rx} -${rx} Z`);
        else paths.push(`M ${x} ${y} h ${w} v ${h} h -${w} Z`);
      } else if (node.tagName === 'polygon' || node.tagName === 'polyline') {
        const points = (node.getAttribute('points') || "").trim().split(/[\s,]+/);
        if (points.length >= 4) {
          let p = `M ${points[0]} ${points[1]} `;
          for (let i = 2; i < points.length; i += 2) p += `L ${points[i]} ${points[i+1]} `;
          if (node.tagName === 'polygon') p += ' Z';
          paths.push(p);
        }
      }
    });
    return paths;
  } catch { return []; }
};

const getInitialElements = () => {
  try { return JSON.parse(localStorage.getItem('design_elements')) || []; } catch { return []; }
};
const getInitialCustomShapes = () => {
  try { return JSON.parse(localStorage.getItem('custom_shapes')) || []; } catch { return []; }
};

const toggleFontStyle = (el, style) => {
  const current = el.fontStyle || 'normal';
  const styles = current.split(' ').filter(s => s && s !== 'normal');
  const idx = styles.indexOf(style);
  if (idx >= 0) styles.splice(idx, 1);
  else styles.push(style);
  styles.sort((a, b) => (a === 'italic' ? -1 : b === 'italic' ? 1 : 0));
  return styles.length === 0 ? 'normal' : styles.join(' ');
};

const initLegacyProject = () => {
  const existing = localStorage.getItem('projects');
  if (existing) {
    try { return JSON.parse(existing); } catch { return []; }
  }
  const oldElements = localStorage.getItem('design_elements');
  if (oldElements && oldElements !== '[]') {
    try {
      const id = uuidv4();
      const now = Date.now();
      const project = {
        id, name: 'Dự án cũ',
        elements: JSON.parse(oldElements) || [],
        bgColor: localStorage.getItem('design_bg') || '#ffffff',
        canvasSize: JSON.parse(localStorage.getItem('canvas_size') || '{"width":800,"height":600}'),
        createdAt: now, updatedAt: now
      };
      localStorage.setItem(`project_${id}`, JSON.stringify(project));
      const list = [{ id, name: project.name, createdAt: now, updatedAt: now }];
      localStorage.setItem('projects', JSON.stringify(list));
      return list;
    } catch { return []; }
  }
  return [];
};

const PROJECT_MENU_ITEM_STYLE = {
  display: 'block', width: '100%', padding: '10px 14px',
  background: 'none', border: 'none', textAlign: 'left',
  cursor: 'pointer', fontSize: '13px', color: '#1f2937'
};

const clampStagePos = (pos, mainAreaSize, canvasSize, stageScale) => {
  const scaledW = canvasSize.width * stageScale;
  const scaledH = canvasSize.height * stageScale;
  const minVisibleX = Math.min(80, scaledW * 0.25);
  const minVisibleY = Math.min(80, scaledH * 0.25);
  return {
    x: Math.max(minVisibleX - scaledW, Math.min(mainAreaSize.width - minVisibleX, pos.x)),
    y: Math.max(minVisibleY - scaledH, Math.min(mainAreaSize.height - minVisibleY, pos.y))
  };
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
  // ✅ Fix: nút Project popup ngoài toolbar
  const projectBtnRef = useRef(null);
  const [projectMenuPos, setProjectMenuPos] = useState({ left: 0, top: 0 });

  // Custom modal states
  const promptResolveRef = useRef(null);
  const confirmResolveRef = useRef(null);
  const [promptState, setPromptState] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  const [elements, setElements] = useState(getInitialElements);
  const [customShapes, setCustomShapes] = useState(getInitialCustomShapes);

  const [canvasSize, setCanvasSize] = useState(() => {
    const saved = localStorage.getItem('canvas_size');
    return saved ? JSON.parse(saved) : { width: 800, height: 600 };
  });

  const [bgColor, setBgColor] = useState(() => localStorage.getItem('design_bg') || '#ffffff');
  const [selectedId, setSelectedId] = useState(null);
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

  const [zoomPopupPos, setZoomPopupPos] = useState(() => {
    try {
      const saved = localStorage.getItem('zoom_popup_pos');
      return saved ? JSON.parse(saved) : { x: 16, y: null };
    } catch { return { x: 16, y: null }; }
  });
  const [isDraggingZoom, setIsDraggingZoom] = useState(false);
  const zoomDragOffset = useRef({ x: 0, y: 0 });
  const [isEditingZoom, setIsEditingZoom] = useState(false);
  const [zoomInputValue, setZoomInputValue] = useState('');

  // ============ MODAL HELPERS ============
  const showPrompt = (title, defaultValue = '') => new Promise((resolve) => {
    promptResolveRef.current = resolve;
    setPromptState({ title, value: defaultValue });
  });

  const handlePromptConfirm = () => {
    const value = promptState?.value?.trim() || '';
    setPromptState(null);
    promptResolveRef.current?.(value || null);
    promptResolveRef.current = null;
  };

  const handlePromptCancel = () => {
    setPromptState(null);
    promptResolveRef.current?.(null);
    promptResolveRef.current = null;
  };

  const showConfirm = (title) => new Promise((resolve) => {
    confirmResolveRef.current = resolve;
    setConfirmState({ title });
  });

  const handleConfirmYes = () => {
    setConfirmState(null);
    confirmResolveRef.current?.(true);
    confirmResolveRef.current = null;
  };

  const handleConfirmNo = () => {
    setConfirmState(null);
    confirmResolveRef.current?.(false);
    confirmResolveRef.current = null;
  };

  useEffect(() => {
    if (document.getElementById('pixelcraft-fonts')) return;
    const link = document.createElement('link');
    link.id = 'pixelcraft-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Roboto:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Anton&family=Bebas+Neue&family=Dancing+Script:ital,wght@0,400;0,700;1,400;1,700&display=swap';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('project');
    if (!projectId) return;
    try {
      const data = localStorage.getItem(`project_${projectId}`);
      if (!data) { alert('Project không tồn tại'); return; }
      const project = JSON.parse(data);
      setElements(project.elements || []);
      setBgColor(project.bgColor || '#ffffff');
      setCanvasSize(project.canvasSize || { width: 800, height: 600 });
      setHistory([project.elements || []]);
      setHistoryStep(0);
      setCurrentProjectId(projectId);
      setOpenProjectIds([projectId]);
      setView('editor');
      window.history.replaceState({}, '', window.location.pathname);
    } catch { alert('Lỗi mở project'); }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Đóng CẢ 2 popup khi resize
  useEffect(() => {
    const onResize = () => {
      setShowAddTabPopup(false);
      setShowProjectMenu(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!mainAreaRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setMainAreaSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(mainAreaRef.current);
    return () => observer.disconnect();
  }, []);

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
  const [draftShape, setDraftShape] = useState({
    type: 'rect', width: 200, height: 150, cornerRadius: 0,
    radius: 80, sides: 5, innerRadius: 40, outerRadius: 80, numPoints: 5,
    fill: '#3b82f6', stroke: '#000000', strokeWidth: 0
  });

  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const [history, setHistory] = useState([getInitialElements()]);
  const [historyStep, setHistoryStep] = useState(0);

  const stageRef = useRef(null);
  const trRef = useRef(null);
  const layerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { localStorage.setItem('custom_shapes', JSON.stringify(customShapes)); }, [customShapes]);

  useEffect(() => {
    if (!currentProjectId) return;
    const name = projects.find(p => p.id === currentProjectId)?.name || 'Untitled';
    const projectData = { id: currentProjectId, name, elements, bgColor, canvasSize, updatedAt: Date.now() };
    localStorage.setItem(`project_${currentProjectId}`, JSON.stringify(projectData));
    setProjects(prev => {
      if (!prev.find(p => p.id === currentProjectId)) return prev;
      return prev.map(p => p.id === currentProjectId ? { ...p, updatedAt: projectData.updatedAt } : p);
    });
  }, [elements, bgColor, canvasSize, currentProjectId]);

  useEffect(() => {
    if (mainAreaSize.width <= 0 || mainAreaSize.height <= 0) return;
    const canvasChanged = lastCanvasSizeRef.current.width !== canvasSize.width ||
                          lastCanvasSizeRef.current.height !== canvasSize.height;
    lastCanvasSizeRef.current = canvasSize;
    if (canvasChanged) userHasMovedCanvas.current = false;
    if (!userHasMovedCanvas.current) {
      setStagePos({
        x: mainAreaSize.width / 2 - (canvasSize.width * stageScale) / 2,
        y: mainAreaSize.height / 2 - (canvasSize.height * stageScale) / 2
      });
    } else {
      setStagePos(prev => clampStagePos(prev, mainAreaSize, canvasSize, stageScale));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainAreaSize.width, mainAreaSize.height, canvasSize.width, canvasSize.height]);

  useEffect(() => {
    if (selectedId && currentTool === 'select' && !isRulerMode) {
      const node = layerRef.current.findOne('#' + selectedId);
      if (node) trRef.current.nodes([node]);
      else trRef.current.nodes([]);
    } else {
      if (trRef.current) trRef.current.nodes([]);
    }
    if (layerRef.current) layerRef.current.batchDraw();
  }, [selectedId, elements, currentTool, isRulerMode]);

  useEffect(() => {
    if (mainAreaSize.height > 0 && zoomPopupPos.y === null) {
      setZoomPopupPos({ x: 16, y: Math.max(16, mainAreaSize.height - 60) });
    }
  }, [mainAreaSize.height, zoomPopupPos.y]);

  useEffect(() => {
    if (zoomPopupPos.y !== null) localStorage.setItem('zoom_popup_pos', JSON.stringify(zoomPopupPos));
  }, [zoomPopupPos]);

  useEffect(() => {
    if (zoomPopupPos.y === null) return;
    const popupW = 210, popupH = 44;
    const newX = Math.min(zoomPopupPos.x, Math.max(0, mainAreaSize.width - popupW));
    const newY = Math.min(zoomPopupPos.y, Math.max(0, mainAreaSize.height - popupH));
    if (newX !== zoomPopupPos.x || newY !== zoomPopupPos.y) setZoomPopupPos({ x: newX, y: newY });
  }, [mainAreaSize.width, mainAreaSize.height]);

  useEffect(() => {
    if (!isDraggingZoom) return;
    const onMove = (e) => {
      if (e.type === 'touchmove') e.preventDefault();
      const rect = mainAreaRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const popupW = 210, popupH = 44;
      const newX = Math.max(0, Math.min(rect.width - popupW, clientX - rect.left - zoomDragOffset.current.x));
      const newY = Math.max(0, Math.min(rect.height - popupH, clientY - rect.top - zoomDragOffset.current.y));
      setZoomPopupPos({ x: newX, y: newY });
    };
    const onUp = () => setIsDraggingZoom(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDraggingZoom, mainAreaSize.width, mainAreaSize.height]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT') return;
      if (e.ctrlKey && e.key.toLowerCase() === 'z') { e.preventDefault(); handleUndo(); }
      else if (e.ctrlKey && e.key.toLowerCase() === 'y') { e.preventDefault(); handleRedo(); }
      else if (e.key === 'Backspace' || e.key === 'Delete') {
        if (!selectedId) return;
        e.preventDefault();
        if (e.key === 'Backspace') {
          const el = elements.find(item => item.id === selectedId);
          if (el && el.type === 'text' && el.text && el.text.length > 0) { updateElement(selectedId, { text: '' }); return; }
        }
        deleteSelected();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (promptState) { handlePromptCancel(); return; }
        if (confirmState) { handleConfirmNo(); return; }
        if (showAddTabPopup) { setShowAddTabPopup(false); return; }
        if (showProjectMenu) { setShowProjectMenu(false); return; }
        if (isRulerMode) { setIsRulerMode(false); setTempLine(null); }
        else if (currentTool !== 'select') setCurrentTool('select');
        else if (selectedId) setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyStep, history, selectedId, elements, currentTool, isRulerMode, showAddTabPopup, showProjectMenu, promptState, confirmState]);

  const saveToHistory = (newElements) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    setHistory(newHistory); setHistoryStep(newHistory.length - 1); setElements(newElements);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep); setElements(history[prevStep]); setSelectedId(null);
    }
  };
  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep); setElements(history[nextStep]); setSelectedId(null);
    }
  };

  const handleReset = async () => {
    const ok = await showConfirm("Bạn có chắc chắn muốn ĐẶT LẠI TỪ ĐẦU?");
    if (!ok) return;
    setElements([]); setBgColor('#ffffff'); setSelectedId(null); setCurrentTool('select'); setHistory([[]]); setHistoryStep(0);
    setStageScale(1);
    userHasMovedCanvas.current = false;
    setStagePos({ x: mainAreaSize.width / 2 - canvasSize.width / 2, y: mainAreaSize.height / 2 - canvasSize.height / 2 });
  };

  const setZoomLevel = (newPercent) => {
    const newScale = Math.max(0.1, Math.min(5, newPercent / 100));
    if (Math.abs(newScale - stageScale) < 0.001) return;
    const vpCenterX = mainAreaSize.width / 2;
    const vpCenterY = mainAreaSize.height / 2;
    const mousePointTo = { x: (vpCenterX - stagePos.x) / stageScale, y: (vpCenterY - stagePos.y) / stageScale };
    userHasMovedCanvas.current = true;
    setStageScale(newScale);
    setStagePos(clampStagePos({ x: vpCenterX - mousePointTo.x * newScale, y: vpCenterY - mousePointTo.y * newScale }, mainAreaSize, canvasSize, newScale));
  };

  const commitZoom = () => {
    const val = parseFloat(zoomInputValue);
    if (!isNaN(val)) setZoomLevel(Math.max(10, Math.min(500, val)));
    setIsEditingZoom(false);
  };

  const handleZoomPopupDragStart = (e) => {
    const target = e.target;
    if (target.closest('button') || target.closest('input')) return;
    const rect = mainAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    zoomDragOffset.current = { x: clientX - rect.left - zoomPopupPos.x, y: clientY - rect.top - zoomPopupPos.y };
    setIsDraggingZoom(true);
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    const mousePointTo = { x: (pointerPosition.x - stage.x()) / oldScale, y: (pointerPosition.y - stage.y()) / oldScale };
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    if (newScale < 0.1 || newScale > 5) return;
    userHasMovedCanvas.current = true;
    setStageScale(newScale);
    setStagePos({ x: pointerPosition.x - mousePointTo.x * newScale, y: pointerPosition.y - mousePointTo.y * newScale });
  };

  const handleTouchMove = (e) => {
    e.evt.preventDefault();
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];
    if (touch1 && touch2) {
      isDrawing.current = false;
      if (stageRef.current.isDragging()) stageRef.current.stopDrag();
      if (layerRef.current) {
        try {
          layerRef.current.getChildren().forEach(child => {
            if (child.isDragging && child.isDragging()) child.stopDrag();
          });
        } catch {}
      }
      const p1 = { x: touch1.clientX, y: touch1.clientY };
      const p2 = { x: touch2.clientX, y: touch2.clientY };
      const newDist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      const newCenter = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      if (lastDist.current === 0) { lastDist.current = newDist; return; }
      const scaleBy = newDist / lastDist.current;
      const oldScale = stageRef.current.scaleX();
      let newScale = oldScale * scaleBy;
      if (newScale < 0.1) newScale = 0.1;
      if (newScale > 5) newScale = 5;
      const pointerTo = { x: (newCenter.x - stageRef.current.x()) / oldScale, y: (newCenter.y - stageRef.current.y()) / oldScale };
      userHasMovedCanvas.current = true;
      setStageScale(newScale);
      setStagePos({ x: newCenter.x - pointerTo.x * newScale, y: newCenter.y - pointerTo.y * newScale });
      lastDist.current = newDist;
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getRelativePointerPosition();
    if (currentTool === 'brush' && isDrawing.current) {
      let lastLine = elements[elements.length - 1];
      if (lastLine && lastLine.type === 'brush') {
        lastLine.points = lastLine.points.concat([point.x, point.y]);
        setElements(elements.slice(0, elements.length - 1).concat(lastLine));
      }
    } else if (isRulerMode && tempLine) {
      setTempLine(prev => ({ ...prev, points: [0, 0, point.x - prev.x, point.y - prev.y] }));
    }
  };

  const handleTouchEnd = () => {
    lastDist.current = 0;
    if (isRulerMode && tempLine) {
      const endX = tempLine.x + tempLine.points[2];
      const endY = tempLine.y + tempLine.points[3];
      saveToHistory([...elements, { id: uuidv4(), type: 'brush', points: [tempLine.x, tempLine.y, endX, endY], stroke: brushColor, strokeWidth: brushSize, opacity: 1, shadowEnabled: false, shadowColor: '#000000' }]);
      setTempLine(null);
    } else if (isDrawing.current) {
      isDrawing.current = false;
      saveToHistory(elements);
    }
  };

  const handleStageMouseDown = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getRelativePointerPosition();
    if (isRulerMode) { setTempLine({ x: pos.x, y: pos.y, points: [0, 0, 0, 0] }); return; }
    if (currentTool !== 'brush') return;
    isDrawing.current = true;
    setElements([...elements, { id: uuidv4(), type: 'brush', points: [pos.x, pos.y], stroke: brushColor, strokeWidth: brushSize, tension: 0.5, opacity: 1, shadowEnabled: false, shadowColor: '#000000' }]);
  };

  const handleStageMouseMove = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getRelativePointerPosition();
    if (isRulerMode && tempLine) { setTempLine(prev => ({ ...prev, points: [0, 0, pos.x - prev.x, pos.y - prev.y] })); return; }
    if (!isDrawing.current || currentTool !== 'brush') return;
    let lastLine = elements[elements.length - 1];
    if (lastLine && lastLine.type === 'brush') {
      lastLine.points = lastLine.points.concat([pos.x, pos.y]);
      setElements(elements.slice(0, elements.length - 1).concat(lastLine));
    }
  };

  const handleStageMouseUp = () => {
    if (isRulerMode && tempLine) {
      const endX = tempLine.x + tempLine.points[2];
      const endY = tempLine.y + tempLine.points[3];
      saveToHistory([...elements, { id: uuidv4(), type: 'brush', points: [tempLine.x, tempLine.y, endX, endY], stroke: brushColor, strokeWidth: brushSize, opacity: 1, shadowEnabled: false, shadowColor: '#000000' }]);
      setTempLine(null);
      return;
    }
    if (isDrawing.current) { isDrawing.current = false; saveToHistory(elements); }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.elements) saveToHistory(parsed.elements);
          if (parsed.bgColor) setBgColor(parsed.bgColor);
          if (parsed.canvasSize) setCanvasSize(parsed.canvasSize);
          setSelectedId(null);
          alert("Kéo thả dự án thành công!");
        } catch { alert("File JSON không hợp lệ!"); }
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const center = getCenterPosition();
          const maxDim = 300;
          let w = img.width, h = img.height;
          if (w > h) { if (w > maxDim) { h *= maxDim / w; w = maxDim; } }
          else { if (h > maxDim) { w *= maxDim / h; h = maxDim; } }
          saveToHistory([...elements, { id: uuidv4(), type: 'image', x: center.x - w / 2, y: center.y - h / 2, width: w, height: h, src: reader.result, opacity: 1, shadowEnabled: false, shadowColor: '#000000' }]);
          setCurrentTool('select');
          if (isMobile) { setIsLeftOpen(false); setIsRightOpen(true); }
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
        const center = getCenterPosition();
        const maxDim = 300;
        let w = img.width, h = img.height;
        if (w > h) { if (w > maxDim) { h *= maxDim / w; w = maxDim; } }
        else { if (h > maxDim) { w *= maxDim / h; h = maxDim; } }
        saveToHistory([...elements, { id: uuidv4(), type: 'image', x: center.x - w / 2, y: center.y - h / 2, width: w, height: h, src: reader.result, opacity: 1, shadowEnabled: false, shadowColor: '#000000' }]);
        setCurrentTool('select');
        if (isMobile) { setIsLeftOpen(false); setIsRightOpen(true); }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const resizeImage = (dataUrl, maxSize) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width, height = img.height;
      if (width > height) { if (width > maxSize) { height *= maxSize / width; width = maxSize; } }
      else { if (height > maxSize) { width *= maxSize / height; height = maxSize; } }
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = dataUrl;
  });

  const handleRemoveBg = async () => {
    if (!selectedId) return;
    setIsProcessing(true);
    try {
      const element = elements.find(el => el.id === selectedId);
      if (!element || element.type !== 'image') return;
      const resizedDataUrl = await resizeImage(element.src, 1600);
      const blob = await (await fetch(resizedDataUrl)).blob();
      const formData = new FormData(); formData.append('file', blob, 'image.jpg');
      let successBlob = null;
      for (let i = 0; i < POOF_BG_API_KEYS.length; i++) {
        setProcessingText(`Đang tách nền (API ${i + 1})...`);
        try {
          const poofRes = await fetch('https://api.poof.bg/v1/remove', { method: 'POST', headers: { 'x-api-key': POOF_BG_API_KEYS[i] }, body: formData });
          if (poofRes.ok) { successBlob = await poofRes.blob(); break; }
        } catch {}
      }
      if (successBlob) {
        const reader = new FileReader();
        reader.onload = () => { saveToHistory(elements.map(el => el.id === selectedId ? { ...el, src: reader.result } : el)); setIsProcessing(false); };
        reader.readAsDataURL(successBlob);
      } else throw new Error('Tất cả API đều thất bại.');
    } catch (error) { alert("Lỗi: " + error.message); setIsProcessing(false); }
  };

  const getCenterPosition = () => {
    if (!stageRef.current) return { x: canvasSize.width / 2, y: canvasSize.height / 2 };
    let visibleW = mainAreaSize.width;
    let visibleH = mainAreaSize.height;
    if (isMobile && isRightOpen) visibleH = visibleH * 0.6;
    return { x: (visibleW / 2 - stagePos.x) / stageScale, y: (visibleH / 2 - stagePos.y) / stageScale };
  };

  const centerSelected = () => {
    const node = layerRef.current.findOne('#' + selectedId);
    if (!node) return;
    const box = node.getClientRect({ relativeTo: layerRef.current });
    const dx = canvasSize.width / 2 - (box.x + box.width / 2);
    const dy = canvasSize.height / 2 - (box.y + box.height / 2);
    updateElement(selectedId, { x: node.x() + dx, y: node.y() + dy });
  };

  const addBasicShape = (type) => {
    setCurrentTool('select');
    setIsRulerMode(false);
    const center = getCenterPosition();
    const base = { id: uuidv4(), x: center.x, y: center.y, rotation: 0, scaleX: 1, scaleY: 1, stroke: '#000000', strokeWidth: 0, opacity: 1, shadowEnabled: false, shadowColor: '#000000' };
    let newEl = {};
    if (type === 'text') newEl = { ...base, type, text: 'Văn bản mới', fontSize: 40, fontFamily: 'Montserrat', fontStyle: 'normal', fill: '#000000', width: 200, align: 'center' };
    if (type === 'rect') newEl = { ...base, type, width: 200, height: 150, cornerRadius: 0, fill: '#3b82f6' };
    if (type === 'circle') newEl = { ...base, type, radius: 80, fill: '#ef4444' };
    if (type === 'triangle' || type === 'polygon') newEl = { ...base, type: 'polygon', radius: 80, sides: type === 'triangle' ? 3 : 5, fill: '#eab308' };
    if (type === 'star') newEl = { ...base, type, innerRadius: 40, outerRadius: 80, numPoints: 5, fill: '#8b5cf6' };
    if (type === 'arrow') newEl = { ...base, type, points: [0, 0, 150, 0], stroke: '#000000', strokeWidth: 4, pointerLength: 20, pointerWidth: 20 };
    if (newEl.type) {
      saveToHistory([...elements, newEl]);
      setSelectedId(newEl.id);
      if (isMobile) { setIsLeftOpen(false); setIsRightOpen(true); }
    }
  };

  const addCustomShape = (shapeTemplate) => {
    setCurrentTool('select');
    setIsRulerMode(false);
    const center = getCenterPosition();
    const newEl = { ...shapeTemplate, id: uuidv4(), x: center.x, y: center.y, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, shadowEnabled: false, shadowColor: '#000000' };
    saveToHistory([...elements, newEl]);
    setSelectedId(newEl.id);
    if (isMobile) { setIsLeftOpen(false); setIsRightOpen(true); }
  };

  const saveCustomShape = () => {
    setCustomShapes([...customShapes, { ...draftShape, id: 'custom_' + uuidv4(), name: 'Hình Tự Do' }]);
    setIsBuilderOpen(false);
  };

  const deleteCustomShape = async (e, shapeId) => {
    e.stopPropagation();
    const ok = await showConfirm("Bạn có chắc muốn xoá hình này khỏi thư viện?");
    if (!ok) return;
    setCustomShapes(customShapes.filter(s => s.id !== shapeId));
  };

  const deleteAllCustomShapes = async () => {
    const ok = await showConfirm("Bạn có chắc muốn XOÁ TẤT CẢ hình tự do trong thư viện không?");
    if (!ok) return;
    setCustomShapes([]);
  };

  const addPathShape = (pathData) => {
    setCurrentTool('select');
    setIsRulerMode(false);
    const center = getCenterPosition();
    const newEl = { id: uuidv4(), type: 'path', x: center.x, y: center.y, rotation: 0, data: [pathData], stroke: '#3b82f6', strokeWidth: 3, fill: 'transparent', scaleX: 2.5, scaleY: 2.5, opacity: 1, shadowEnabled: false, shadowColor: '#000000' };
    saveToHistory([...elements, newEl]);
    setSelectedId(newEl.id);
    if (isMobile) { setIsLeftOpen(false); setIsRightOpen(true); }
  };

  const addLucideIcon = (iconName) => {
    setCurrentTool('select');
    setIsRulerMode(false);
    const paths = getIconPaths(LucideIcons[iconName]);
    if (paths.length === 0) return;
    const center = getCenterPosition();
    const newEl = { id: uuidv4(), type: 'icon', x: center.x, y: center.y, rotation: 0, data: paths, stroke: '#3b82f6', strokeWidth: 1.5, fill: 'transparent', scaleX: 8, scaleY: 8, opacity: 1, shadowEnabled: false, shadowColor: '#000000' };
    saveToHistory([...elements, newEl]);
    setSelectedId(newEl.id);
    if (isMobile) { setIsLeftOpen(false); setIsRightOpen(true); }
  };

  const updateElement = (id, newAttrs) => { saveToHistory(elements.map(el => el.id === id ? { ...el, ...newAttrs } : el)); };
  const deleteSelected = () => { saveToHistory(elements.filter(el => el.id !== selectedId)); setSelectedId(null); };

  const duplicateSelected = () => {
    const el = elements.find(e => e.id === selectedId);
    if (el) {
      const newEl = { ...el, id: uuidv4(), x: (el.x || 0) + 30, y: (el.y || 0) + 30 };
      saveToHistory([...elements, newEl]); setSelectedId(newEl.id);
    }
  };

  const moveLayer = (direction) => {
    const index = elements.findIndex(e => e.id === selectedId);
    if (index === -1) return;
    const newElements = [...elements];
    const [element] = newElements.splice(index, 1);
    if (direction === 'up') newElements.push(element); else newElements.unshift(element);
    saveToHistory(newElements);
  };

  const handleTransformEnd = (e, el) => {
    const node = e.target;
    const scaleX = node.scaleX(); const scaleY = node.scaleY();
    let newProps = { x: node.x(), y: node.y(), rotation: node.rotation() };
    if (['image', 'rect', 'path', 'icon'].includes(el.type)) newProps = { ...newProps, scaleX, scaleY };
    else if (el.type === 'text') { node.scaleX(1); node.scaleY(1); newProps = { ...newProps, width: Math.max(20, node.width() * scaleX), fontSize: Math.max(10, node.fontSize() * scaleY) }; }
    else if (['circle', 'polygon'].includes(el.type)) { node.scaleX(1); node.scaleY(1); newProps = { ...newProps, radius: Math.max(10, node.radius() * scaleX) }; }
    else if (el.type === 'star') { node.scaleX(1); node.scaleY(1); newProps = { ...newProps, innerRadius: Math.max(10, node.innerRadius() * scaleX), outerRadius: Math.max(10, node.outerRadius() * scaleX) }; }
    else if (el.type === 'arrow') { node.scaleX(1); node.scaleY(1); newProps = { ...newProps, points: node.points().map(p => p * scaleX), strokeWidth: Math.max(1, node.strokeWidth() * scaleX) }; }
    saveToHistory(elements.map(item => item.id === el.id ? { ...item, ...newProps } : item));
  };

  const exportPng = async () => {
    const fileName = await showPrompt("Nhập tên file ảnh (không cần đuôi .png):", "pixelcraft-image");
    if (!fileName) return;
    if (trRef.current) trRef.current.hide();
    const oldScale = stageRef.current.scaleX();
    const oldPos = stageRef.current.position();
    stageRef.current.scale({ x: 1, y: 1 });
    stageRef.current.position({ x: 0, y: 0 });
    stageRef.current.batchDraw();
    const uri = stageRef.current.toDataURL({ x: 0, y: 0, width: canvasSize.width, height: canvasSize.height, pixelRatio: 2 });
    stageRef.current.scale({ x: oldScale, y: oldScale });
    stageRef.current.position(oldPos);
    stageRef.current.batchDraw();
    if (trRef.current) trRef.current.show();
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = uri;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const saveProject = async () => {
    const fileName = await showPrompt("Nhập tên file dự án (không cần đuôi .json):", "pixelcraft-project");
    if (!fileName) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ elements, bgColor, canvasSize }));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `${fileName}.json`);
    document.body.appendChild(a); a.click(); a.remove();
  };

  const loadProject = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.elements) saveToHistory(parsed.elements);
        if (parsed.bgColor) setBgColor(parsed.bgColor);
        if (parsed.canvasSize) setCanvasSize(parsed.canvasSize);
        setSelectedId(null);
        alert("Mở file thiết kế thành công!");
      } catch { alert("File không hợp lệ!"); }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const selectedEl = elements.find(el => el.id === selectedId);

  const renderShape = (el) => {
    const shadowProps = el.shadowEnabled ? {
      shadowColor: (el.shadowColor && el.shadowColor !== 'transparent') ? el.shadowColor : '#000000',
      shadowBlur: el.shadowBlur ?? 10, shadowOffsetX: el.shadowOffsetX ?? 5, shadowOffsetY: el.shadowOffsetY ?? 5, shadowForStrokeEnabled: true,
    } : {};
    const commonProps = {
      id: el.id, x: el.x || 0, y: el.y || 0, rotation: el.rotation || 0,
      draggable: currentTool === 'select' && !isRulerMode && (isMobile || selectedId === el.id),
      opacity: el.opacity ?? 1, ...shadowProps,
      onMouseDown: (e) => { e.cancelBubble = true; if (currentTool === 'select' && !isRulerMode) { setSelectedId(el.id); if (isMobile) setIsRightOpen(true); } },
      onTap: (e) => { e.cancelBubble = true; if (currentTool === 'select' && !isRulerMode) { setSelectedId(el.id); if (isMobile) setIsRightOpen(true); } },
      onDragEnd: (e) => saveToHistory(elements.map(item => item.id === el.id ? { ...item, x: e.target.x(), y: e.target.y() } : item)),
      onTransformEnd: (e) => handleTransformEnd(e, el),
    };
    if (el.type === 'icon') {
      return (
        <Group key={el.id} {...commonProps} scaleX={el.scaleX || 1} scaleY={el.scaleY || 1}>
          {el.data.map((pathData, index) => (
            <Path key={index} data={pathData} stroke={el.stroke} strokeWidth={el.strokeWidth} fill={el.fill} {...shadowProps} lineCap="round" lineJoin="round" />
          ))}
        </Group>
      );
    }
    const finalProps = {
      ...commonProps, stroke: el.stroke, strokeWidth: el.strokeWidth, fill: el.fill,
      ...(el.type === 'text' && { text: el.text, fontSize: el.fontSize, fontFamily: el.fontFamily || 'Montserrat', fontStyle: el.fontStyle || 'normal', textDecoration: el.textDecoration || '', align: el.align }),
      ...(el.type === 'rect' && { width: el.width, height: el.height, cornerRadius: el.cornerRadius || 0, scaleX: el.scaleX || 1, scaleY: el.scaleY || 1 }),
      ...(el.type === 'circle' && { radius: el.radius }),
      ...(el.type === 'polygon' && { radius: el.radius, sides: el.sides }),
      ...(el.type === 'star' && { innerRadius: el.innerRadius, outerRadius: el.outerRadius, numPoints: el.numPoints }),
      ...(el.type === 'arrow' && { points: el.points, pointerLength: el.pointerLength, pointerWidth: el.pointerWidth }),
      ...(el.type === 'image' && { src: el.src, width: el.width, height: el.height, scaleX: el.scaleX || 1, scaleY: el.scaleY || 1 }),
      ...(el.type === 'path' && { data: el.data[0], scaleX: el.scaleX || 1, scaleY: el.scaleY || 1 }),
      ...(el.type === 'brush' && { points: el.points, tension: el.tension, lineCap: 'round', lineJoin: 'round' }),
    };
    if (el.type === 'text') return <Text key={el.id} {...finalProps} />;
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

  const saveCurrentProjectIfAny = () => {
    if (!currentProjectId) return;
    const name = projects.find(p => p.id === currentProjectId)?.name || 'Untitled';
    localStorage.setItem(`project_${currentProjectId}`, JSON.stringify({ id: currentProjectId, name, elements, bgColor, canvasSize, updatedAt: Date.now() }));
  };

  const loadProjectData = (id) => {
    try {
      const data = localStorage.getItem(`project_${id}`);
      if (!data) return false;
      const project = JSON.parse(data);
      setElements(project.elements || []);
      setBgColor(project.bgColor || '#ffffff');
      setCanvasSize(project.canvasSize || { width: 800, height: 600 });
      setHistory([project.elements || []]);
      setHistoryStep(0);
      setSelectedId(null);
      setCurrentProjectId(id);
      userHasMovedCanvas.current = false;
      return true;
    } catch { return false; }
  };

  const openProject = (id) => {
    if (currentProjectId && currentProjectId !== id) saveCurrentProjectIfAny();
    if (!loadProjectData(id)) return alert('Project không tồn tại');
    setOpenProjectIds(prev => prev.includes(id) ? prev : [...prev, id]);
    setView('editor');
  };

  const switchProject = (id) => {
    if (id === currentProjectId) return;
    saveCurrentProjectIfAny();
    loadProjectData(id);
  };

  const closeProjectTab = (id) => {
    const filtered = openProjectIds.filter(p => p !== id);
    if (currentProjectId === id) {
      if (filtered.length > 0) switchProject(filtered[filtered.length - 1]);
      else { saveCurrentProjectIfAny(); setView('lobby'); setCurrentProjectId(null); setSelectedId(null); }
    }
    setOpenProjectIds(filtered);
  };

  const createProjectWithName = (name) => {
    saveCurrentProjectIfAny();
    const id = uuidv4();
    const now = Date.now();
    const project = { id, name, elements: [], bgColor: '#ffffff', canvasSize: { width: 800, height: 600 }, createdAt: now, updatedAt: now };
    localStorage.setItem(`project_${id}`, JSON.stringify(project));
    const newList = [...projects, { id, name, createdAt: now, updatedAt: now }];
    localStorage.setItem('projects', JSON.stringify(newList));
    setProjects(newList);
    openProject(id);
  };

  const handleCreateProject = async () => {
    const name = await showPrompt('Tên project mới:', `Dự án ${projects.length + 1}`);
    if (!name) return;
    createProjectWithName(name);
  };

  const handleExitProject = () => {
    saveCurrentProjectIfAny();
    setView('lobby');
    setCurrentProjectId(null);
    setSelectedId(null);
    setShowProjectMenu(false);
    setOpenProjectIds([]);
  };

  const handleNewTabProject = () => { setShowProjectMenu(false); handleCreateProject(); };

  const deleteProject = async (id) => {
    const ok = await showConfirm('Xoá project này? Không thể hoàn tác.');
    if (!ok) return;
    localStorage.removeItem(`project_${id}`);
    const newList = projects.filter(p => p.id !== id);
    localStorage.setItem('projects', JSON.stringify(newList));
    setProjects(newList);
    setOpenProjectIds(prev => prev.filter(p => p !== id));
    if (currentProjectId === id) { setView('lobby'); setCurrentProjectId(null); setSelectedId(null); }
  };

  const renameProject = async (id) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    const newName = await showPrompt('Tên mới:', project.name);
    if (!newName || newName === project.name) return;
    const newList = projects.map(p => p.id === id ? { ...p, name: newName } : p);
    localStorage.setItem('projects', JSON.stringify(newList));
    setProjects(newList);
    const data = localStorage.getItem(`project_${id}`);
    if (data) { try { const proj = JSON.parse(data); proj.name = newName; localStorage.setItem(`project_${id}`, JSON.stringify(proj)); } catch {} }
  };

  const openAddTabPopup = () => {
    if (showAddTabPopup) { setShowAddTabPopup(false); return; }
    if (addTabBtnRef.current) {
      const rect = addTabBtnRef.current.getBoundingClientRect();
      const POPUP_W = 280;
      const PADDING = 8;
      let left = rect.left;
      if (left + POPUP_W > window.innerWidth - PADDING) left = window.innerWidth - POPUP_W - PADDING;
      if (left < PADDING) left = PADDING;
      setAddTabPopupPos({ left, top: rect.bottom + 4 });
    }
    setShowAddTabPopup(true);
  };

  // ✅ Fix: nút Project dùng position fixed
  const openProjectMenu = () => {
    if (showProjectMenu) { setShowProjectMenu(false); return; }
    if (projectBtnRef.current) {
      const rect = projectBtnRef.current.getBoundingClientRect();
      const POPUP_W = 230;
      const PADDING = 8;
      let left = rect.left;
      if (left + POPUP_W > window.innerWidth - PADDING) left = window.innerWidth - POPUP_W - PADDING;
      if (left < PADDING) left = PADDING;
      setProjectMenuPos({ left, top: rect.bottom + 6 });
    }
    setShowProjectMenu(true);
  };

  const availableProjects = projects.filter(p => !openProjectIds.includes(p.id));

  const renderProperties = () => {
    if (!selectedId || !selectedEl || currentTool !== 'select' || isRulerMode) return null;
    return (
      <div style={{ padding: '15px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '16px', margin: 0 }}>Thuộc tính</h2>
          <button onClick={() => setIsRightOpen(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', padding: '0 5px' }}>✕</button>
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '15px' }}>
          {['basic', 'effects', 'colors'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '8px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: activeTab === tab ? '2px solid #3b82f6' : 'none', color: activeTab === tab ? '#3b82f6' : '#6b7280', fontWeight: 'bold' }}>
              {tab === 'basic' ? 'Cơ bản' : tab === 'effects' ? 'Hiệu ứng' : 'Màu sắc'}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'basic' && (
            <div>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <button className="btn" style={{ flex: 1, background: '#e5e7eb', fontSize: '12px', padding: '8px 0' }} onClick={() => moveLayer('up')}>Lên trên</button>
                <button className="btn" style={{ flex: 1, background: '#e5e7eb', fontSize: '12px', padding: '8px 0' }} onClick={() => moveLayer('down')}>Xuống dưới</button>
                <button className="btn" style={{ flex: 1, background: '#bfdbfe', fontSize: '12px', fontWeight: 'bold', padding: '8px 0' }} onClick={centerSelected}>Căn Giữa</button>
                <button className="btn" style={{ flex: 1, background: '#e5e7eb', fontSize: '12px', padding: '8px 0' }} onClick={duplicateSelected}>Nhân bản</button>
              </div>
              {selectedEl.type === 'text' && (
                <div style={{ marginBottom: '15px' }}>
                  <div className="input-group" style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px' }}>Nội dung chữ:</label>
                    <input type="text" value={selectedEl.text}
                      onChange={(e) => { const v = e.target.value; setElements(elements.map(el => el.id === selectedId ? { ...el, text: v } : el)); }}
                      onBlur={() => saveToHistory(elements)}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }} />
                  </div>
                  <div className="input-group" style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px' }}>Font chữ:</label>
                    <select value={selectedEl.fontFamily} onChange={(e) => updateElement(selectedId, { fontFamily: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Anton">Anton</option>
                      <option value="Bebas Neue">Bebas Neue</option>
                      <option value="Dancing Script">Dancing Script</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                    <button className="btn" style={{ flex: 1, fontWeight: 'bold', background: selectedEl.fontStyle?.includes('bold') ? '#bfdbfe' : '#fff', border: '1px solid #ccc' }} onClick={() => updateElement(selectedId, { fontStyle: toggleFontStyle(selectedEl, 'bold') })}>B</button>
                    <button className="btn" style={{ flex: 1, fontStyle: 'italic', background: selectedEl.fontStyle?.includes('italic') ? '#bfdbfe' : '#fff', border: '1px solid #ccc' }} onClick={() => updateElement(selectedId, { fontStyle: toggleFontStyle(selectedEl, 'italic') })}>I</button>
                    <button className="btn" style={{ flex: 1, textDecoration: 'underline', background: selectedEl.textDecoration === 'underline' ? '#bfdbfe' : '#fff', border: '1px solid #ccc' }} onClick={() => updateElement(selectedId, { textDecoration: selectedEl.textDecoration === 'underline' ? '' : 'underline' })}>U</button>
                  </div>
                </div>
              )}
              {['rect', 'circle', 'polygon', 'star'].includes(selectedEl.type) && (
                <div style={{ background: '#e0e7ff', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#3730a3', marginBottom: '10px', fontSize: '14px' }}>Tùy chỉnh hình</h4>
                  {selectedEl.type === 'rect' && (<><label style={{ fontSize: '13px' }}>Độ bo góc: {selectedEl.cornerRadius || 0}px</label><input type="range" min="0" max="100" value={selectedEl.cornerRadius || 0} onChange={(e) => updateElement(selectedId, { cornerRadius: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} /></>)}
                  {(selectedEl.type === 'circle' || selectedEl.type === 'polygon') && (<><label style={{ fontSize: '13px' }}>Bán kính: {Math.round(selectedEl.radius)}px</label><input type="range" min="10" max="300" value={selectedEl.radius || 80} onChange={(e) => updateElement(selectedId, { radius: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} /></>)}
                  {selectedEl.type === 'polygon' && (<><label style={{ fontSize: '13px' }}>Số cạnh: {selectedEl.sides}</label><input type="range" min="3" max="20" value={selectedEl.sides || 3} onChange={(e) => updateElement(selectedId, { sides: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} /></>)}
                  {selectedEl.type === 'star' && (<><label style={{ fontSize: '13px' }}>Số góc: {selectedEl.numPoints}</label><input type="range" min="3" max="20" value={selectedEl.numPoints || 5} onChange={(e) => updateElement(selectedId, { numPoints: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} /><label style={{ fontSize: '13px' }}>Độ nhọn:</label><input type="range" min="10" max={selectedEl.outerRadius - 5} value={selectedEl.innerRadius || 40} onChange={(e) => updateElement(selectedId, { innerRadius: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} /></>)}
                </div>
              )}
              {selectedEl.type === 'image' && (
                <button className="btn" style={{ width: '100%', background: '#8b5cf6', color: 'white', marginTop: '15px', padding: '12px', fontWeight: 'bold' }} onClick={handleRemoveBg} disabled={isProcessing}>✨ Tách Nền AI (Poof BG)</button>
              )}
            </div>
          )}
          {activeTab === 'effects' && (
            <div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '13px' }}>Độ mờ (Opacity): {Math.round((selectedEl.opacity ?? 1) * 100)}%</label>
                <input type="range" min="0" max="1" step="0.05" value={selectedEl.opacity ?? 1} onChange={(e) => updateElement(selectedId, { opacity: parseFloat(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                <input type="checkbox" checked={selectedEl.shadowEnabled || false} onChange={(e) => updateElement(selectedId, { shadowEnabled: e.target.checked })} />
                <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Bật Đổ bóng</label>
              </div>
              {selectedEl.shadowEnabled && (
                <div style={{ paddingLeft: '10px', borderLeft: '2px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                    <label style={{ fontSize: '12px' }}>Màu bóng:</label>
                    <input type="color" value={selectedEl.shadowColor || '#000000'} onChange={(e) => updateElement(selectedId, { shadowColor: e.target.value })} style={{ width: '30px', height: '25px' }} />
                  </div>
                  <label style={{ fontSize: '12px' }}>Độ mờ bóng: {selectedEl.shadowBlur ?? 10}px</label>
                  <input type="range" min="0" max="50" value={selectedEl.shadowBlur ?? 10} onChange={(e) => updateElement(selectedId, { shadowBlur: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '5px' }} />
                  <label style={{ fontSize: '12px' }}>Khoảng cách X: {selectedEl.shadowOffsetX ?? 5}px</label>
                  <input type="range" min="-20" max="20" value={selectedEl.shadowOffsetX ?? 5} onChange={(e) => updateElement(selectedId, { shadowOffsetX: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '5px' }} />
                  <label style={{ fontSize: '12px' }}>Khoảng cách Y: {selectedEl.shadowOffsetY ?? 5}px</label>
                  <input type="range" min="-20" max="20" value={selectedEl.shadowOffsetY ?? 5} onChange={(e) => updateElement(selectedId, { shadowOffsetY: parseInt(e.target.value) })} style={{ width: '100%' }} />
                </div>
              )}
            </div>
          )}
          {activeTab === 'colors' && (
            <div>
              {['text', 'rect', 'circle', 'polygon', 'star', 'path', 'icon'].includes(selectedEl.type) && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '13px' }}>Màu nền:</label>
                  <input type="color" value={selectedEl.fill === 'transparent' ? '#ffffff' : selectedEl.fill} onChange={(e) => updateElement(selectedId, { fill: e.target.value })} style={{ height: '30px', cursor: 'pointer', width: '100%', marginBottom: '10px' }} />
                  {['rect', 'circle', 'polygon', 'star', 'path', 'icon'].includes(selectedEl.type) && (
                    <>
                      <label style={{ fontSize: '13px' }}>Màu viền:</label>
                      <input type="color" value={selectedEl.stroke || '#000000'} onChange={(e) => updateElement(selectedId, { stroke: e.target.value })} style={{ height: '30px', cursor: 'pointer', width: '100%', marginBottom: '10px' }} />
                      <label style={{ fontSize: '13px' }}>Độ dày viền: {selectedEl.strokeWidth || 0}px</label>
                      <input type="range" min="0" max="20" value={selectedEl.strokeWidth || 0} onChange={(e) => updateElement(selectedId, { strokeWidth: parseInt(e.target.value) })} style={{ width: '100%' }} />
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <button onClick={deleteSelected} style={{ marginTop: '10px', padding: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Xoá vật thể này
        </button>
      </div>
    );
  };

  // ==================== LOBBY ====================
  if (view === 'lobby') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f7', padding: '40px 20px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ color: '#1f2937', fontSize: '48px', marginBottom: '8px' }}>
              <span style={{ color: '#8b5cf6' }}>Pixel</span>Craft
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Chọn project để tiếp tục, hoặc tạo project mới</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
            <button onClick={handleCreateProject} style={{
              padding: '14px 32px', fontSize: '16px', fontWeight: 'bold',
              background: '#10b981', color: 'white', border: 'none',
              borderRadius: '10px', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
            }}>+ Tạo Project Mới</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {projects.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#9ca3af', padding: '60px 20px', fontSize: '15px' }}>
                Chưa có project nào. Bấm "Tạo Project Mới" để bắt đầu ✨
              </div>
            )}
            {projects.map(p => (
              <div key={p.id} onClick={() => openProject(p.id)} style={{
                background: 'white', borderRadius: '12px', padding: '20px',
                cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.05)',
                position: 'relative', transition: 'transform 0.15s, box-shadow 0.15s'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.05)'; }}
              >
                <div style={{ fontSize: '30px', marginBottom: '10px' }}>📄</div>
                <h3 style={{ margin: '0 0 6px', color: '#1f2937', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>
                  {new Date(p.updatedAt).toLocaleDateString('vi-VN')} · {new Date(p.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '4px' }}>
                  <button onClick={e => { e.stopPropagation(); renameProject(p.id); }} title="Đổi tên" style={{ background: '#dbeafe', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '13px' }}>✏️</button>
                  <button onClick={e => { e.stopPropagation(); deleteProject(p.id); }} title="Xoá" style={{ background: '#fee2e2', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '13px' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {promptState && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '10px', padding: '20px', maxWidth: '400px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: '0 0 15px', fontSize: '16px', color: '#1f2937' }}>{promptState.title}</h3>
              <input autoFocus type="text" value={promptState.value}
                onChange={(e) => setPromptState({ ...promptState, value: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePromptConfirm(); if (e.key === 'Escape') handlePromptCancel(); }}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', marginBottom: '15px', boxSizing: 'border-box', outline: 'none' }} />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={handlePromptCancel} style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Hủy</button>
                <button onClick={handlePromptConfirm} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>OK</button>
              </div>
            </div>
          </div>
        )}

        {confirmState && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '10px', padding: '20px', maxWidth: '400px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: '0 0 15px', fontSize: '15px', color: '#1f2937', lineHeight: 1.5 }}>{confirmState.title}</h3>
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

  // ==================== EDITOR ====================
  return (
    <div className="app-container" style={{ flexDirection: 'column' }} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {isDragging && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(59, 130, 246, 0.8)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '10px dashed white', boxSizing: 'border-box' }}>
          <h2 style={{ color: 'white', fontSize: '32px' }}>Thả file Ảnh hoặc .json vào đây!</h2>
        </div>
      )}
      {isProcessing && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
          <div style={{ border: '5px solid #f3f3f3', borderTop: '5px solid #8b5cf6', borderRadius: '50%', width: '60px', height: '60px', animation: 'spin 1s linear infinite' }}></div>
          <h3 style={{ marginTop: '20px', fontSize: '22px' }}>{processingText}</h3>
        </div>
      )}

      {/* TASKBAR */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', background: '#d1d5db', padding: '6px 10px 0', overflowX: 'auto', flexShrink: 0, borderBottom: '1px solid #9ca3af', minHeight: '36px', position: 'relative', WebkitOverflowScrolling: 'touch' }}>
        {openProjectIds.map(id => {
          const proj = projects.find(p => p.id === id);
          if (!proj) return null;
          const isActive = currentProjectId === id;
          return (
            <div key={id} onClick={() => switchProject(id)} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px',
              background: isActive ? '#fff' : '#e5e7eb', color: '#1f2937',
              borderRadius: '6px 6px 0 0', cursor: 'pointer', fontSize: '12px',
              fontWeight: isActive ? 'bold' : 'normal', maxWidth: '180px', minWidth: '80px',
              whiteSpace: 'nowrap', flexShrink: 0,
              boxShadow: isActive ? 'inset 0 2px 0 #3b82f6' : 'none'
            }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{proj.name}</span>
              <button onClick={(e) => { e.stopPropagation(); closeProjectTab(id); }} title="Đóng tab"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '16px', padding: '0 2px', lineHeight: 1, display: 'flex', alignItems: 'center' }}>×</button>
            </div>
          );
        })}
        <button ref={addTabBtnRef} onClick={openAddTabPopup} title="Thêm tab"
          style={{
            padding: '5px 12px',
            background: showAddTabPopup ? '#3b82f6' : 'rgba(255,255,255,0.4)',
            color: showAddTabPopup ? '#fff' : '#374151',
            border: '1px solid #9ca3af', borderRadius: '4px 4px 0 0',
            cursor: 'pointer', fontSize: '16px', fontWeight: 'bold',
            marginLeft: '4px', lineHeight: 1, flexShrink: 0
          }}>+</button>
      </div>

      {/* Popup thêm tab */}
      {showAddTabPopup && (
        <>
          <div onClick={() => setShowAddTabPopup(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
          <div style={{
            position: 'fixed', top: addTabPopupPos.top, left: addTabPopupPos.left,
            background: 'white', border: '1px solid #ddd', borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)', width: '280px',
            zIndex: 999, overflow: 'hidden'
          }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #eee', background: '#f9fafb' }}>
              <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Thêm tab</div>
            </div>
            <button onClick={() => { setShowAddTabPopup(false); handleCreateProject(); }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#10b981', borderBottom: '1px solid #eee' }}
              onMouseEnter={e => e.currentTarget.style.background = '#ecfdf5'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <span style={{ fontSize: '18px' }}>✨</span>
              <span>Tạo project mới</span>
            </button>
            <div style={{ padding: '8px 14px 4px', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f3f4f6' }}>
              Dùng project có sẵn
            </div>
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {availableProjects.length === 0 ? (
                <div style={{ padding: '14px', fontSize: '12px', color: '#9ca3af', fontStyle: 'italic', textAlign: 'center' }}>Không còn project nào</div>
              ) : (
                availableProjects.map(p => (
                  <button key={p.id} onClick={() => { setShowAddTabPopup(false); openProject(p.id); }}
                    style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', color: '#1f2937', borderBottom: '1px solid #f9fafb' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <div style={{ fontWeight: '500', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                      {new Date(p.updatedAt).toLocaleDateString('vi-VN')} · {new Date(p.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* ✅ POPUP PROJECT — ngoài toolbar, position fixed */}
      {showProjectMenu && (
        <>
          <div onClick={() => setShowProjectMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
          <div style={{
            position: 'fixed', top: projectMenuPos.top, left: projectMenuPos.left,
            background: 'white', border: '1px solid #ddd', borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)', minWidth: '230px',
            zIndex: 999, overflow: 'hidden'
          }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #eee', background: '#f9fafb' }}>
              <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project hiện tại</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f2937', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {projects.find(p => p.id === currentProjectId)?.name || 'Untitled'}
              </div>
            </div>
            <button onClick={() => { setShowProjectMenu(false); handleExitProject(); }} style={PROJECT_MENU_ITEM_STYLE}>🚪 Thoát project</button>
            <button onClick={handleNewTabProject} style={PROJECT_MENU_ITEM_STYLE}>🆕 New tab project</button>
          </div>
        </>
      )}

      {/* TOOLBAR */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: isMobile ? 'flex-start' : 'space-between',
        background: '#e5e7eb',
        padding: isMobile ? '8px 10px' : '10px 15px',
        borderBottom: '1px solid #d1d5db', gap: '10px',
        flexWrap: isMobile ? 'nowrap' : 'wrap',
        overflowX: isMobile ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch'
      }}>
        <div style={{ display: 'flex', gap: isMobile ? '8px' : '10px', alignItems: 'center', flexWrap: isMobile ? 'nowrap' : 'wrap', flexShrink: 0 }}>
          {/* ✅ Nút Project — chỉ button, popup render ngoài */}
          <button
            ref={projectBtnRef}
            onClick={openProjectMenu}
            style={{
              padding: '5px 10px', fontSize: '12px', fontWeight: 'bold',
              borderRadius: '4px', border: '1px solid #ccc',
              background: showProjectMenu ? '#3b82f6' : '#fff',
              color: showProjectMenu ? '#fff' : '#333',
              display: 'flex', alignItems: 'center', gap: '5px',
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
            }}
            title="Quản lý project">📁 Project</button>

          <h2 style={{ fontSize: '18px', color: '#1f2937', margin: 0, fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 }}><span style={{ color: '#8b5cf6' }}>Pixel</span>Craft</h2>
          <select value={`${canvasSize.width}x${canvasSize.height}`} onChange={(e) => { const [w, h] = e.target.value.split('x').map(Number); setCanvasSize({ width: w, height: h }); }} style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
            <option value="800x600">800x600</option>
            <option value="1080x1080">1080x1080</option>
            <option value="1080x1920">1080x1920 (Story)</option>
            <option value="1920x1080">1920x1080 (Youtube)</option>
            <option value="1200x630">1200x630 (FB)</option>
          </select>
          <div style={{ display: 'flex', gap: '5px', borderLeft: '1px solid #ccc', paddingLeft: '10px', flexShrink: 0 }}>
            <button style={{ border: '1px solid #ccc', background: currentTool === 'brush' ? '#3b82f6' : '#fff', color: currentTool === 'brush' ? '#fff' : '#333', padding: '5px 10px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => { setCurrentTool('brush'); setIsRulerMode(false); }}>🖌️ Bút</button>
            <button style={{ border: '1px solid #ccc', background: isRulerMode ? '#10b981' : '#fff', color: isRulerMode ? '#fff' : '#333', padding: '5px 10px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => { setIsRulerMode(true); setCurrentTool('select'); }}>📏 Thước</button>
            <button style={{ border: '1px solid #ccc', background: currentTool === 'select' && !isRulerMode ? '#3b82f6' : '#fff', color: currentTool === 'select' && !isRulerMode ? '#fff' : '#333', padding: '5px 10px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => { setCurrentTool('select'); setIsRulerMode(false); }}>🖱️ Chọn</button>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', borderLeft: '1px solid #ccc', paddingLeft: '10px', flexWrap: 'nowrap', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Màu:</label>
              <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} style={{ width: '25px', height: '25px', padding: 0, border: 'none' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', position: 'relative' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                Độ dày
                <span onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} style={{ color: '#3b82f6', borderRadius: '50%', border: '1px solid #3b82f6', width: '14px', height: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', cursor: 'help' }}>i</span>
              </label>
              {showTooltip && (<div style={{ position: 'absolute', top: '25px', left: '-20px', background: '#333', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', whiteSpace: 'nowrap', zIndex: 1000 }}>Chỉnh độ dày của bút vẽ và thước kẻ</div>)}
              <input type="range" min="1" max="30" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} style={{ width: '60px' }} />
              <span style={{ fontSize: '12px', width: '15px' }}>{brushSize}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'nowrap', flexShrink: 0 }}>
          <button onClick={saveProject} style={{ padding: '5px 10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', color: '#333', whiteSpace: 'nowrap' }} title="Lưu file thiết kế (.json)">💾 Lưu Dự Án</button>
          <button onClick={() => fileInputRef.current.click()} style={{ padding: '5px 10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', color: '#333', whiteSpace: 'nowrap' }} title="Mở file thiết kế (.json)">📂 Mở Dự Án</button>
          <input type="file" accept=".json" ref={fileInputRef} onChange={loadProject} style={{ display: 'none' }} />
          <button onClick={handleUndo} disabled={historyStep <= 0} style={{ padding: '5px 10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: historyStep <= 0 ? 'not-allowed' : 'pointer' }}>↩</button>
          <button onClick={handleRedo} disabled={historyStep >= history.length - 1} style={{ padding: '5px 10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: historyStep >= history.length - 1 ? 'not-allowed' : 'pointer' }}>↪</button>
          <button onClick={handleReset} style={{ padding: '5px 10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', border: '1px solid #ef4444', background: '#fee2e2', color: '#ef4444', whiteSpace: 'nowrap' }}>Xoá hết</button>
          <button className="btn btn-success" onClick={exportPng} style={{ padding: '5px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}>Tải Ảnh PNG</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
        {/* LEFT PANEL */}
        <div style={{ width: isLeftOpen ? (isMobile ? '100%' : '250px') : '0px', overflow: 'hidden', transition: 'width 0.3s', background: 'white', position: 'absolute', left: 0, zIndex: 100, height: '100%', borderRight: isLeftOpen ? '1px solid #ddd' : 'none', boxShadow: isLeftOpen ? '5px 0 15px rgba(0,0,0,0.1)' : 'none' }}>
          <div style={{ padding: '15px', overflowY: 'auto', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '16px', margin: 0 }}>Thư Viện Hình</h2>
              <button onClick={() => setIsLeftOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>
            <ShapeLibrary onAddBasicShape={addBasicShape} onAddIcon={addLucideIcon} onAddPathShape={addPathShape} />
            <button className="btn" style={{ width: '100%', background: '#fef08a', color: '#854d0e', fontWeight: 'bold', marginBottom: '10px', border: '1px solid #fde047' }} onClick={() => setIsBuilderOpen(true)}>✨ Tạo Hình Tự Do</button>
            {customShapes.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <h3 style={{ fontSize: '13px', margin: 0 }}>Hình của bạn:</h3>
                  <button onClick={deleteAllCustomShapes} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}>Xoá tất cả</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
                  {customShapes.map((shape, idx) => (
                    <div key={shape.id || idx} style={{ position: 'relative' }}>
                      <button className="btn" style={{ width: '100%', height: '100%', background: '#fff', border: '1px solid #ddd', padding: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => addCustomShape(shape)}>
                        <svg width="20" height="20" viewBox="0 0 100 100">
                          {shape.type === 'rect' && <rect x="10" y="20" width="80" height="60" rx={shape.cornerRadius} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />}
                          {shape.type === 'circle' && <circle cx="50" cy="50" r="40" fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />}
                          {shape.type === 'polygon' && <polygon points={getSvgPoints(50, 50, 40, shape.sides)} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />}
                          {shape.type === 'star' && <polygon points={getSvgPoints(50, 50, 40, shape.numPoints, true, 20)} fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth} />}
                        </svg>
                      </button>
                      <button onClick={(e) => deleteCustomShape(e, shape.id)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ padding: '10px', border: '1px dashed #ccc', borderRadius: '6px', marginBottom: '15px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '5px', display: 'block' }}>Tải ảnh lên:</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: '12px', width: '100%' }} />
            </div>
            <div className="input-group">
              <label>Màu nền Canvas:</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
            </div>
          </div>
        </div>

        {!isMobile && (
          <button onClick={() => setIsLeftOpen(!isLeftOpen)} style={{ position: 'absolute', left: isLeftOpen ? '250px' : '0px', top: '50%', transform: 'translateY(-50%)', zIndex: 100, background: '#fff', border: '1px solid #ccc', borderLeft: 'none', borderRadius: '0 5px 5px 0', padding: '10px 5px', cursor: 'pointer', transition: 'left 0.3s' }}>{isLeftOpen ? '◀' : '▶'}</button>
        )}

        {/* CANVAS */}
        <div ref={mainAreaRef} className="main-area" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#e5e7eb', touchAction: 'none', minHeight: 0 }}>
          {!isLeftOpen && (
            <button onClick={() => setIsLeftOpen(true)} style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 100, background: '#fff', border: '1px solid #ccc', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>📚</button>
          )}

          {selectedId && isMobile && (
            <button onClick={() => setSelectedId(null)} title="Bỏ chọn"
              style={{
                position: 'absolute', top: '10px', right: '10px',
                background: 'white', border: '1px solid #d1d5db', borderRadius: '50%',
                width: '40px', height: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 20, fontSize: '16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
              }}>✕</button>
          )}

          <Stage
            width={mainAreaSize.width} height={mainAreaSize.height}
            onWheel={handleWheel} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
            onMouseDown={handleStageMouseDown} onMousemove={handleStageMouseMove} onMouseup={handleStageMouseUp} onTouchStart={handleStageMouseDown}
            onClick={(e) => { if (e.target === e.target.getStage() && currentTool === 'select' && !isRulerMode && !isCanvasDragging.current) setSelectedId(null); }}
            onTap={(e) => { if (e.target === e.target.getStage() && currentTool === 'select' && !isRulerMode && !isCanvasDragging.current) setSelectedId(null); }}
            onDragStart={(e) => { if (e.target === e.target.getStage()) isCanvasDragging.current = true; }}
            onDragEnd={(e) => {
              if (e.target === e.target.getStage()) {
                const clamped = clampStagePos({ x: e.target.x(), y: e.target.y() }, mainAreaSize, canvasSize, stageScale);
                e.target.position(clamped);
                setStagePos(clamped);
                userHasMovedCanvas.current = true;
                setTimeout(() => { isCanvasDragging.current = false; }, 50);
              }
            }}
            dragBoundFunc={(pos) => clampStagePos(pos, mainAreaSize, canvasSize, stageScale)}
            scaleX={stageScale} scaleY={stageScale} x={stagePos.x} y={stagePos.y}
            draggable={currentTool === 'select' && !isRulerMode}
            ref={stageRef}
            style={{ cursor: (currentTool === 'brush' || isRulerMode) ? 'crosshair' : 'grab' }}
          >
            <Layer ref={layerRef}>
              <Rect width={canvasSize.width} height={canvasSize.height} fill={bgColor} shadowColor="#000" shadowBlur={20} shadowOpacity={0.2} listening={false} />
              {elements.map(renderShape)}
              {isRulerMode && tempLine && <Line x={tempLine.x} y={tempLine.y} points={tempLine.points} stroke={brushColor} strokeWidth={brushSize} dash={[10, 5]} />}
              <Transformer ref={trRef} keepRatio={['circle', 'star', 'text', 'path', 'icon', 'polygon', 'arrow'].includes(selectedEl?.type)}
                anchorSize={isMobile ? 28 : 22} anchorCornerRadius={isMobile ? 14 : 10} anchorStroke="#3b82f6" anchorStrokeWidth={2} anchorFill="#ffffff" borderStroke="#3b82f6" borderStrokeWidth={2} rotateAnchorOffset={isMobile ? 48 : 40} ignoreStroke={true}
                boundBoxFunc={(oldBox, newBox) => { if (newBox.width < 20 || newBox.height < 20) return oldBox; return newBox; }} />
            </Layer>
          </Stage>

          {/* ZOOM POPUP */}
          {zoomPopupPos.y !== null && (
            <div
              onMouseDown={handleZoomPopupDragStart}
              onTouchStart={handleZoomPopupDragStart}
              style={{
                position: 'absolute', left: zoomPopupPos.x, top: zoomPopupPos.y,
                background: 'white', padding: '6px 8px', borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex', gap: '4px', alignItems: 'center',
                zIndex: 20, userSelect: 'none',
                cursor: isDraggingZoom ? 'grabbing' : 'grab',
                touchAction: 'none'
              }}>
              <button onClick={() => setZoomLevel(Math.round(stageScale * 100) - 10)}
                style={{ width: '28px', height: '28px', border: 'none', background: '#f3f4f6', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>−</button>

              {isEditingZoom ? (
                <input
                  autoFocus type="number"
                  value={zoomInputValue}
                  onChange={(e) => setZoomInputValue(e.target.value)}
                  onBlur={commitZoom}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitZoom();
                    if (e.key === 'Escape') { setIsEditingZoom(false); }
                  }}
                  style={{ width: '58px', padding: '4px 2px', fontSize: '12px', fontWeight: 'bold', textAlign: 'center', border: '2px solid #3b82f6', borderRadius: '6px', outline: 'none' }}
                />
              ) : (
                <div
                  onClick={() => { setZoomInputValue(Math.round(stageScale * 100).toString()); setIsEditingZoom(true); }}
                  title="Click để nhập %"
                  style={{ minWidth: '48px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#1f2937', padding: '4px 6px', borderRadius: '6px', cursor: 'text', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  {Math.round(stageScale * 100)}%
                </div>
              )}

              <button onClick={() => setZoomLevel(Math.round(stageScale * 100) + 10)}
                style={{ width: '28px', height: '28px', border: 'none', background: '#f3f4f6', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>+</button>

              <button onClick={() => {
                setStageScale(1);
                userHasMovedCanvas.current = false;
                setStagePos({ x: mainAreaSize.width / 2 - canvasSize.width / 2, y: mainAreaSize.height / 2 - canvasSize.height / 2 });
              }} title="Reset về 100% & căn giữa"
                style={{ marginLeft: '2px', width: '28px', height: '28px', border: 'none', background: '#e5e7eb', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>⤾</button>
            </div>
          )}
        </div>

        {selectedId && selectedEl && currentTool === 'select' && !isRulerMode && (
          <button onClick={() => setIsRightOpen(!isRightOpen)} style={{ position: 'absolute', right: isMobile ? '20px' : (isRightOpen ? '300px' : '0px'), bottom: isMobile ? (isRightOpen ? 'calc(40vh + 20px)' : '20px') : 'auto', top: isMobile ? 'auto' : '50%', transform: isMobile ? 'none' : 'translateY(-50%)', zIndex: 101, background: '#fff', border: '1px solid #ccc', borderRadius: isMobile ? '50%' : '5px 0 0 5px', borderRight: isMobile ? '1px solid #ccc' : 'none', width: isMobile ? '50px' : 'auto', height: isMobile ? '50px' : 'auto', padding: isMobile ? '0' : '10px 5px', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '24px' : '20px' }}>
            {isRightOpen ? (isMobile ? '✕' : '▶') : '⚙️'}
          </button>
        )}

        <div style={{ position: isMobile ? 'fixed' : 'absolute', bottom: 0, right: 0, width: isMobile ? '100%' : (isRightOpen && selectedId ? '300px' : '0px'), height: isMobile ? '40vh' : '100%', backgroundColor: '#f8fafc', zIndex: 9999, transform: (isRightOpen && selectedId) ? 'translateY(0)' : (isMobile ? 'translateY(100%)' : 'translateX(100%)'), transition: 'transform 0.3s ease-in-out', borderTopLeftRadius: isMobile ? '15px' : '0', borderTopRightRadius: isMobile ? '15px' : '0', borderLeft: (!isMobile && isRightOpen && selectedId) ? '1px solid #ddd' : 'none', borderTop: (isMobile && isRightOpen && selectedId) ? '1px solid #ddd' : 'none', boxShadow: (isRightOpen && selectedId) ? (isMobile ? '0 -5px 15px rgba(0,0,0,0.1)' : '-5px 0 15px rgba(0,0,0,0.1)') : 'none', display: 'flex', flexDirection: 'column', onMouseDown: (e) => e.stopPropagation(), onTouchStart: (e) => e.stopPropagation(), onClick: (e) => e.stopPropagation() }}>
          {isMobile && (<div style={{ width: '100%', height: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ width: '40px', height: '5px', background: '#cbd5e1', borderRadius: '5px' }} /></div>)}
          {renderProperties()}
        </div>
      </div>

      {/* Modal Prompt */}
      {promptState && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '10px', padding: '20px', maxWidth: '400px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 15px', fontSize: '16px', color: '#1f2937' }}>{promptState.title}</h3>
            <input autoFocus type="text" value={promptState.value}
              onChange={(e) => setPromptState({ ...promptState, value: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') handlePromptConfirm(); if (e.key === 'Escape') handlePromptCancel(); }}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', marginBottom: '15px', boxSizing: 'border-box', outline: 'none' }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={handlePromptCancel} style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Hủy</button>
              <button onClick={handlePromptConfirm} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm */}
      {confirmState && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '10px', padding: '20px', maxWidth: '400px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 15px', fontSize: '15px', color: '#1f2937', lineHeight: 1.5 }}>{confirmState.title}</h3>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={handleConfirmNo} style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Hủy</button>
              <button onClick={handleConfirmYes} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {isBuilderOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', width: '90%', maxWidth: '350px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>Tạo Hình Tự Do</h3>
            <div className="input-group" style={{ marginBottom: '10px' }}>
              <label>Loại hình:</label>
              <select value={draftShape.type} onChange={(e) => setDraftShape({ ...draftShape, type: e.target.value })} style={{ padding: '8px', width: '100%', borderRadius: '5px', border: '1px solid #ddd' }}>
                <option value="rect">Chữ Nhật</option>
                <option value="circle">Hình Tròn</option>
                <option value="polygon">Đa Giác</option>
                <option value="star">Ngôi Sao</option>
              </select>
            </div>
            {draftShape.type === 'rect' && (<>
              <label>Độ bo góc: {draftShape.cornerRadius}px</label><input type="range" min="0" max="100" value={draftShape.cornerRadius} onChange={(e) => setDraftShape({ ...draftShape, cornerRadius: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} />
              <label>Chiều rộng: {draftShape.width}px</label><input type="range" min="20" max="400" value={draftShape.width} onChange={(e) => setDraftShape({ ...draftShape, width: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} />
              <label>Chiều cao: {draftShape.height}px</label><input type="range" min="20" max="400" value={draftShape.height} onChange={(e) => setDraftShape({ ...draftShape, height: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} />
            </>)}
            {(draftShape.type === 'circle' || draftShape.type === 'polygon') && (<><label>Bán kính: {draftShape.radius}px</label><input type="range" min="10" max="200" value={draftShape.radius} onChange={(e) => setDraftShape({ ...draftShape, radius: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} /></>)}
            {draftShape.type === 'polygon' && (<><label>Số cạnh: {draftShape.sides}</label><input type="range" min="3" max="20" value={draftShape.sides} onChange={(e) => setDraftShape({ ...draftShape, sides: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} /></>)}
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
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveCustomShape}>Lưu Hình</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
