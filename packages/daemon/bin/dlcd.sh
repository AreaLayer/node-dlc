#!/bin/bash

rl=0
daemon=0
cmd='../dist/lib/index.js'

if ! type perl > /dev/null 2>& 1; then
  if uname | grep -i 'darwin' > /dev/null; then
    echo 'DLCd requires perl to start on OSX.' >& 2
    exit 1
  fi
  rl=1
fi

if test $rl -eq 1; then
  file=$(readlink -f "$0")
else
  # Have to do it this way
  # because OSX isn't a real OS
  file=$(perl -MCwd -e "print Cwd::realpath('$0')")
fi

dir=$(dirname "$file")

for arg in "$@"; do
  case "$arg" in
    --daemon)
      daemon=1
    ;;
  esac
done

if test $daemon -eq 1; then
  # And yet again, OSX doesn't support something.
  if ! type setsid > /dev/null 2>& 1; then
    (
      "${dir}/${cmd}" "$@" > /dev/null 2>& 1 &
      echo "$!"
    )
    exit 0
  fi
  (
    setsid "${dir}/${cmd}" "$@" > /dev/null 2>& 1 &
    echo "$!"
  )
  exit 0
else
  exec "${dir}/${cmd}" "$@"
  exit 1
fi
