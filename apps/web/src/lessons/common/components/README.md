# Documentation MathInput et MathText

## 1. Affichage de mathématiques (`MathText`)

Le composant `<MathText>` sert **uniquement** à l'affichage (rendu KaTeX).

```jsx
import MathText from 'path/to/common/components/MathText';

// En ligne :
<p>La formule de Pythagore est <MathText>$a^2 + b^2 = c^2$</MathText>.</p>

// En bloc centré :
<MathText>$$x = \frac{-b \pm \sqrt{\Delta}}{2a}$$</MathText>
```

> **Attention** : Ne l'utilisez pas pour de la saisie utilisateur.

---

## 2. Saisie de mathématiques (`MathInput`)

Le composant `<MathInput>` (basé sur MathLive) est à utiliser dès que l'élève doit taper une expression complexe (puissance, racine, fraction, équation).

### Quand l'utiliser ?
✅ Réponse sous forme de fraction (ex: `3/4`)
✅ Réponse avec racine (ex: `\sqrt{5}`)
✅ Équation (ex: `2x = 4`)
✅ Nombre simple mais dans un contexte algébrique (ex: coeff directeur)

### Quand NE PAS l'utiliser ?
❌ QCM (utilisez des boutons)
❌ Réponse de texte pur (ex: "Oui", "Rectangle")
❌ Formulaire de connexion

### Exemple d'utilisation

```jsx
import React, { useState } from 'react';
import MathInput from 'path/to/common/components/MathInput';
import { compareMathExpressions } from 'path/to/common/utils/mathComparison';

export default function Exercice() {
  const [answer, setAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);

  const check = () => {
    // compareMathExpressions va analyser structurellement les deux expressions
    // pour voir si elles sont algébriquement équivalentes.
    if (compareMathExpressions(answer, "x^2 + 5x")) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  return (
    <div>
      <p>Développe : x(x + 5)</p>
      <MathInput 
        value={answer}
        onChange={setAnswer} // onChange renvoie du LaTeX
        placeholder="Ta réponse"
      />
      <button onClick={check}>Vérifier</button>
    </div>
  );
}
```

## 3. Comparaison mathématique (`mathComparison.js`)

La fonction `compareMathExpressions(expr1, expr2)` utilise le moteur *@cortex-js/compute-engine*.
Elle permet de valider des expressions équivalentes :

* `"x^2+5x"` et `"x^2 + 5*x"` → **Vrai**
* `"(x+2)(x+3)"` et `"x^2+5x+6"` → **Vrai** (selon le niveau d'évaluation)
* `"1/2"` et `"0.5"` → **Vrai**
