#!/usr/bin/env bash
set -e

TARGET="/var/www/html/wp-content"
SRC="/usr/src/wordpress/wp-content"

# Si la carpeta montada está VACÍA, sembramos con los defaults de la imagen
if [ -d "$TARGET" ] && [ -z "$(ls -A "$TARGET")" ]; then
  echo "[init] wp-content está vacío. Copiando defaults..."
  cp -a "$SRC/." "$TARGET/"
else
  echo "[init] wp-content ya tiene contenido. No se toca."
fi

# Ajusta permisos (no falla si no aplica)
chown -R www-data:www-data "$TARGET" 2>/dev/null || true
