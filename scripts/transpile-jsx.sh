#!/bin/bash
chmod +x "$0"
npx cross-env BABEL_ENV=custom babel components/jsx --out-dir dist --extensions .jsx
