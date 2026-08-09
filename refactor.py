import os

def replace_in_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

# 1. Update App.jsx
app_replacements = [
    ('./modules/college', './lessons/college'),
    ('/lessons/Lesson', '/modules/Module'),
    ('Lesson0', 'Module0'),
    ('LessonPlaceholder', 'ModulePlaceholder'),
    ('<Lesson', '<Module'),
    ('</Lesson', '</Module')
]
replace_in_file('src/App.jsx', app_replacements)

# 2. Update ModuleLayout.jsx
layout_replacements = [
    ('LessonLayout', 'ModuleLayout'),
    ('lessonNumber', 'moduleNumber'),
    ('totalLessons', 'totalModules'),
    ('lessonTitle', 'moduleTitle'),
    ('lessonSubtitle', 'moduleSubtitle'),
    ('Leçon {moduleNumber}', 'Module {moduleNumber}'),
    ('Micro-Leçon', 'Micro-Module'),
    ('Leçon ', 'Module ')
]
replace_in_file('src/lessons/common/components/ModuleLayout.jsx', layout_replacements)

# 3. Update all Module*.jsx files
modules_dir = 'src/lessons/college/3e/fonctions-lineaires-affines/modules'
for filename in os.listdir(modules_dir):
    if filename.endswith('.jsx'):
        filepath = os.path.join(modules_dir, filename)
        replacements = [
            ('LessonLayout', 'ModuleLayout'),
            ('Lesson0', 'Module0'),
            ('LessonPlaceholder', 'ModulePlaceholder'),
            ('lessonNumber', 'moduleNumber'),
            ('totalLessons', 'totalModules'),
            ('lessonTitle', 'moduleTitle'),
            ('lessonSubtitle', 'moduleSubtitle'),
            ('Leçon ', 'Module '),
            ('markLessonCompleted', 'markModuleCompleted')
        ]
        replace_in_file(filepath, replacements)

# 4. Update the index.jsx (Roadmap)
index_replacements = [
    ('Micro-Leçon', 'Micro-Module'),
    ('micro-leçons', 'micro-modules'),
    ('totalLessons', 'totalModules'),
    ('lesson.', 'module.'),
    ('lessons.map', 'modules.map'),
    ('const lessons =', 'const modules ='),
    ('isLessonCompleted', 'isModuleCompleted'),
    ('completedLessons', 'completedModules')
]
replace_in_file('src/lessons/college/3e/fonctions-lineaires-affines/index.jsx', index_replacements)

# 5. Update useProgress Hook
hook_replacements = [
    ('completedLessons', 'completedModules'),
    ('isLessonCompleted', 'isModuleCompleted'),
    ('markLessonCompleted', 'markModuleCompleted')
]
replace_in_file('src/lessons/common/hooks/useProgress.js', hook_replacements)

print("Refactoring complete.")
