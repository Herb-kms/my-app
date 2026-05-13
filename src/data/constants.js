import * as THREE from 'three';

export const INITIAL_ITEMS = [
    { id: 't1', type: 'Can', position: [5, 0.5, 5], status: 'IDLE', value: 10, color: '#ff4444' },
    { id: 't2', type: 'Plastic', position: [7, 0.5, 5], status: 'IDLE', value: 8, color: '#4444ff' },
    { id: 't3', type: 'Glass', position: [9, 0.5, 5], status: 'IDLE', value: 5, color: '#44ff44' },
    { id: 't4', type: 'Can', position: [5, 0.5, 7], status: 'IDLE', value: 10, color: '#ff4444' },
    { id: 't5', type: 'Plastic', position: [7, 0.5, 7], status: 'IDLE', value: 8, color: '#4444ff' },
    { id: 't6', type: 'Glass', position: [9, 0.5, 7], status: 'IDLE', value: 5, color: '#44ff44' },
    { id: 't7', type: 'Can', position: [5, 0.5, 9], status: 'IDLE', value: 10, color: '#ff4444' },
    { id: 't8', type: 'Plastic', position: [7, 0.5, 9], status: 'IDLE', value: 8, color: '#4444ff' },
];

export const DEFAULT_MACHINES = [
    { id: 'm1', type: 'CRUSHING',     position: [0, 0, 0],   rotation: [0, 0,            0] },
    { id: 'm2', type: 'CLEANING',     position: [0, 0, -5],  rotation: [0, 0,            0] },
    { id: 'm3', type: 'SORTING',      position: [5, 0, -5],  rotation: [0, Math.PI / 2,  0] },
    { id: 'm4', type: 'PACKAGING',    position: [10, 0, -5], rotation: [0, Math.PI,      0] },
    { id: 'm5', type: 'SHIPPING_BIN', position: [10, 0, 0],  rotation: [0, Math.PI,      0] },
];

export const DEFAULT_BELTS = [
    { id: 'b1', position: [0, 0, 2.5],  rotation: [0, 0,           0] },
    { id: 'b2', position: [0, 0, -2.5], rotation: [0, 0,           0] },
    { id: 'b3', position: [2.5, 0, -5], rotation: [0, Math.PI / 2, 0] },
    { id: 'b4', position: [7.5, 0, -5], rotation: [0, Math.PI / 2, 0] },
    { id: 'b5', position: [10, 0, -2.5],rotation: [0, Math.PI,     0] },
];

export const BUILD_CATALOG = [
    { id: 'CONVEYOR', name: 'Conveyor Belt', category: 'Logic' },
    { id: 'SORTING', name: 'Sorting Machine', category: 'Machine' },
    { id: 'CRUSHING', name: 'Crushing Machine', category: 'Machine' },
    { id: 'CLEANING', name: 'Cleaning Machine', category: 'Machine' },
    { id: 'DRYING', name: 'Drying Machine', category: 'Machine' },
    { id: 'PACKAGING', name: 'Packaging Machine', category: 'Machine' },
    { id: 'SHIPPING_BIN', name: 'Sell Zone', category: 'Machine' },
    { id: 'WALL', name: 'Factory Wall', category: 'Structure' },
    { id: 'SHELF', name: 'Industrial Shelf', category: 'Prop' },
    { id: 'CRATE', name: 'Wooden Crate', category: 'Prop' },
    { id: 'BARREL', name: 'Oil Barrel', category: 'Prop' },
    { id: 'ITEM_PLASTIC', name: 'Plastic Waste', category: 'Resource' },
    { id: 'ITEM_CAN', name: 'Alu Can Waste', category: 'Resource' },
    { id: 'ITEM_GLASS', name: 'Glass Waste', category: 'Resource' },
];

export const MACHINE_CONFIGS = {
    CRUSHING: { color: '#ff4444', label: 'CRUSHER' },
    CLEANING: { color: '#4444ff', label: 'CLEANER' },
    SORTING: { color: '#44ff44', label: 'SORTER' },
    PACKAGING: { color: '#ffcc00', label: 'PACKAGER' },
    SHIPPING_BIN: { color: '#888888', label: 'SELL ZONE' }
};
