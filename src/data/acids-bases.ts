export interface Acid {
  id: string;
  name: string;
  formula: string;
  color: string;
}

export interface Base {
  id: string;
  name: string;
  formula: string;
  color: string;
}

export interface Reaction {
  ph: number;
  color: string;
  equation: string;
  description: string;
}

// Helper: subscript conversion for formulas
export const createSubscript = (formula: string): string => {
  return formula
    .replace(/0/g, "₀")
    .replace(/1/g, "₁")
    .replace(/2/g, "₂")
    .replace(/3/g, "₃")
    .replace(/4/g, "₄")
    .replace(/5/g, "₅")
    .replace(/6/g, "₆")
    .replace(/7/g, "₇")
    .replace(/8/g, "₈")
    .replace(/9/g, "₉");
};

export const ACIDS: Acid[] = [
  { id: "HCl", name: "Hydrochloric Acid", formula: "HCl", color: "#f08080" },
  { id: "HBr", name: "Hydrobromic Acid", formula: "HBr", color: "#f08080" },
  { id: "HNO3", name: "Nitric Acid", formula: "HNO₃", color: "#f08080" },
  { id: "H2SO4", name: "Sulfuric Acid", formula: "H₂SO₄", color: "#f08080" },
  { id: "H3PO4", name: "Phosphoric Acid", formula: "H₃PO₄", color: "#f08080" },
  { id: "CH3COOH", name: "Acetic Acid", formula: "CH₃COOH", color: "#ff9999" },
  { id: "HF", name: "Hydrofluoric Acid", formula: "HF", color: "#ff9999" },
  { id: "H2CO3", name: "Carbonic Acid", formula: "H₂CO₃", color: "#ff9999" },
];

export const BASES: Base[] = [
  { id: "NaOH", name: "Sodium Hydroxide", formula: "NaOH", color: "#87cefa" },
  { id: "KOH", name: "Potassium Hydroxide", formula: "KOH", color: "#87cefa" },
  { id: "Ca(OH)2", name: "Calcium Hydroxide", formula: "Ca(OH)₂", color: "#87cefa" },
  { id: "Ba(OH)2", name: "Barium Hydroxide", formula: "Ba(OH)₂", color: "#87cefa" },
  { id: "Mg(OH)2", name: "Magnesium Hydroxide", formula: "Mg(OH)₂", color: "#87cefa" },
  { id: "NH3", name: "Ammonia", formula: "NH₃", color: "#b0e0e6" },
  { id: "Na2CO3", name: "Sodium Carbonate", formula: "Na₂CO₃", color: "#b0e0e6" },
];

export const REACTIONS: Record<string, Reaction> = {
  HCl_NaOH: {
    ph: 7,
    color: "#90ee90",
    equation: "HCl + NaOH → NaCl + H₂O",
    description: "Strong acid and strong base neutralize to form salt and water (neutral pH).",
  },
  HCl_KOH: {
    ph: 7,
    color: "#90ee90",
    equation: "HCl + KOH → KCl + H₂O",
    description: "Complete neutralization reaction.",
  },
  HBr_NaOH: {
    ph: 7,
    color: "#90ee90",
    equation: "HBr + NaOH → NaBr + H₂O",
    description: "Neutralization produces NaBr and water.",
  },
  HNO3_NaOH: {
    ph: 7,
    color: "#90ee90",
    equation: "HNO₃ + NaOH → NaNO₃ + H₂O",
    description: "Sodium nitrate forms in solution.",
  },
  HNO3_KOH: {
    ph: 7,
    color: "#90ee90",
    equation: "HNO₃ + KOH → KNO₃ + H₂O",
    description: "Potassium nitrate and water.",
  },
  "HCl_Ca(OH)2": {
    ph: 7,
    color: "#90ee90",
    equation: "2 HCl + Ca(OH)₂ → CaCl₂ + 2 H₂O",
    description: "Requires 2 mol HCl for 1 mol Ca(OH)₂.",
  },
  "HCl_Ba(OH)2": {
    ph: 7,
    color: "#90ee90",
    equation: "2 HCl + Ba(OH)₂ → BaCl₂ + 2 H₂O",
    description: "Requires 2:1 ratio to neutralize.",
  },
  H2SO4_NaOH: {
    ph: 7,
    color: "#90ee90",
    equation: "H₂SO₄ + 2 NaOH → Na₂SO₄ + 2 H₂O",
    description: "Diprotic acid requires 2 mol NaOH.",
  },
  H2SO4_KOH: {
    ph: 7,
    color: "#90ee90",
    equation: "H₂SO₄ + 2 KOH → K₂SO₄ + 2 H₂O",
    description: "Sulfate salt forms.",
  },
  "H2SO4_Ca(OH)2": {
    ph: 7,
    color: "#90ee90",
    equation: "H₂SO₄ + Ca(OH)₂ → CaSO₄ + 2 H₂O",
    description: "1:1 ratio because 2 OH⁻ neutralize 2 H⁺.",
  },
  "H2SO4_Mg(OH)2": {
    ph: 7,
    color: "#90ee90",
    equation: "H₂SO₄ + Mg(OH)₂ → MgSO₄ + 2 H₂O",
    description: "Magnesium sulfate forms; 1:1 ratio.",
  },
  "HCl_Mg(OH)2": {
    ph: 7,
    color: "#90ee90",
    equation: "2 HCl + Mg(OH)₂ → MgCl₂ + 2 H₂O",
    description: "Requires 2 mol HCl for 1 mol Mg(OH)₂.",
  },
  H3PO4_NaOH: {
    ph: 7,
    color: "#90ee90",
    equation: "H₃PO₄ + 3 NaOH → Na₃PO₄ + 3 H₂O",
    description: "Triprotic acid requires 3 mol NaOH for complete neutralization.",
  },
  H3PO4_KOH: {
    ph: 7,
    color: "#90ee90",
    equation: "H₃PO₄ + 3 KOH → K₃PO₄ + 3 H₂O",
    description: "Potassium phosphate and water.",
  },
  CH3COOH_NaOH: {
    ph: 8.5,
    color: "#add8e6",
    equation: "CH₃COOH + NaOH → CH₃COONa + H₂O",
    description: "Weak acid buffer solution tends to pH > 7.",
  },
  CH3COOH_KOH: {
    ph: 9.0,
    color: "#b0e0e6",
    equation: "CH₃COOH + KOH → CH₃COOK + H₂O",
    description: "Slightly basic after reaction.",
  },
  HF_NaOH: {
    ph: 8.5,
    color: "#add8e6",
    equation: "HF + NaOH → NaF + H₂O",
    description: "Weak acid neutralized by strong base.",
  },
  HCl_NH3: {
    ph: 5.5,
    color: "#ffb6c1",
    equation: "HCl + NH₃ → NH₄Cl",
    description: "Ammonium chloride salt forms; solution is slightly acidic.",
  },
  H2SO4_NH3: {
    ph: 5.0,
    color: "#ffc0cb",
    equation: "H₂SO₄ + 2 NH₃ → (NH₄)₂SO₄",
    description: "Ammonium sulfate forms.",
  },
  HNO3_NH3: {
    ph: 5.5,
    color: "#ffb6c1",
    equation: "HNO₃ + NH₃ → NH₄NO₃",
    description: "Ammonium nitrate; solution is slightly acidic.",
  },
  H2CO3_NaOH: {
    ph: 7,
    color: "#90ee90",
    equation: "H₂CO₃ + 2 NaOH → Na₂CO₃ + 2 H₂O",
    description: "Complete neutralization produces carbonate.",
  },
  HCl_Na2CO3: {
    ph: 6,
    color: "#ffb6c1",
    equation: "2 HCl + Na₂CO₃ → 2 NaCl + H₂O + CO₂↑",
    description: "CO₂ gas is released.",
  },
  "HNO3_Mg(OH)2": {
    ph: 7,
    color: "#90ee90",
    equation: "2 HNO₃ + Mg(OH)₂ → Mg(NO₃)₂ + 2 H₂O",
    description: "Magnesium nitrate forms.",
  },
  "HBr_Mg(OH)2": {
    ph: 7,
    color: "#90ee90",
    equation: "2 HBr + Mg(OH)₂ → MgBr₂ + 2 H₂O",
    description: "Magnesium bromide forms.",
  },
  "H3PO4_Mg(OH)2": {
    ph: 7,
    color: "#90ee90",
    equation: "2 H₃PO₄ + 3 Mg(OH)₂ → Mg₃(PO₄)₂ + 6 H₂O",
    description: "Magnesium phosphate forms.",
  },
};
