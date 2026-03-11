# Deploy assets

This folder contains only the images, videos, and frames **actually used** by the site. It is populated by `scripts/copy-assets.sh` from the larger local folders (HIRES PICTURE, frames2, hero slider, etc.), which are listed in `.gitignore` and not pushed to GitHub or Vercel.

After adding or changing images in the main project, run `bash scripts/copy-assets.sh` to refresh this folder before deploying.
