#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_REPO="${DEPLOY_REPO:-/tmp/chrismuladores-pages-clone}"
SSH_KEY="$SCRIPT_DIR/github_pages_deploy_ed25519"

if [[ ! -d "$DEPLOY_REPO/.git" ]]; then
  printf 'No se encontró el clon de despliegue en: %s\n' "$DEPLOY_REPO" >&2
  printf 'Configura DEPLOY_REPO con la ruta correcta e inténtalo nuevamente.\n' >&2
  exit 1
fi

if [[ ! -f "$SSH_KEY" ]]; then
  printf 'No se encontró la clave SSH de despliegue en: %s\n' "$SSH_KEY" >&2
  exit 1
fi

if [[ "$(git -C "$DEPLOY_REPO" branch --show-current)" != "main" ]]; then
  printf 'El clon de despliegue debe estar en la rama main.\n' >&2
  exit 1
fi

if [[ -n "$(git -C "$DEPLOY_REPO" status --porcelain)" ]]; then
  printf 'Hay cambios sin confirmar en el clon de despliegue. Confírmalos antes de publicar.\n' >&2
  git -C "$DEPLOY_REPO" status --short
  exit 1
fi

GIT_SSH_COMMAND="ssh -i $SSH_KEY -o IdentitiesOnly=yes -o BatchMode=yes" \
  git -C "$DEPLOY_REPO" fetch origin main

if ! git -C "$DEPLOY_REPO" merge-base --is-ancestor origin/main main; then
  printf 'El remoto tiene cambios que no están integrados localmente. Actualiza el clon antes de publicar.\n' >&2
  exit 1
fi

GIT_SSH_COMMAND="ssh -i $SSH_KEY -o IdentitiesOnly=yes -o BatchMode=yes" \
  git -C "$DEPLOY_REPO" push origin main

printf 'Publicación completada: %s\n' "$(git -C "$DEPLOY_REPO" log -1 --oneline)"
