#!/usr/bin/env python3
"""Édition d'un fichier PARTAGÉ sous verrou global (auteurs parallèles, unité 10, 2026-10-04).

Chaque commande relit le fichier À L'INTÉRIEUR d'un flock global, applique UNE modification exacte et réécrit :
deux auteurs ne peuvent jamais s'écraser.

  python3 locked_edit.py json-set <file.json> <dotted.key> <value.json>     # remplace/crée la clé par le contenu JSON
  python3 locked_edit.py replace <file> <old.txt> <new.txt>                  # remplace un texte EXACT et UNIQUE
  python3 locked_edit.py append-before <file> <anchor.txt> <new.txt>         # insère new.txt juste avant l'ancre UNIQUE
Les chemins relatifs sont résolus depuis la racine du dépôt smarter-academy-dz.
"""
import fcntl, json, os, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
LOCK = '/tmp/smarter-academy-dz-unit10.lock'


def rd(p):
    return Path(p).read_text(encoding='utf-8')


def main():
    cmd, target, *args = sys.argv[1:]
    path = (ROOT / target) if not os.path.isabs(target) else Path(target)
    with open(LOCK, 'w') as lk:
        fcntl.flock(lk, fcntl.LOCK_EX)
        if cmd == 'json-set':
            key, val = args
            data = json.loads(path.read_text(encoding='utf-8'))
            value = json.loads(rd(val))
            node = data
            parts = key.split('.')
            for k in parts[:-1]:
                node = node.setdefault(k, {})
            node[parts[-1]] = value
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        elif cmd in ('replace', 'append-before'):
            old, new = rd(args[0]), rd(args[1])
            s = path.read_text(encoding='utf-8')
            n = s.count(old)
            if n != 1:
                sys.exit(f'ERREUR: le texte est présent {n} fois dans {target} (il faut exactement 1)')
            s = s.replace(old, new if cmd == 'replace' else new + old, 1)
            path.write_text(s, encoding='utf-8')
        else:
            sys.exit(f'commande inconnue {cmd}')
    print(f'ok {cmd} {target}')


if __name__ == '__main__':
    main()
