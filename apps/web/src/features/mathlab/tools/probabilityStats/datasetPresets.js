/**
 * Les SÉRIES D'EXEMPLE du الإحصاء الوصفي, par niveau — chacune montre une
 * idée : une série bimodale (15 et 21), des notes sur 20, une série pour le
 * diagramme circulaire (peu de modalités), une série sans mode, des tailles
 * pour l'histogramme (continue, 40 valeurs).
 */
export const DATASET_PRESETS = Object.freeze([
  { id: 'simple', level: 'beginner', text: '12, 15, 15, 18, 20, 21, 21, 25' },
  { id: 'marks', level: 'beginner', text: '8 ; 12 ; 12 ; 14 ; 9 ; 15 ; 12 ; 10 ; 17 ; 11 ; 12 ; 14 ; 13 ; 16 ; 7' },
  { id: 'siblings', level: 'intermediate', text: '0, 1, 1, 2, 2, 2, 3, 1, 0, 2, 4, 1, 2, 3, 1, 2, 5, 1, 2, 0' },
  { id: 'noMode', level: 'intermediate', text: '3, 7, 9, 12, 15, 18' },
  {
    id: 'heights',
    level: 'advanced',
    text: '152 ; 158 ; 161 ; 163 ; 164 ; 165 ; 166 ; 167 ; 168 ; 168 ; 169 ; 170 ; 170 ; 171 ; 171 ; 172 ; 172 ; 173 ; 173 ; 174 ; '
      + '174 ; 175 ; 175 ; 176 ; 176 ; 177 ; 178 ; 178 ; 179 ; 180 ; 181 ; 182 ; 183 ; 184 ; 185 ; 186 ; 188 ; 190 ; 193 ; 197',
  },
]);

export function getDatasetPreset(id) {
  return DATASET_PRESETS.find((preset) => preset.id === id) ?? null;
}
