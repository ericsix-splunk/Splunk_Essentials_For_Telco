#!/opt/splunk/bin/python

# Name: translatefix.py
# Author: Glenn Sinclair (sinclaig)
# Creation date: 26/03/2010
# Version: 1.0
# Description: A Custom Splunk search command. Intended to take a bunch of FIX
#   events in csv format (output by Splunk) and translate the FIX codes to human
#   readable text.
# Notes: This needs to live in $SPLUNK_HOME/etc/apps/dealing/bin, and be
#   referenced by the file $SPLUNK_HOME/etc/system/local/commands.conf. This
#   script reads a list of search/replace patterns from
#   $SPLUNK_HOME/etc/apps/dealing/etc/translatefix/translatefix.cfg
# Versions:
#   1.0 (01/04/2010) - Initial release to prod

# Import os, sys functionality
import os, sys

## Function to do the string replacements. Reads a config file containing a
# list of search:replace strings. Takes a line to run search/replace on.
def dorep(line):
    r = open("translatefix.cfg", "r")
    # Replace all SOH ASCII characters (FIX field delimiters) with space
    line = line.replace('\x01', ' ')
    for row in r:
        # Ignore hashes in config file
        if not row.lstrip().startswith("#"):
            # Strip newlines and whitespace from RH of line, then split by colon
            list = row.rstrip(' \n').split(':', 1)
            srch = ' ' + list[0]
            repl = ' ' + list[1]
            # Do the replacement
            line = line.replace(srch, repl)
    return line

## MAIN PART
# No need to use csv read for input results (even tho format is csv) as only
# doing a simple search/replace across entire line

# Test whether config file exists
if os.access('translatefix.cfg', os.F_OK):
    for line in sys.stdin:
        try:
            # Call function to do string replace
            line = dorep(line)
            print line,
        except:
            pass
else:
    # Create error csv, used by Splunk to display
    print 'ERROR'
    print 'translatefix.cfg'
