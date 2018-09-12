#!/bin/sh
ssh -o 'UserKnownHostsFile=/dev/null' -o 'StrictHostKeyChecking=no' -F '/dev/null' -i "$HOME/.ssh/id_rsa_83b509e4e52e7435c11b9973e3dcb86f" $*
