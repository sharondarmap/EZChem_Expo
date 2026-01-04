import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Periodic table data - Complete 118 elements
const ELEMENTS = [
  // Period 1
  { number: 1, symbol: 'H', name: 'Hidrogen', mass: '1.008', category: 'nonmetal', period: 1, group: 1, electron: '1s¹' },
  { number: 2, symbol: 'He', name: 'Helium', mass: '4.003', category: 'noble-gas', period: 1, group: 18, electron: '1s²' },
  // Period 2
  { number: 3, symbol: 'Li', name: 'Litium', mass: '6.941', category: 'alkali-metal', period: 2, group: 1, electron: '[He] 2s¹' },
  { number: 4, symbol: 'Be', name: 'Berilium', mass: '9.012', category: 'alkaline-earth', period: 2, group: 2, electron: '[He] 2s²' },
  { number: 5, symbol: 'B', name: 'Boron', mass: '10.811', category: 'metalloid', period: 2, group: 13, electron: '[He] 2s² 2p¹' },
  { number: 6, symbol: 'C', name: 'Karbon', mass: '12.011', category: 'nonmetal', period: 2, group: 14, electron: '[He] 2s² 2p²' },
  { number: 7, symbol: 'N', name: 'Nitrogen', mass: '14.007', category: 'nonmetal', period: 2, group: 15, electron: '[He] 2s² 2p³' },
  { number: 8, symbol: 'O', name: 'Oksigen', mass: '15.999', category: 'nonmetal', period: 2, group: 16, electron: '[He] 2s² 2p⁴' },
  { number: 9, symbol: 'F', name: 'Fluorin', mass: '18.998', category: 'halogen', period: 2, group: 17, electron: '[He] 2s² 2p⁵' },
  { number: 10, symbol: 'Ne', name: 'Neon', mass: '20.180', category: 'noble-gas', period: 2, group: 18, electron: '[He] 2s² 2p⁶' },
  // Period 3
  { number: 11, symbol: 'Na', name: 'Natrium', mass: '22.990', category: 'alkali-metal', period: 3, group: 1, electron: '[Ne] 3s¹' },
  { number: 12, symbol: 'Mg', name: 'Magnesium', mass: '24.305', category: 'alkaline-earth', period: 3, group: 2, electron: '[Ne] 3s²' },
  { number: 13, symbol: 'Al', name: 'Aluminium', mass: '26.982', category: 'post-transition', period: 3, group: 13, electron: '[Ne] 3s² 3p¹' },
  { number: 14, symbol: 'Si', name: 'Silikon', mass: '28.086', category: 'metalloid', period: 3, group: 14, electron: '[Ne] 3s² 3p²' },
  { number: 15, symbol: 'P', name: 'Fosfor', mass: '30.974', category: 'nonmetal', period: 3, group: 15, electron: '[Ne] 3s² 3p³' },
  { number: 16, symbol: 'S', name: 'Sulfur', mass: '32.065', category: 'nonmetal', period: 3, group: 16, electron: '[Ne] 3s² 3p⁴' },
  { number: 17, symbol: 'Cl', name: 'Klorin', mass: '35.453', category: 'halogen', period: 3, group: 17, electron: '[Ne] 3s² 3p⁵' },
  { number: 18, symbol: 'Ar', name: 'Argon', mass: '39.948', category: 'noble-gas', period: 3, group: 18, electron: '[Ne] 3s² 3p⁶' },
  // Period 4
  { number: 19, symbol: 'K', name: 'Kalium', mass: '39.098', category: 'alkali-metal', period: 4, group: 1, electron: '[Ar] 4s¹' },
  { number: 20, symbol: 'Ca', name: 'Kalsium', mass: '40.078', category: 'alkaline-earth', period: 4, group: 2, electron: '[Ar] 4s²' },
  { number: 21, symbol: 'Sc', name: 'Skandium', mass: '44.956', category: 'transition-metal', period: 4, group: 3, electron: '[Ar] 3d¹ 4s²' },
  { number: 22, symbol: 'Ti', name: 'Titanium', mass: '47.867', category: 'transition-metal', period: 4, group: 4, electron: '[Ar] 3d² 4s²' },
  { number: 23, symbol: 'V', name: 'Vanadium', mass: '50.942', category: 'transition-metal', period: 4, group: 5, electron: '[Ar] 3d³ 4s²' },
  { number: 24, symbol: 'Cr', name: 'Kromium', mass: '51.996', category: 'transition-metal', period: 4, group: 6, electron: '[Ar] 3d⁵ 4s¹' },
  { number: 25, symbol: 'Mn', name: 'Mangan', mass: '54.938', category: 'transition-metal', period: 4, group: 7, electron: '[Ar] 3d⁵ 4s²' },
  { number: 26, symbol: 'Fe', name: 'Besi', mass: '55.845', category: 'transition-metal', period: 4, group: 8, electron: '[Ar] 3d⁶ 4s²' },
  { number: 27, symbol: 'Co', name: 'Kobalt', mass: '58.933', category: 'transition-metal', period: 4, group: 9, electron: '[Ar] 3d⁷ 4s²' },
  { number: 28, symbol: 'Ni', name: 'Nikel', mass: '58.693', category: 'transition-metal', period: 4, group: 10, electron: '[Ar] 3d⁸ 4s²' },
  { number: 29, symbol: 'Cu', name: 'Tembaga', mass: '63.546', category: 'transition-metal', period: 4, group: 11, electron: '[Ar] 3d¹⁰ 4s¹' },
  { number: 30, symbol: 'Zn', name: 'Seng', mass: '65.38', category: 'transition-metal', period: 4, group: 12, electron: '[Ar] 3d¹⁰ 4s²' },
  { number: 31, symbol: 'Ga', name: 'Galium', mass: '69.723', category: 'post-transition', period: 4, group: 13, electron: '[Ar] 3d¹⁰ 4s² 4p¹' },
  { number: 32, symbol: 'Ge', name: 'Germanium', mass: '72.630', category: 'metalloid', period: 4, group: 14, electron: '[Ar] 3d¹⁰ 4s² 4p²' },
  { number: 33, symbol: 'As', name: 'Arsen', mass: '74.922', category: 'metalloid', period: 4, group: 15, electron: '[Ar] 3d¹⁰ 4s² 4p³' },
  { number: 34, symbol: 'Se', name: 'Selenium', mass: '78.971', category: 'nonmetal', period: 4, group: 16, electron: '[Ar] 3d¹⁰ 4s² 4p⁴' },
  { number: 35, symbol: 'Br', name: 'Bromin', mass: '79.904', category: 'halogen', period: 4, group: 17, electron: '[Ar] 3d¹⁰ 4s² 4p⁵' },
  { number: 36, symbol: 'Kr', name: 'Kripton', mass: '83.798', category: 'noble-gas', period: 4, group: 18, electron: '[Ar] 3d¹⁰ 4s² 4p⁶' },
  // Period 5
  { number: 37, symbol: 'Rb', name: 'Rubidium', mass: '85.468', category: 'alkali-metal', period: 5, group: 1, electron: '[Kr] 5s¹' },
  { number: 38, symbol: 'Sr', name: 'Stronsium', mass: '87.62', category: 'alkaline-earth', period: 5, group: 2, electron: '[Kr] 5s²' },
  { number: 39, symbol: 'Y', name: 'Itrium', mass: '88.906', category: 'transition-metal', period: 5, group: 3, electron: '[Kr] 4d¹ 5s²' },
  { number: 40, symbol: 'Zr', name: 'Zirkonium', mass: '91.224', category: 'transition-metal', period: 5, group: 4, electron: '[Kr] 4d² 5s²' },
  { number: 41, symbol: 'Nb', name: 'Niobium', mass: '92.906', category: 'transition-metal', period: 5, group: 5, electron: '[Kr] 4d⁴ 5s¹' },
  { number: 42, symbol: 'Mo', name: 'Molibdenum', mass: '95.95', category: 'transition-metal', period: 5, group: 6, electron: '[Kr] 4d⁵ 5s¹' },
  { number: 43, symbol: 'Tc', name: 'Teknesium', mass: '98', category: 'transition-metal', period: 5, group: 7, electron: '[Kr] 4d⁵ 5s²' },
  { number: 44, symbol: 'Ru', name: 'Rutenium', mass: '101.07', category: 'transition-metal', period: 5, group: 8, electron: '[Kr] 4d⁷ 5s¹' },
  { number: 45, symbol: 'Rh', name: 'Rodium', mass: '102.91', category: 'transition-metal', period: 5, group: 9, electron: '[Kr] 4d⁸ 5s¹' },
  { number: 46, symbol: 'Pd', name: 'Paladium', mass: '106.42', category: 'transition-metal', period: 5, group: 10, electron: '[Kr] 4d¹⁰' },
  { number: 47, symbol: 'Ag', name: 'Perak', mass: '107.87', category: 'transition-metal', period: 5, group: 11, electron: '[Kr] 4d¹⁰ 5s¹' },
  { number: 48, symbol: 'Cd', name: 'Kadmium', mass: '112.41', category: 'transition-metal', period: 5, group: 12, electron: '[Kr] 4d¹⁰ 5s²' },
  { number: 49, symbol: 'In', name: 'Indium', mass: '114.82', category: 'post-transition', period: 5, group: 13, electron: '[Kr] 4d¹⁰ 5s² 5p¹' },
  { number: 50, symbol: 'Sn', name: 'Timah', mass: '118.71', category: 'post-transition', period: 5, group: 14, electron: '[Kr] 4d¹⁰ 5s² 5p²' },
  { number: 51, symbol: 'Sb', name: 'Antimon', mass: '121.76', category: 'metalloid', period: 5, group: 15, electron: '[Kr] 4d¹⁰ 5s² 5p³' },
  { number: 52, symbol: 'Te', name: 'Telurium', mass: '127.60', category: 'metalloid', period: 5, group: 16, electron: '[Kr] 4d¹⁰ 5s² 5p⁴' },
  { number: 53, symbol: 'I', name: 'Iodin', mass: '126.90', category: 'halogen', period: 5, group: 17, electron: '[Kr] 4d¹⁰ 5s² 5p⁵' },
  { number: 54, symbol: 'Xe', name: 'Xenon', mass: '131.29', category: 'noble-gas', period: 5, group: 18, electron: '[Kr] 4d¹⁰ 5s² 5p⁶' },
  // Period 6
  { number: 55, symbol: 'Cs', name: 'Sesium', mass: '132.91', category: 'alkali-metal', period: 6, group: 1, electron: '[Xe] 6s¹' },
  { number: 56, symbol: 'Ba', name: 'Barium', mass: '137.33', category: 'alkaline-earth', period: 6, group: 2, electron: '[Xe] 6s²' },
  { number: 57, symbol: 'La', name: 'Lantanum', mass: '138.91', category: 'lanthanide', period: 6, group: 3, electron: '[Xe] 5d¹ 6s²' },
  { number: 58, symbol: 'Ce', name: 'Serium', mass: '140.12', category: 'lanthanide', period: 6, group: 3, electron: '[Xe] 4f¹ 5d¹ 6s²' },
  { number: 59, symbol: 'Pr', name: 'Praseodimium', mass: '140.91', category: 'lanthanide', period: 6, group: 3, electron: '[Xe] 4f³ 6s²' },
  { number: 60, symbol: 'Nd', name: 'Neodimium', mass: '144.24', category: 'lanthanide', period: 6, group: 3, electron: '[Xe] 4f⁴ 6s²' },
  { number: 61, symbol: 'Pm', name: 'Prometium', mass: '145', category: 'lanthanide', period: 6, group: 3, electron: '[Xe] 4f⁵ 6s²' },
  { number: 62, symbol: 'Sm', name: 'Samarium', mass: '150.36', category: 'lanthanide', period: 6, group: 3, electron: '[Xe] 4f⁶ 6s²' },
  { number: 63, symbol: 'Eu', name: 'Europium', mass: '151.96', category: 'lanthanide', period: 6, group: 3, electron: '[Xe] 4f⁷ 6s²' },
  { number: 64, symbol: 'Gd', name: 'Gadolinium', mass: '157.25', category: 'lanthanide', period: 6, group: 3, electron: '[Xe] 4f⁷ 5d¹ 6s²' },
  { number: 65, symbol: 'Tb', name: 'Terbium', mass: '158.93', category: 'lanthanide', period: 6, group: 3, electron: '[Xe] 4f⁹ 6s²' },
  { number: 66, symbol: 'Dy', name: 'Disprosium', mass: '162.50', category: 'lanthanide', period: 6, group: 3, electron: '[Xe] 4f¹⁰ 6s²' },
  { number: 67, symbol: 'Ho', name: 'Holmium', mass: '164.93', category: 'lanthanide', period: 6, group: 3, electron: '[Xe] 4f¹¹ 6s²' },
  { number: 68, symbol: 'Er', name: 'Erbium', mass: '167.26', category: 'lanthanide', period: 6, group: 3, electron: '[Xe] 4f¹² 6s²' },
  { number: 69, symbol: 'Tm', name: 'Tulium', mass: '168.93', category: 'lanthanide', period: 6, group: 3, electron: '[Xe] 4f¹³ 6s²' },
  { number: 70, symbol: 'Yb', name: 'Iterbium', mass: '173.05', category: 'lanthanide', period: 6, group: 3, electron: '[Xe] 4f¹⁴ 6s²' },
  { number: 71, symbol: 'Lu', name: 'Lutesium', mass: '174.97', category: 'lanthanide', period: 6, group: 3, electron: '[Xe] 4f¹⁴ 5d¹ 6s²' },
  { number: 72, symbol: 'Hf', name: 'Hafnium', mass: '178.49', category: 'transition-metal', period: 6, group: 4, electron: '[Xe] 4f¹⁴ 5d² 6s²' },
  { number: 73, symbol: 'Ta', name: 'Tantalum', mass: '180.95', category: 'transition-metal', period: 6, group: 5, electron: '[Xe] 4f¹⁴ 5d³ 6s²' },
  { number: 74, symbol: 'W', name: 'Tungsten', mass: '183.84', category: 'transition-metal', period: 6, group: 6, electron: '[Xe] 4f¹⁴ 5d⁴ 6s²' },
  { number: 75, symbol: 'Re', name: 'Renium', mass: '186.21', category: 'transition-metal', period: 6, group: 7, electron: '[Xe] 4f¹⁴ 5d⁵ 6s²' },
  { number: 76, symbol: 'Os', name: 'Osmium', mass: '190.23', category: 'transition-metal', period: 6, group: 8, electron: '[Xe] 4f¹⁴ 5d⁶ 6s²' },
  { number: 77, symbol: 'Ir', name: 'Iridium', mass: '192.22', category: 'transition-metal', period: 6, group: 9, electron: '[Xe] 4f¹⁴ 5d⁷ 6s²' },
  { number: 78, symbol: 'Pt', name: 'Platina', mass: '195.08', category: 'transition-metal', period: 6, group: 10, electron: '[Xe] 4f¹⁴ 5d⁹ 6s¹' },
  { number: 79, symbol: 'Au', name: 'Emas', mass: '196.97', category: 'transition-metal', period: 6, group: 11, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹' },
  { number: 80, symbol: 'Hg', name: 'Raksa', mass: '200.59', category: 'transition-metal', period: 6, group: 12, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s²' },
  { number: 81, symbol: 'Tl', name: 'Talium', mass: '204.38', category: 'post-transition', period: 6, group: 13, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹' },
  { number: 82, symbol: 'Pb', name: 'Timbal', mass: '207.2', category: 'post-transition', period: 6, group: 14, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²' },
  { number: 83, symbol: 'Bi', name: 'Bismut', mass: '208.98', category: 'post-transition', period: 6, group: 15, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³' },
  { number: 84, symbol: 'Po', name: 'Polonium', mass: '209', category: 'post-transition', period: 6, group: 16, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴' },
  { number: 85, symbol: 'At', name: 'Astatin', mass: '210', category: 'halogen', period: 6, group: 17, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵' },
  { number: 86, symbol: 'Rn', name: 'Radon', mass: '222', category: 'noble-gas', period: 6, group: 18, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶' },
  // Period 7
  { number: 87, symbol: 'Fr', name: 'Fransium', mass: '223', category: 'alkali-metal', period: 7, group: 1, electron: '[Rn] 7s¹' },
  { number: 88, symbol: 'Ra', name: 'Radium', mass: '226', category: 'alkaline-earth', period: 7, group: 2, electron: '[Rn] 7s²' },
  { number: 89, symbol: 'Ac', name: 'Aktinium', mass: '227', category: 'actinide', period: 7, group: 3, electron: '[Rn] 6d¹ 7s²' },
  { number: 90, symbol: 'Th', name: 'Torium', mass: '232.04', category: 'actinide', period: 7, group: 3, electron: '[Rn] 6d² 7s²' },
  { number: 91, symbol: 'Pa', name: 'Protaktinium', mass: '231.04', category: 'actinide', period: 7, group: 3, electron: '[Rn] 5f² 6d¹ 7s²' },
  { number: 92, symbol: 'U', name: 'Uranium', mass: '238.03', category: 'actinide', period: 7, group: 3, electron: '[Rn] 5f³ 6d¹ 7s²' },
  { number: 93, symbol: 'Np', name: 'Neptunium', mass: '237', category: 'actinide', period: 7, group: 3, electron: '[Rn] 5f⁴ 6d¹ 7s²' },
  { number: 94, symbol: 'Pu', name: 'Plutonium', mass: '244', category: 'actinide', period: 7, group: 3, electron: '[Rn] 5f⁶ 7s²' },
  { number: 95, symbol: 'Am', name: 'Amerisium', mass: '243', category: 'actinide', period: 7, group: 3, electron: '[Rn] 5f⁷ 7s²' },
  { number: 96, symbol: 'Cm', name: 'Kurium', mass: '247', category: 'actinide', period: 7, group: 3, electron: '[Rn] 5f⁷ 6d¹ 7s²' },
  { number: 97, symbol: 'Bk', name: 'Berkelium', mass: '247', category: 'actinide', period: 7, group: 3, electron: '[Rn] 5f⁹ 7s²' },
  { number: 98, symbol: 'Cf', name: 'Kalifornium', mass: '251', category: 'actinide', period: 7, group: 3, electron: '[Rn] 5f¹⁰ 7s²' },
  { number: 99, symbol: 'Es', name: 'Einsteinium', mass: '252', category: 'actinide', period: 7, group: 3, electron: '[Rn] 5f¹¹ 7s²' },
  { number: 100, symbol: 'Fm', name: 'Fermium', mass: '257', category: 'actinide', period: 7, group: 3, electron: '[Rn] 5f¹² 7s²' },
  { number: 101, symbol: 'Md', name: 'Mendelevium', mass: '258', category: 'actinide', period: 7, group: 3, electron: '[Rn] 5f¹³ 7s²' },
  { number: 102, symbol: 'No', name: 'Nobelium', mass: '259', category: 'actinide', period: 7, group: 3, electron: '[Rn] 5f¹⁴ 7s²' },
  { number: 103, symbol: 'Lr', name: 'Lawrensium', mass: '262', category: 'actinide', period: 7, group: 3, electron: '[Rn] 5f¹⁴ 7s² 7p¹' },
  { number: 104, symbol: 'Rf', name: 'Ruterfordium', mass: '267', category: 'transition-metal', period: 7, group: 4, electron: '[Rn] 5f¹⁴ 6d² 7s²' },
  { number: 105, symbol: 'Db', name: 'Dubnium', mass: '270', category: 'transition-metal', period: 7, group: 5, electron: '[Rn] 5f¹⁴ 6d³ 7s²' },
  { number: 106, symbol: 'Sg', name: 'Seaborgium', mass: '271', category: 'transition-metal', period: 7, group: 6, electron: '[Rn] 5f¹⁴ 6d⁴ 7s²' },
  { number: 107, symbol: 'Bh', name: 'Bohrium', mass: '270', category: 'transition-metal', period: 7, group: 7, electron: '[Rn] 5f¹⁴ 6d⁵ 7s²' },
  { number: 108, symbol: 'Hs', name: 'Hasium', mass: '277', category: 'transition-metal', period: 7, group: 8, electron: '[Rn] 5f¹⁴ 6d⁶ 7s²' },
  { number: 109, symbol: 'Mt', name: 'Meitnerium', mass: '276', category: 'unknown', period: 7, group: 9, electron: '[Rn] 5f¹⁴ 6d⁷ 7s²' },
  { number: 110, symbol: 'Ds', name: 'Darmstadtium', mass: '281', category: 'unknown', period: 7, group: 10, electron: '[Rn] 5f¹⁴ 6d⁸ 7s²' },
  { number: 111, symbol: 'Rg', name: 'Roentgenium', mass: '280', category: 'unknown', period: 7, group: 11, electron: '[Rn] 5f¹⁴ 6d⁹ 7s²' },
  { number: 112, symbol: 'Cn', name: 'Kopernikium', mass: '285', category: 'transition-metal', period: 7, group: 12, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s²' },
  { number: 113, symbol: 'Nh', name: 'Nihonium', mass: '284', category: 'unknown', period: 7, group: 13, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹' },
  { number: 114, symbol: 'Fl', name: 'Flerovium', mass: '289', category: 'unknown', period: 7, group: 14, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²' },
  { number: 115, symbol: 'Mc', name: 'Moskovium', mass: '288', category: 'unknown', period: 7, group: 15, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³' },
  { number: 116, symbol: 'Lv', name: 'Livermorium', mass: '293', category: 'unknown', period: 7, group: 16, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴' },
  { number: 117, symbol: 'Ts', name: 'Tennesin', mass: '294', category: 'unknown', period: 7, group: 17, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵' },
  { number: 118, symbol: 'Og', name: 'Oganesson', mass: '294', category: 'unknown', period: 7, group: 18, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶' },
];

const CATEGORIES: { [key: string]: { label: string; color: string } } = {
  'alkali-metal': { label: 'Logam Alkali', color: '#ff6b6b' },
  'alkaline-earth': { label: 'Logam Alkali Tanah', color: '#ffa726' },
  'transition-metal': { label: 'Logam Transisi', color: '#66bb6a' },
  'post-transition': { label: 'Logam Pasca-Transisi', color: '#42a5f5' },
  'metalloid': { label: 'Metaloid', color: '#ab47bc' },
  'nonmetal': { label: 'Non-logam', color: '#26c6da' },
  'halogen': { label: 'Halogen', color: '#ff7043' },
  'noble-gas': { label: 'Gas Mulia', color: '#8d6e63' },
  'lanthanide': { label: 'Lantanida', color: '#7986cb' },
  'actinide': { label: 'Aktinida', color: '#a1887f' },
  'unknown': { label: 'Tidak Diketahui', color: '#78909c' },
};

export default function PeriodicTable() {
  const [selectedElement, setSelectedElement] = useState<typeof ELEMENTS[0] | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const getElementColor = (category: string): string => CATEGORIES[category]?.color || '#78909c';

  // Create 2D layout (7 periods x 18 groups)
  const buildTableLayout = () => {
    const layout: (typeof ELEMENTS[0] | null)[][] = Array(9).fill(null).map(() => Array(18).fill(null));
    
    ELEMENTS.forEach((el) => {
      let row = el.period - 1;
      let col = el.group - 1;
      
      // Handle lanthanides (period 6, group 3 -> show in row 8)
      if (el.category === 'lanthanide') {
        row = 8;
        col = (el.number - 57); // 57 is La, 58-71 are lanthanides
      }
      
      // Handle actinides (period 7, group 3 -> show in row 9)
      if (el.category === 'actinide') {
        // This would be row 9 but we'll show them inline
        row = el.period - 1;
        col = el.group - 1;
      }
      
      if (row < 9 && col < 18 && col >= 0) {
        layout[row][col] = el;
      }
    });
    
    return layout;
  };

  const tableLayout = buildTableLayout();
  const cellSize = 70;

  const renderElement = (element: typeof ELEMENTS[0] | null) => {
    if (!element) {
      return (
        <View
          style={[
            styles.cell,
            { width: cellSize, height: cellSize },
          ]}
        />
      );
    }

    return (
      <TouchableOpacity
        key={element.number}
        onPress={() => {
          setSelectedElement(element);
          setShowInfo(true);
        }}
        style={[
          styles.cell,
          styles.elementCell,
          { 
            backgroundColor: getElementColor(element.category),
            width: cellSize,
            height: cellSize,
          },
        ]}
      >
        <Text style={styles.elementNumber}>{element.number}</Text>
        <Text style={styles.elementSymbol}>{element.symbol}</Text>
        <Text style={styles.elementName}>{element.name}</Text>
        <Text style={styles.elementMass}>{element.mass}</Text>
      </TouchableOpacity>
    );
  };

  const legendItems = Object.entries(CATEGORIES).map(([key, { label, color }]) => (
    <View key={key} style={styles.legendItem}>
      <View style={[styles.legendColor, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  ));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tabel Periodik Interaktif</Text>
          <Text style={styles.subtitle}>Scroll untuk melihat semua unsur. Klik untuk detail</Text>
        </View>

        {/* Horizontal Scrollable Grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.horizontalScroll}>
          <View style={styles.tableContainer}>
            {tableLayout.map((row, rowIdx) => (
              <View key={`row-${rowIdx}`} style={styles.row}>
                {row.map((element, colIdx) => (
                  <View key={`${rowIdx}-${colIdx}`}>
                    {renderElement(element)}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Legend */}
        <View style={styles.legend}>
          {legendItems}
        </View>
      </ScrollView>

      {/* Element Info Modal */}
      <Modal visible={showInfo} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowInfo(false)}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>

            {selectedElement && (
              <View style={styles.infoContainer}>
                <View style={styles.infoHeader}>
                  <Text style={styles.infoTitle}>{selectedElement.name}</Text>
                  <Text style={styles.infoSymbol}>{selectedElement.symbol}</Text>
                </View>

                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Nomor Atom:</Text>
                    <Text style={styles.infoValue}>{selectedElement.number}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Massa Atom:</Text>
                    <Text style={styles.infoValue}>{selectedElement.mass}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Kategori:</Text>
                    <Text style={styles.infoValue}>{CATEGORIES[selectedElement.category]?.label}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Periode:</Text>
                    <Text style={styles.infoValue}>{selectedElement.period}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Golongan:</Text>
                    <Text style={styles.infoValue}>{selectedElement.group}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Konfigurasi Elektron:</Text>
                    <Text style={styles.infoValue}>{selectedElement.electron}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#0f172a' },
  header: { alignItems: 'center', marginVertical: 20 },
  title: { fontSize: 28, color: '#64b5f6', fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#b0bec5', fontSize: 13 },

  // Horizontal scroll for periodic table
  horizontalScroll: {
    marginBottom: 24,
  },

  // Periodic table grid
  tableContainer: {
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 2,
  },
  cell: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  elementCell: {
    padding: 6,
  },
  elementNumber: { fontSize: 9, opacity: 0.7, position: 'absolute', top: 2, left: 3 },
  elementSymbol: { fontSize: 14, fontWeight: '700', color: '#fff' },
  elementName: { fontSize: 7, opacity: 0.8, color: '#fff', textAlign: 'center', marginTop: 1 },
  elementMass: { fontSize: 6, opacity: 0.6, position: 'absolute', bottom: 2, right: 3 },

  // Legend
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 20,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '48%' },
  legendColor: { width: 18, height: 18, borderRadius: 3, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  legendLabel: { color: '#e3f2fd', fontSize: 11 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 16,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeBtn: {
    position: 'absolute',
    top: 15,
    right: 20,
    padding: 8,
    borderRadius: 50,
  },
  closeBtnText: { fontSize: 24, color: '#64b5f6', fontWeight: '700' },

  // Info
  infoContainer: {},
  infoHeader: { alignItems: 'center', marginBottom: 25 },
  infoTitle: { fontSize: 28, color: '#64b5f6', fontWeight: '700', marginBottom: 10 },
  infoSymbol: { fontSize: 48, fontWeight: '700', color: '#fff' },

  infoGrid: { gap: 10 },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 10,
  },
  infoLabel: { fontWeight: '700', color: '#64b5f6', fontSize: 12 },
  infoValue: { fontWeight: '700', color: '#fff', fontSize: 12 },
});
