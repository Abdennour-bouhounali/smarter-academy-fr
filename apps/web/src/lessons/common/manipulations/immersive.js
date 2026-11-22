import { createContext, useContext } from 'react';

/**
 * L'écran de JEU d'un labo (`ManipulationShell immersive`, 2026-10-27, propriétaire : « le labo couvre tout l'écran du laptop ») :
 * `true` quand le labo occupe tout l'écran (plein écran du navigateur, ou à défaut une couche fixe sur la fenêtre). Un type le lit
 * pour poser sa mise en page de jeu (scène à la hauteur de l'écran) ; hors d'un shell, `false`.
 */
export const ManipulationImmersiveContext = createContext(false);

export const useManipulationImmersive = () => useContext(ManipulationImmersiveContext);
