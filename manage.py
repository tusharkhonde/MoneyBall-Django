#!/usr/bin/env python
import os
import sys
import copy


if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "moneyball.settings")

    from django.core.management import execute_from_command_line

    # by default, make django listen on 0.0.0.0:8000
    args = copy.copy(sys.argv)
    if len(args) == 2 and args[1] == 'runserver':
        args += ['0.0.0.0:8000']

    execute_from_command_line(args)
