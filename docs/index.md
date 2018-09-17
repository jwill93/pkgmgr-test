## Classes

<dl>
<dt><a href="#InstallAttemptResult">InstallAttemptResult</a></dt>
<dd><p>An array of InstallAttemptResults is returned by PackageManager.installPackage. They do not affect the
operation of the PackageManager; they exist only to notify users of the outcomes of calls to installPackage.
A call to installPackage can result in one of two outcomes (for the package itself and for its dependencies):
either the Package was installed, or it wasn&#39;t because it had already been installed previously (either
explicitly by a user call to INSTALL, or implicitly, as a dependency).</p>
</dd>
<dt><a href="#RemoveAttemptResult">RemoveAttemptResult</a></dt>
<dd><p>An array of RemoveAttemptResults is returned by PackageManager.removePackage. They do not affect the
operation of the PackageManager; they exist only to notify users of the outcomes of calls to removePackage.
A call to removePackage can result in one of three outcomes (for the package itself and for its dependencies): 1)
the package was removed; 2) the package was not removed because it was not installed to begin with; 3) the package
was not removed because it is still needed as a dependency of other packages.</p>
</dd>
<dt><a href="#PackageInstaller">PackageInstaller</a></dt>
<dd><p>This class is a stub, partly; it is meant to be the interface through which the PackageManager installs a Package
to the filesystem (installToFilesystem()), or remove it from the filesystem (removeFromFilesystem()).  Since this
is not a real-world package manager, ofc we don&#39;t do that here.  This class does have &quot;real&quot; functionality though:
its _installedPackagesMap field, a Map of containing all currently installed packages.  (It also contains information
about how the Package was installed, specifically, if it&#39;s ever been installed explicitly, that is, via an INSTALL
command as opposed to being installed implicitly, as a dependency).  In the real world, this Map would always
reflect, exactly, which packages were currently actually installed on the filesystem.</p>
</dd>
<dt><a href="#Package">Package</a></dt>
<dd></dd>
<dt><a href="#PackageFactory">PackageFactory</a></dt>
<dd><p>A factory which ensures that we never instantiate more than one Package with the same name (presumably
referring to the same piece of software).  As such, PackageFactory.getPackage() is the only way users should
instantiate Packages.</p>
</dd>
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

<a name="InstallAttemptResult"></a>

## InstallAttemptResult
An array of InstallAttemptResults is returned by PackageManager.installPackage. They do not affect the
operation of the PackageManager; they exist only to notify users of the outcomes of calls to installPackage.
A call to installPackage can result in one of two outcomes (for the package itself and for its dependencies):
either the Package was installed, or it wasn't because it had already been installed previously (either
explicitly by a user call to INSTALL, or implicitly, as a dependency).

**Kind**: global class  
<a name="new_InstallAttemptResult_new"></a>

### new InstallAttemptResult(packageName, previouslyInstalled)
Construct an InstallAttemptResult.


| Param | Description |
| --- | --- |
| packageName | The name of the Package |
| previouslyInstalled | True if the package was already installed, false if it was not (and thus the   package was installed). |

<a name="RemoveAttemptResult"></a>

## RemoveAttemptResult
An array of RemoveAttemptResults is returned by PackageManager.removePackage. They do not affect the
operation of the PackageManager; they exist only to notify users of the outcomes of calls to removePackage.
A call to removePackage can result in one of three outcomes (for the package itself and for its dependencies): 1)
the package was removed; 2) the package was not removed because it was not installed to begin with; 3) the package
was not removed because it is still needed as a dependency of other packages.

**Kind**: global class  

* [RemoveAttemptResult](#RemoveAttemptResult)
    * [new RemoveAttemptResult(packageName, removedStatus)](#new_RemoveAttemptResult_new)
    * [.REMOVED_STATUS_REMOVED](#RemoveAttemptResult.REMOVED_STATUS_REMOVED) ⇒ <code>symbol</code>
    * [.REMOVED_STATUS_NOT_REMOVED_NOT_INSTALLED](#RemoveAttemptResult.REMOVED_STATUS_NOT_REMOVED_NOT_INSTALLED) ⇒ <code>symbol</code>
    * [.REMOVED_STATUS_NOT_REMOVED_STILL_NEEDED](#RemoveAttemptResult.REMOVED_STATUS_NOT_REMOVED_STILL_NEEDED) ⇒ <code>symbol</code>

<a name="new_RemoveAttemptResult_new"></a>

### new RemoveAttemptResult(packageName, removedStatus)
Construct a RemoveAttemptResult


| Param | Type | Description |
| --- | --- | --- |
| packageName | <code>string</code> | The name of the package. |
| removedStatus | <code>symbol</code> | One of the three RemoveAttemptResult.REMOVED_STATUS_* constants |

<a name="RemoveAttemptResult.REMOVED_STATUS_REMOVED"></a>

### RemoveAttemptResult.REMOVED_STATUS_REMOVED ⇒ <code>symbol</code>
Status indicating the package was removed.

**Kind**: static property of [<code>RemoveAttemptResult</code>](#RemoveAttemptResult)  
<a name="RemoveAttemptResult.REMOVED_STATUS_NOT_REMOVED_NOT_INSTALLED"></a>

### RemoveAttemptResult.REMOVED_STATUS_NOT_REMOVED_NOT_INSTALLED ⇒ <code>symbol</code>
Status indicating the package was not removed because it wasn't currently installed.

**Kind**: static property of [<code>RemoveAttemptResult</code>](#RemoveAttemptResult)  
<a name="RemoveAttemptResult.REMOVED_STATUS_NOT_REMOVED_STILL_NEEDED"></a>

### RemoveAttemptResult.REMOVED_STATUS_NOT_REMOVED_STILL_NEEDED ⇒ <code>symbol</code>
Status indicating the package was not removed because it was still needed as a dependency of one or more
packages.

**Kind**: static property of [<code>RemoveAttemptResult</code>](#RemoveAttemptResult)  
<a name="PackageInstaller"></a>

## PackageInstaller
This class is a stub, partly; it is meant to be the interface through which the PackageManager installs a Package
to the filesystem (installToFilesystem()), or remove it from the filesystem (removeFromFilesystem()).  Since this
is not a real-world package manager, ofc we don't do that here.  This class does have "real" functionality though:
its _installedPackagesMap field, a Map of containing all currently installed packages.  (It also contains information
about how the Package was installed, specifically, if it's ever been installed explicitly, that is, via an INSTALL
command as opposed to being installed implicitly, as a dependency).  In the real world, this Map would always
reflect, exactly, which packages were currently actually installed on the filesystem.

**Kind**: global class  

* [PackageInstaller](#PackageInstaller)
    * [new PackageInstaller()](#new_PackageInstaller_new)
    * [.installToFilesystem(pkg, protectFromImplicitRemoval)](#PackageInstaller+installToFilesystem)
    * [.removeFromFilesystem(packageName)](#PackageInstaller+removeFromFilesystem)
    * [.isPackageInstalled(packageName)](#PackageInstaller+isPackageInstalled) ⇒ <code>boolean</code>
    * [.getInstalledPackage(packageName)](#PackageInstaller+getInstalledPackage) ⇒ [<code>Package</code>](#Package)
    * [.getInstalledPackageNames()](#PackageInstaller+getInstalledPackageNames) ⇒ <code>Array.&lt;string&gt;</code>
    * [.isPackageProtectedFromImplicitRemoval(packageName)](#PackageInstaller+isPackageProtectedFromImplicitRemoval) ⇒ <code>boolean</code>
    * [.setPackageProtectedFromImplicitRemoval(packageName, protect)](#PackageInstaller+setPackageProtectedFromImplicitRemoval)

<a name="new_PackageInstaller_new"></a>

### new PackageInstaller()
Construct a PackageInstaller.

<a name="PackageInstaller+installToFilesystem"></a>

### packageInstaller.installToFilesystem(pkg, protectFromImplicitRemoval)
Install the pkg Package to the filesystem.

**Kind**: instance method of [<code>PackageInstaller</code>](#PackageInstaller)  
**Throw**: Error if the Package is already installed (call isPackageInstalled() first to avoid this error)  

| Param | Type | Description |
| --- | --- | --- |
| pkg | [<code>Package</code>](#Package) | The Package to install. |
| protectFromImplicitRemoval | <code>boolean</code> | True if this method call resulted from the user explicitly issuing    a command to install this package (e.g., INSTALL PACKAGENAME), false if the call resulted from the Package    being installed because it's a dependency of another Package. |

<a name="PackageInstaller+removeFromFilesystem"></a>

### packageInstaller.removeFromFilesystem(packageName)
Remove the Package whose name is packageName from the filesystem.  Note that this method does not contain any
logic to determine whether or not it's safe to remove this package (e.g., whether other Packages depend on it,
etc.); all that logic shgould be in PackageManager.

**Kind**: instance method of [<code>PackageInstaller</code>](#PackageInstaller)  
**Throw**: Error if the Package was not installed (call isPackageInstalled() first to avoid this error)  

| Param | Type |
| --- | --- |
| packageName | <code>string</code> | 

<a name="PackageInstaller+isPackageInstalled"></a>

### packageInstaller.isPackageInstalled(packageName) ⇒ <code>boolean</code>
Returns true if a Package whose name is packageName is currently installed on the filesystem, false otherwise.

**Kind**: instance method of [<code>PackageInstaller</code>](#PackageInstaller)  
**Returns**: <code>boolean</code> - True if installed  

| Param | Type |
| --- | --- |
| packageName | <code>string</code> | 

<a name="PackageInstaller+getInstalledPackage"></a>

### packageInstaller.getInstalledPackage(packageName) ⇒ [<code>Package</code>](#Package)
Return the Package whose name is packageName.

**Kind**: instance method of [<code>PackageInstaller</code>](#PackageInstaller)  
**Returns**: [<code>Package</code>](#Package) - The Package.  
**Throws**:

- Error if the specified Package is not installed.


| Param | Type |
| --- | --- |
| packageName | <code>string</code> | 

<a name="PackageInstaller+getInstalledPackageNames"></a>

### packageInstaller.getInstalledPackageNames() ⇒ <code>Array.&lt;string&gt;</code>
Return an unsorted array of Package names which are currently installed.

**Kind**: instance method of [<code>PackageInstaller</code>](#PackageInstaller)  
**Returns**: <code>Array.&lt;string&gt;</code> - The Package names.  
<a name="PackageInstaller+isPackageProtectedFromImplicitRemoval"></a>

### packageInstaller.isPackageProtectedFromImplicitRemoval(packageName) ⇒ <code>boolean</code>
Returns the specified Package's protectFromImplicitRemoval boolean.

**Kind**: instance method of [<code>PackageInstaller</code>](#PackageInstaller)  
**Returns**: <code>boolean</code> - True if Package's protectFromImplicitRemoval is true  
**Throws**:

- Error if the specified Package is not installed.


| Param | Type | Description |
| --- | --- | --- |
| packageName | <code>string</code> | The name of the Package. |

<a name="PackageInstaller+setPackageProtectedFromImplicitRemoval"></a>

### packageInstaller.setPackageProtectedFromImplicitRemoval(packageName, protect)
Sets the specified Package's protectFromImplicitRemoval flag to the specified value.

**Kind**: instance method of [<code>PackageInstaller</code>](#PackageInstaller)  
**Throws**:

- Error if the specified Package is not installed.


| Param | Type | Description |
| --- | --- | --- |
| packageName | <code>string</code> |  |
| protect | <code>boolean</code> | True to mark the package protected from being removed except by explicit REMOVE command |

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
    * [.installPackage(packageName)](#PackageManager+installPackage) ⇒ [<code>Array.&lt;InstallAttemptResult&gt;</code>](#InstallAttemptResult)
    * [.removePackage(packageName)](#PackageManager+removePackage) ⇒ [<code>Array.&lt;RemoveAttemptResult&gt;</code>](#RemoveAttemptResult)
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

### packageManager.installPackage(packageName) ⇒ [<code>Array.&lt;InstallAttemptResult&gt;</code>](#InstallAttemptResult)
Handle an INSTALL command.

Install any of the package's dependencies that aren't already installed, then install the package if it's not
already installed (which it may have been, e.g., because it's a dependency of another explicitly installed
package). This is a recursive operation which involves (potential) recursive calls to the private method
_installPkgAndDependencies().

**Kind**: instance method of [<code>PackageManager</code>](#PackageManager)  
**Returns**: [<code>Array.&lt;InstallAttemptResult&gt;</code>](#InstallAttemptResult) - Array of InstallAttemptResults (indicating packageName and whether the package
was installed, or not installed because it was already installed.  

| Param | Type | Description |
| --- | --- | --- |
| packageName | <code>Array.&lt;string&gt;</code> | The name of the package to install if it hasn't been installed already |

<a name="PackageManager+removePackage"></a>

### packageManager.removePackage(packageName) ⇒ [<code>Array.&lt;RemoveAttemptResult&gt;</code>](#RemoveAttemptResult)
Handle a REMOVE command.

Remove any of the package's dependencies which weren't explicitly installed and are not dependencies of other
packages, then remove the package if it's not a dependency of any other package. This is a recursive operation
which involves (potential) recursive calls to the private method_removePkgAndDependencies().

**Kind**: instance method of [<code>PackageManager</code>](#PackageManager)  
**Returns**: [<code>Array.&lt;RemoveAttemptResult&gt;</code>](#RemoveAttemptResult) - Array of RemoveAttemptResults (indicating packageName and whether the package
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
