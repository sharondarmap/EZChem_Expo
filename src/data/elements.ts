export interface Element {
  an: number;
  symbol: string;
  name: string;
  group: number;
  period: number;
}

export const ELEMENTS: Element[] = [
  // Period 1
  { an: 1, symbol: "H", name: "Hydrogen", group: 1, period: 1 },
  { an: 2, symbol: "He", name: "Helium", group: 18, period: 1 },

  // Period 2
  { an: 3, symbol: "Li", name: "Lithium", group: 1, period: 2 },
  { an: 4, symbol: "Be", name: "Beryllium", group: 2, period: 2 },
  { an: 5, symbol: "B", name: "Boron", group: 13, period: 2 },
  { an: 6, symbol: "C", name: "Carbon", group: 14, period: 2 },
  { an: 7, symbol: "N", name: "Nitrogen", group: 15, period: 2 },
  { an: 8, symbol: "O", name: "Oxygen", group: 16, period: 2 },
  { an: 9, symbol: "F", name: "Fluorine", group: 17, period: 2 },
  { an: 10, symbol: "Ne", name: "Neon", group: 18, period: 2 },

  // Period 3
  { an: 11, symbol: "Na", name: "Sodium", group: 1, period: 3 },
  { an: 12, symbol: "Mg", name: "Magnesium", group: 2, period: 3 },
  { an: 13, symbol: "Al", name: "Aluminum", group: 13, period: 3 },
  { an: 14, symbol: "Si", name: "Silicon", group: 14, period: 3 },
  { an: 15, symbol: "P", name: "Phosphorus", group: 15, period: 3 },
  { an: 16, symbol: "S", name: "Sulfur", group: 16, period: 3 },
  { an: 17, symbol: "Cl", name: "Chlorine", group: 17, period: 3 },
  { an: 18, symbol: "Ar", name: "Argon", group: 18, period: 3 },

  // Period 4
  { an: 19, symbol: "K", name: "Potassium", group: 1, period: 4 },
  { an: 20, symbol: "Ca", name: "Calcium", group: 2, period: 4 },
  { an: 31, symbol: "Ga", name: "Gallium", group: 13, period: 4 },
  { an: 32, symbol: "Ge", name: "Germanium", group: 14, period: 4 },
  { an: 33, symbol: "As", name: "Arsenic", group: 15, period: 4 },
  { an: 34, symbol: "Se", name: "Selenium", group: 16, period: 4 },
  { an: 35, symbol: "Br", name: "Bromine", group: 17, period: 4 },
  { an: 36, symbol: "Kr", name: "Krypton", group: 18, period: 4 },

  // Period 5
  { an: 37, symbol: "Rb", name: "Rubidium", group: 1, period: 5 },
  { an: 38, symbol: "Sr", name: "Strontium", group: 2, period: 5 },
  { an: 49, symbol: "In", name: "Indium", group: 13, period: 5 },
  { an: 50, symbol: "Sn", name: "Tin", group: 14, period: 5 },
  { an: 51, symbol: "Sb", name: "Antimony", group: 15, period: 5 },
  { an: 52, symbol: "Te", name: "Tellurium", group: 16, period: 5 },
  { an: 53, symbol: "I", name: "Iodine", group: 17, period: 5 },
  { an: 54, symbol: "Xe", name: "Xenon", group: 18, period: 5 },

  // Period 6
  { an: 55, symbol: "Cs", name: "Cesium", group: 1, period: 6 },
  { an: 56, symbol: "Ba", name: "Barium", group: 2, period: 6 },
  { an: 81, symbol: "Tl", name: "Thallium", group: 13, period: 6 },
  { an: 82, symbol: "Pb", name: "Lead", group: 14, period: 6 },
  { an: 83, symbol: "Bi", name: "Bismuth", group: 15, period: 6 },
  { an: 84, symbol: "Po", name: "Polonium", group: 16, period: 6 },
  { an: 85, symbol: "At", name: "Astatine", group: 17, period: 6 },
  { an: 86, symbol: "Rn", name: "Radon", group: 18, period: 6 },

  // Period 7
  { an: 87, symbol: "Fr", name: "Francium", group: 1, period: 7 },
  { an: 88, symbol: "Ra", name: "Radium", group: 2, period: 7 },
];
