import os
import re

directory = "/home/abdennour/websites/prof-portfolio/public/modules"
html_files = []
for root, dirs, files in os.walk(directory):
    for file in files:
        if file == "index.html" and "lessons" in root:
            html_files.append(os.path.join(root, file))

for filepath in html_files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Extract info
    parts = filepath.split('/')
    grade_dir = parts[-5]
    module_dir = parts[-4]
    
    # format grade: 6e -> 6ème
    grade_str = grade_dir.replace('e', 'ème')
    
    # format module title
    module_str = module_dir.replace('-', ' ').title()
    # Some special fixes if needed (like "Calcul Litteral" -> "Calcul littéral")
    
    title_match = re.search(r"<title>(.*?)\s*\|\s*Smarter<\/title>", content)
    lesson_name = title_match.group(1) if title_match else "Leçon"
    lesson_name = re.sub(r"^\d+\.\s*", "", lesson_name)

    n_match = re.search(r"Leçon (\d+) /", content)
    n = n_match.group(1) if n_match else "1"

    nav_pattern = r"<!-- NAVBAR HEADER -->.*?<\/nav>"
    
    new_header = f"""
    <!-- LESSON HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
      
      <!-- BREADCRUMB -->
      <nav class="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
        <a href="/" class="hover:text-blue-600">Accueil</a>
        <span>/</span>
        <a href="/courses" class="hover:text-blue-600">Collège ({grade_str})</a>
        <span>/</span>
        <a href="../../index.html" class="hover:text-blue-600">{module_str}</a>
        <span>/</span>
        <span class="text-slate-900 font-semibold">{lesson_name}</span>
      </nav>

      <!-- PROGRESS & XP -->
      <div class="flex items-center gap-4 self-end sm:self-auto">
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono text-blue-600 font-bold">Leçon {n} / 6</span>
          <div class="w-16 sm:w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div class="h-full bg-blue-500 w-{n}/6"></div>
          </div>
        </div>
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-mono text-xs font-bold shrink-0">
          <span id="xpCount">0</span> XP
        </div>
      </div>
    </div>
"""

    # If the file already doesn't have the navbar pattern, it means it's already processed or different
    if not re.search(nav_pattern, content, flags=re.DOTALL):
        print(f"Skipping {filepath} - Navbar not found")
        continue

    # Remove the old navbar
    new_content = re.sub(nav_pattern, "", content, flags=re.DOTALL)

    # Inject the new header after <main ...>
    main_pattern = r"(<main[^>]*>)"
    new_content = re.sub(main_pattern, r"\1\n" + new_header, new_content)

    if new_content != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {filepath}")

print("All lessons updated.")
