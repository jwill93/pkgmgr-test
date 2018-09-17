## Classes

<dl>
<dt><a href="#PackageFactory">PackageFactory</a></dt>
<dd><p>A factory which ensures that we never instantiate more than one Package with the same name (presumably
referring to the same piece of software).  As such, PackageFactory.getPackage() is the only way users should
instantiate Packages.</p>
</dd>
<dt><a href="#Package">Package</a></dt>
<dd></dd>
<dt><a href="#PackageManager">PackageManager</a></dt>
<dd><p>The guts of the package manager.  While pkgmgr.js parses input (via a file containing commands such as DEPEND,
INSTALL, etc.) and writes output to the console, this class contains the actual logic determining how to respond
to these commands.  When relevant, the method processing a command will return a data structure which can be
iterated over to generate console output (for example, installPackage() handles INSTALL commands, and returns an
array of InstallAttemptResult objects that contain information about what happened when an install was attempted
for the specified package and for each of its dependencies.</p>
<p>PackageManager tracks dependencies such that it knows when it&#39;s okay, for example, to remove a package or not.  It
also maintains a cache of all packages it knows about (it learns about packages via DEPEND and INSTALL commands;
this cache may contain more packages than are currently installed, because DEPEND doesn&#39;t install packages and
because packages once installed may have been removed but no packages are ever removed from this cache.</p>
<p>Finally, it ensures that users don&#39;t issue commands in invalid order (e.g. issuing a DEPEND after any other command
has been issued; issuing any command after issuing an END command; etc.).</p>
<p>PackageManager uses an instance of another class, PackageInstaller, to actually &quot;install&quot; packages - or would, if
this were a &quot;real&quot; package manager.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#argsLengthCheck">argsLengthCheck(command, commandElements, minLength, exact)</a></dt>
<dd><p>Validation method for user input; throws Error on validation failure</p>
</dd>
</dl>

<a name="PackageFactory"></a>

## PackageFactory
A factory which ensures that we never instantiate more than one Package with the same name (presumably
referring to the same piece of software).  As such, PackageFactory.getPackage() is the only way users should
instantiate Packages.

**Kind**: global class  
<a name="PackageFactory.getPackage"></a>

### PackageFactory.getPackage(name) ⇒ [<code>Package</code>](#Package)
Return a Package instance with the specified name, either a newly constructed one or if this factory has
already returned a Package with this name, that Package. Assuming users don't instantiate Packages directly,
getting instances only via this method, it is guaranteed that users will not end up with two Packages which
have the same name (and thus, preumably, refer to the same piece of software).

**Kind**: static method of [<code>PackageFactory</code>](#PackageFactory)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the Package |

<a name="Package"></a>

## Package
**Kind**: global class  

* [Package](#Package)
    * [new Package(name)](#new_Package_new)
    * [.name](#Package+name)
    * [.dependencyPackages](#Package+dependencyPackages) : [<code>Set.&lt;Package&gt;</code>](#Package)
    * [.dependingPackages](#Package+dependingPackages) : [<code>Set.&lt;Package&gt;</code>](#Package)

<a name="new_Package_new"></a>

### new Package(name)
Represents a package and tracks its dependencies and dependent packages.  The existence of a Package object
does not mean that it's currently installed.  It does mean that it's currently cached.  This package manager
"learns" about the existence of packages (and then caches them) in on of two ways: on a DEPENDS command
(which PackageManager.specifyPackageDependencies() processes), or on an INSTALL command (which
PackageManager.installPackage() processes).


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the package. |

<a name="Package+name"></a>

### package.name
The package's name

**Kind**: instance property of [<code>Package</code>](#Package)  
<a name="Package+dependencyPackages"></a>

### package.dependencyPackages : [<code>Set.&lt;Package&gt;</code>](#Package)
Packages which are dependencies of this package. Only PackageManager should ever alter this Set.

**Kind**: instance property of [<code>Package</code>](#Package)  
<a name="Package+dependingPackages"></a>

### package.dependingPackages : [<code>Set.&lt;Package&gt;</code>](#Package)
Packages of which this package is a dependency. Only PackageManager should ever alter this Set.

**Kind**: instance property of [<code>Package</code>](#Package)  
<a name="PackageManager"></a>

## PackageManager
The guts of the package manager.  While pkgmgr.js parses input (via a file containing commands such as DEPEND,
INSTALL, etc.) and writes output to the console, this class contains the actual logic determining how to respond
to these commands.  When relevant, the method processing a command will return a data structure which can be
iterated over to generate console output (for example, installPackage() handles INSTALL commands, and returns an
array of InstallAttemptResult objects that contain information about what happened when an install was attempted
for the specified package and for each of its dependencies.

PackageManager tracks dependencies such that it knows when it's okay, for example, to remove a package or not.  It
also maintains a cache of all packages it knows about (it learns about packages via DEPEND and INSTALL commands;
this cache may contain more packages than are currently installed, because DEPEND doesn't install packages and
because packages once installed may have been removed but no packages are ever removed from this cache.

Finally, it ensures that users don't issue commands in invalid order (e.g. issuing a DEPEND after any other command
has been issued; issuing any command after issuing an END command; etc.).

PackageManager uses an instance of another class, PackageInstaller, to actually "install" packages - or would, if
this were a "real" package manager.

**Kind**: global class  

* [PackageManager](#PackageManager)
    * [.specifyPackageDependencies(packageName, dependencyNamesArr)](#PackageManager+specifyPackageDependencies)
    * [.installPackage(packageName)](#PackageManager+installPackage) ⇒ <code>Array.&lt;InstallAttemptResult&gt;</code>
    * [.removePackage(packageName)](#PackageManager+removePackage) ⇒ <code>Array.&lt;RemoveAttemptResult&gt;</code>
    * [.listPackageNames()](#PackageManager+listPackageNames) ⇒
    * [.endCommands()](#PackageManager+endCommands)

<a name="PackageManager+specifyPackageDependencies"></a>

### packageManager.specifyPackageDependencies(packageName, dependencyNamesArr)
Handle a DEPEND command.

Add a package to the dependency tree (note that this does not install the package; it just puts it in our
package cache if it's not already there, and then creates a dependency relationship between the package and its
dependencies.

**Kind**: instance method of [<code>PackageManager</code>](#PackageManager)  

| Param | Type | Description |
| --- | --- | --- |
| packageName | <code>string</code> | The name of the package |
| dependencyNamesArr | <code>Array.&lt;string&gt;</code> | Array of dependency package names |

<a name="PackageManager+installPackage"></a>

### packageManager.installPackage(packageName) ⇒ <code>Array.&lt;InstallAttemptResult&gt;</code>
Handle an INSTALL command.

Install any of the package's dependencies that aren't already installed, then install the package if it's not
already installed (which it may have been, e.g., because it's a dependency of another explicitly installed
package). This is a recursive operation which involves (potential) recursive calls to the private method
_installPkgAndDependencies().

**Kind**: instance method of [<code>PackageManager</code>](#PackageManager)  
**Returns**: <code>Array.&lt;InstallAttemptResult&gt;</code> - Array of InstallAttemptResults (indicating packageName and whether the package
was installed, or not installed because it was already installed.  

| Param | Type | Description |
| --- | --- | --- |
| packageName | <code>Array.&lt;string&gt;</code> | The name of the package to install if it hasn't been installed already |

<a name="PackageManager+removePackage"></a>

### packageManager.removePackage(packageName) ⇒ <code>Array.&lt;RemoveAttemptResult&gt;</code>
Handle a REMOVE command.

Remove any of the package's dependencies which weren't explicitly installed and are not dependencies of other
packages, then remove the package if it's not a dependency of any other package. This is a recursive operation
which involves (potential) recursive calls to the private method_removePkgAndDependencies().

**Kind**: instance method of [<code>PackageManager</code>](#PackageManager)  
**Returns**: <code>Array.&lt;RemoveAttemptResult&gt;</code> - Array of RemoveAttemptResults (indicating packageName and whether the package
was removed, or not removed because it's still needed as a dependency of another package, or not removed
because it wasn't installed.  

| Param | Type | Description |
| --- | --- | --- |
| packageName | <code>string</code> | The name of the package to remove if it isn't a dependency of another package |

<a name="PackageManager+listPackageNames"></a>

### packageManager.listPackageNames() ⇒
Handle a LIST command.

We return an array of the names of all Packages currently installed, sorted alphabetically.

**Kind**: instance method of [<code>PackageManager</code>](#PackageManager)  
**Returns**: Array of installed Package names.  
<a name="PackageManager+endCommands"></a>

### packageManager.endCommands()
Handle an END command.

The only thing this method does is make sure END is only called once.

**Kind**: instance method of [<code>PackageManager</code>](#PackageManager)  
<a name="argsLengthCheck"></a>

## argsLengthCheck(command, commandElements, minLength, exact)
Validation method for user input; throws Error on validation failure

**Kind**: global function  
**Throws**:

- Error on validation failure. The Error's message is meant to be meaningful to lay users and therefore to be
  printed to the console


| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> | The command (first word of the line) |
| commandElements | <code>Array.&lt;string&gt;</code> | All words following the command, as an array |
| minLength | <code>number</code> | Minimum (or exact) number of words expected in commandElements |
| exact | <code>boolean</code> | True to require exactly the number of words expected; false if we should treat the number   as a minimum (note: we don't do maximums in this validation method because validation needs here don't   call for it). |

