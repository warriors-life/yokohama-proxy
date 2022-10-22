#!/bin/sh

# based on https://github.com/nginxinc/docker-nginx/blob/master/mainline/alpine/20-envsubst-on-templates.sh

set -e

ME=$(basename $0)

entrypoint_log() {
    if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
        echo "$@"
    fi
}

auto_envsubst() {
  local template_dir=${NGINX_TEMPLATES_PATH}
  local suffix=".conf"
  local main_output_dir=${NGINX_CONFIGS_PATH}

  local template relative_path output_path output_dir
  [ -d "$template_dir" ] || return 0
  if [ ! -w "$main_output_dir" ]; then
    entrypoint_log "$ME: ERROR: $template_dir exists, but $main_output_dir is not writable"
    return 0
  fi
  find "$template_dir" -L -type f -name "*$suffix" -print | while read -r template; do
    relative_path="${template#$template_dir/}"
	output_dir=$([ "$relative_path" = "nginx.conf" ] && echo "/etc/nginx" || echo "$main_output_dir")
    output_path="$output_dir/$relative_path"
    mkdir -p "$output_dir"
    entrypoint_log "$ME: Running envsubst on $template to $output_path"
    perl -pe 's/&([_a-zA-Z]\w*)/$ENV{NGINX_$1}/g' < "$template" > "$output_path"
  done
}

auto_envsubst

exit 0