#!/bin/bash
# usage: switch.sh <lesson> — bascule une leçon au format BEM puis registre + cache + e2e
set -e
L=$1; R=/home/abdennour/websites/smarter-academy/smarter-academy-dz; S=${QA_DIR:-/tmp/bem-qa}; mkdir -p $S
cd $R
python3 -c "
import json;p='content/practice/exam-style.json';d=json.load(open(p))
'$L' in d or d.append('$L'); open(p,'w').write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')"
node scripts/validate-exercises.mjs --strict 2>&1 | grep -E "Validation|erreur" 
node packages/core/curriculum/exportContentRegistry.mjs | tail -1
cd apps/api && php artisan smarter:import-content-registry 2>&1 | tail -1 && php artisan cache:clear | tail -1
if [ ! -s $S/tok ] ; then php artisan tinker --execute="echo App\Models\User::where('email','qa-eleve@smarter.dz')->first()->createToken('e2e-bem-unit1')->plainTextToken;" 2>&1 | tail -1 > $S/tok; fi
cd ../web && mkdir -p $S/qa/$L
e2e() { LESSON=$L PRACTICE_TOKEN=$(cat $S/tok) SHOTS_DIR=$S/qa/$L timeout 900 node e2e/lesson-kit/practice-exam-sheet.mjs > $S/qa/$L.log 2>&1 || true; }
# 1er passage après import + cache:clear : Vite compile la route à froid et la feuille dépasse le délai → un seul nouvel essai.
e2e; grep -q "^FAIL" $S/qa/$L.log && { echo "e2e $L (1er essai): $(tail -1 $S/qa/$L.log) — nouvel essai"; e2e; }
echo "e2e $L: $(tail -1 $S/qa/$L.log)"; grep "^FAIL" $S/qa/$L.log | head -5 || true
