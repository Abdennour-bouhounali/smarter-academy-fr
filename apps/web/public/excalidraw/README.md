# Polices d'Excalidraw — auto-hébergées

Copie de `node_modules/@excalidraw/excalidraw/dist/prod/fonts/` (sans
`Xiaolai`, la police CJK de 13 Mo : elle reste servie par le CDN de repli
d'Excalidraw si un jour un glyphe en a besoin).

Pourquoi : sans `window.EXCALIDRAW_ASSET_PATH`, Excalidraw télécharge ses
polices depuis un CDN tiers (esm.sh) à chaque ouverture de la سبّورة. Une
plateforme scolaire ne dépend pas d'un CDN externe pour dessiner, et n'y
envoie pas les requêtes de ses élèves. Le chemin est déclaré dans
`src/features/mathlab/tools/whiteboard/WhiteboardTool.jsx`.

À rafraîchir à chaque montée de version d'`@excalidraw/excalidraw` :

    for f in Assistant Cascadia ComicShanns Excalifont Liberation Lilita Nunito Virgil; do
      cp -r node_modules/@excalidraw/excalidraw/dist/prod/fonts/$f apps/web/public/excalidraw/fonts/
    done
