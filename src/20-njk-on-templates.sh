#!/bin/sh

set -e

ME=$(basename $0)

entrypoint_log() {
    if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
        echo "$@"
    fi
}

auto_njk() {
  local template_dir="${NGINX_NJK_TEMPLATE_DIR:-/etc/nginx/templates}"
  local output_dir="${NGINX_NJK_OUTPUT_DIR:-/etc/nginx/conf.d}"

  local template relative_path output_path
  [ -d "$template_dir" ] || return 0
  if [ ! -w "$output_dir" ]; then
    entrypoint_log "$ME: ERROR: $template_dir exists, but $output_dir is not writable"
    return 0
  fi
  find "$template_dir" -follow -type f -print | while read -r template; do
    relative_path="${template#$template_dir/}"
    output_path="$output_dir/$relative_path"
    entrypoint_log "$ME: Running njk on $template to $output_path"
    njk "$template" > "$output_path"
  done
}

auto_njk

exit 0
