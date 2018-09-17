# pkgmgr

A simple package manager implemented for a coding test, by Steve Schneider (avocado876@gmail.com).

Most of my documention of this exercise is found in the code - either as JSDoc API comments,
of as inline comments in the code.  (The JSDocs are [here](docs/index.md).) But here is a quick rundown of what each script or object
does; more detailed comments are found in the files themselves:

#### ./pkgmgr.js

The entry point.  Processes command-line input and reads the input file, containing one command
per line, and iterates over each command, writing output to the console if the given command
provides output.  Run this script as follows (Node required; I used 8.9.4):

    node ./pkgmgr /path/to/input/file.ext

#### Package and PackageFactory

A `Package` represents a package specified by the user (as-yet installed or not).  It holds
references to `Packages` which are dependencies, and also to `Packages` which depend on it.  
`Packages` are instantiated only by the `PackageFactory`.

#### PackageManager

The guts of this implementation.  We instantiate one of these per session. Has five methods
to handle each of the five commands expected to be found in the input file (`DEPEND`, `INSTALL`, `REMOVE`,
`LIST`, and `END`).  Holds a cache of every package it knows about (it learns about packages via both
`DEPEND` and `INSTALL` commands).  Does not track which packages are currently installed; that is 
handled by...

#### PackageInstaller

...this class.  This class's functionality was initially part of `PackageManager`, but I moved 
it here partly because I wanted to provide a (fake, stubbed) interface which, in a real-world
setting, would be the interface to actually installing packages to the underlying system.  Instances
of this class also track which packages are currently installed to the system.

#### InstallAttemptResult, RemoveAttemptResult

Arrays of these are returned by `PackageManager` methods which process commands (e.g. `installPackage()`,
which processes `INSTALL` commands, returns an array of `InstallAttemptResults`).  These
objects tell us what happened when `PackageManager` attempted to install or remove a package and
its dependencies (install possibilities: installed, or not installed because was already installed;
remove possibilities: removed; not removed because still needed; not removed because was not
installed).

#### ./sample-input.txt

Not of course part of the codebase.  This is the input file provided in the spec, and which I've used
during development.  Its contents are as follows:

    DEPEND TCPIP NETCARD
    DEPEND TELNET TCPIP SOCKET
    DEPEND DNS TCPIP
    DEPEND HTML REGEX XML
    DEPEND REGEX PARSING
    DEPEND BROWSER DNS TCPIP HTML CSS
    INSTALL TCPIP
    REMOVE NETCARD
    REMOVE TCPIP
    REMOVE NETCARD
    INSTALL TCPIP
    LIST
    INSTALL TCPIP
    INSTALL foo
    REMOVE TCPIP
    INSTALL NETCARD
    INSTALL TCPIP
    REMOVE TCPIP
    LIST
    INSTALL TCPIP
    INSTALL NETCARD
    REMOVE TCPIP
    LIST
    REMOVE NETCARD
    INSTALL BROWSER
    LIST
    REMOVE BROWSER
    LIST
    INSTALL HTML
    INSTALL TELNET
    REMOVE SOCKET
    INSTALL DNS
    INSTALL BROWSER
    REMOVE NETCARD
    LIST
    REMOVE BROWSER
    LIST
    END


