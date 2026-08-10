import urllib.request
import re

url = "https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602912A" 
# wait, the user's url for lycee is https://www.education.gouv.fr/bo/2026/Hebdo14 (without MENE...).
url = "https://www.education.gouv.fr/bo/2026/Hebdo14"

try:
    html = urllib.request.urlopen(url).read().decode('utf-8')
    links = re.findall(r'href="([^"]+)"', html)
    for link in links:
        if 'math' in link.lower() and link.endswith('.pdf'):
            print("Found math PDF:", link)
        if 'math' in link.lower() and not link.endswith('.pdf'):
            print("Found math link:", link)
except Exception as e:
    print(e)
