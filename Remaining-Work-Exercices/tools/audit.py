#!/usr/bin/env python3
"""audit.py <lesson> — branche l'oracle BEM de la leçon, retire ses entrées en ligne et son exemption policy.json."""
import sys, re, json
L = sys.argv[1]; R = '/home/abdennour/websites/smarter-academy/smarter-academy-dz/'
K = 'ORACLE_BEM_' + re.sub(r'[^A-Z0-9]', '_', L.upper())
p = R + 'scripts/practice-answer-oracle.test.mjs'
s = open(p).read()
if K not in s:
    anchor = "// Unité 1, au format BEM, une leçon à la fois (2026-10-06).\n"
    i = s.index(anchor) + len(anchor)
    while s[i:].startswith('import { ORACLE as ORACLE_BEM_'):
        i = s.index('\n', i) + 1
    s = s[:i] + f"import {{ ORACLE as {K} }} from './practice-oracle/{L}.mjs';\n" + s[i:]
    s = s.replace('\n};\n\n/**\n * Le cas signalé', f'\n  ...{K},\n}};\n\n/**\n * Le cas signalé', 1)
    assert f'...{K},' in s, 'spread not inserted'
lines = s.split('\n'); n = len(lines)
lines = [l for l in lines if not re.match(r"^\s*'ex-4am-%s-l\d-\d{3}:q\w+':" % re.escape(L), l)]
print('inline entries removed:', n - len(lines))
open(p, 'w').write('\n'.join(lines))
pp = R + 'content/practice/policy.json'; d = json.load(open(pp))
if d['lessons'].pop(L, None) is not None:
    open(pp, 'w').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n'); print('policy exemption removed')
