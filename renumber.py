import os
import re

# 1. File renaming
modules_dir = 'src/lessons/college/3e/fonctions-lineaires-affines/modules'

# Remove old files
os.remove(os.path.join(modules_dir, 'Module01Simulateur.jsx'))
os.remove(os.path.join(modules_dir, 'Module02Introduction.jsx'))

# Rename 03 to 02, 04 to 03, etc.
rename_map = {
    'Module03FonctionLineaire.jsx': 'Module02FonctionLineaire.jsx',
    'Module04FonctionAffine.jsx': 'Module03FonctionAffine.jsx',
    'Module05LectureGraphique.jsx': 'Module04LectureGraphique.jsx',
    'Module06CalculCoefficient.jsx': 'Module05CalculCoefficient.jsx',
    'Module07MissionForfait.jsx': 'Module06MissionForfait.jsx'
}

for old, new in rename_map.items():
    old_path = os.path.join(modules_dir, old)
    new_path = os.path.join(modules_dir, new)
    if os.path.exists(old_path):
        os.rename(old_path, new_path)

def replace_in_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

# 2. Fix the newly renamed Module files internals
# We need to change moduleNumber and totalModules, and the next/prev links.
# Module02 (was 03) -> moduleNumber=2, prevLink=1, nextLink=3
# This is tricky with simple string replace, so we use regex or direct replacements.
for new_name in rename_map.values():
    filepath = os.path.join(modules_dir, new_name)
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Extract current moduleNumber to decrement it
    match = re.search(r'moduleNumber=\{([0-9]+)\}', content)
    if match:
        old_num = int(match.group(1))
        new_num = old_num - 1
        content = content.replace(f'moduleNumber={{{old_num}}}', f'moduleNumber={{{new_num}}}')
        content = content.replace('totalModules={7}', 'totalModules={6}')
        
        # update markModuleCompleted('L3') -> 'L2' etc.
        content = content.replace(f"markModuleCompleted('L{old_num}')", f"markModuleCompleted('L{new_num}')")
        
        # Update function name
        old_func = new_name.replace('Module0', 'Module0' + str(old_num)).replace('.jsx', '')
        # Wait, the file was renamed from Module03... to Module02..., the function name inside is still Module03...
        old_func = list(rename_map.keys())[list(rename_map.values()).index(new_name)].replace('.jsx', '')
        new_func = new_name.replace('.jsx', '')
        content = content.replace(old_func, new_func)

        # Update links
        content = content.replace(f'/fonctions-lineaires-affines/{old_num - 1}', f'/fonctions-lineaires-affines/{new_num - 1}')
        content = content.replace(f'/fonctions-lineaires-affines/{old_num + 1}', f'/fonctions-lineaires-affines/{new_num + 1}')
        
    with open(filepath, 'w') as f:
        f.write(content)

# 3. Update App.jsx
app_replacements = [
    ('import Module01Simulateur from \'./lessons/college/3e/fonctions-lineaires-affines/modules/Module01Simulateur\';', ''),
    ('import Module02Introduction from \'./lessons/college/3e/fonctions-lineaires-affines/modules/Module02Introduction\';', 'import Module01IntroSimulateur from \'./lessons/college/3e/fonctions-lineaires-affines/modules/Module01IntroSimulateur\';'),
    ('Module03FonctionLineaire', 'Module02FonctionLineaire'),
    ('Module04FonctionAffine', 'Module03FonctionAffine'),
    ('Module05LectureGraphique', 'Module04LectureGraphique'),
    ('Module06CalculCoefficient', 'Module05CalculCoefficient'),
    ('Module07MissionForfait', 'Module06MissionForfait'),
    ('<Route path="1" element={<Module01Simulateur />} />', '<Route path="1" element={<Module01IntroSimulateur />} />'),
    ('<Route path="2" element={<Module02Introduction />} />\n', '')
]

with open('src/App.jsx', 'r') as f:
    content = f.read()
    
# Decrement route paths for 3,4,5,6,7
for old_path in range(7, 2, -1):
    content = content.replace(f'path="{old_path}"', f'path="{old_path - 1}"')

for old, new in app_replacements:
    content = content.replace(old, new)

with open('src/App.jsx', 'w') as f:
    f.write(content)

print("Renumbering complete.")
