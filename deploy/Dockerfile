# Serves the static multi-calendar showcase produced by deploy/build.ps1.
#
# The site is built on the developer machine, not here: the Vite build imports
# the library's TypeScript sources directly and needs the whole pnpm workspace,
# which would cost minutes per deploy to reproduce inside a build context and
# would emit exactly the files already sitting in artifacts/playground.
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY site/ /usr/share/nginx/html/
