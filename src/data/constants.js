import * as THREE from 'three';

export const INITIAL_ITEMS = [
    { id: 't1', type: 'Can', position: [5, 0.5, 5], status: 'IDLE', value: 10 },
    { id: 't2', type: 'Plastic', position: [7, 0.5, 5], status: 'IDLE', value: 8 },
    { id: 't3', type: 'Glass', position: [9, 0.5, 5], status: 'IDLE', value: 5 },
    { id: 't4', type: 'Can', position: [5, 0.5, 7], status: 'IDLE', value: 10 },
    { id: 't5', type: 'Plastic', position: [7, 0.5, 7], status: 'IDLE', value: 8 },
];

export const DEFAULT_MACHINES = [
    { id: 'm1', type: 'SHREDDING', position: [0, 0, 0], rotation: 0 },
    { id: 'm2', type: 'WASHING', position: [0, 0, -5], rotation: 0 },
    { id: 'm3', type: 'SORTING', position: [5, 0, -5], rotation: Math.PI / 2 },
    { id: 'm4', type: 'PACKAGING', position: [10, 0, -5], rotation: Math.PI },
    { id: 'm5', type: 'SHIPPING_BIN', position: [10, 0, 0], rotation: Math.PI },
];

export const DEFAULT_BELTS = [
    { id: 'b1', position: [0, 0, 2.5], rotation: 0 },
    { id: 'b2', position: [0, 0, -2.5], rotation: 0 },
    { id: 'b3', position: [2.5, 0, -5], rotation: Math.PI / 2 },
    { id: 'b4', position: [7.5, 0, -5], rotation: Math.PI / 2 },
    { id: 'b5', position: [10, 0, -2.5], rotation: Math.PI },
];

export const MACHINE_CONFIGS = {
    SHREDDING: { color: '#ff4444', label: 'SHREDDER' },
    WASHING: { color: '#4444ff', label: 'WASHER' },
    SORTING: { color: '#44ff44', label: 'SORTER' },
    PACKAGING: { color: '#ffcc00', label: 'PACKAGER' },
    SHIPPING_BIN: { color: '#888888', label: 'SELL ZONE' }
};
