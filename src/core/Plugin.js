/**
* The `Matter.Plugin` module contains utility functions that are Plugin to all modules.
*
* @class Plugin
*/

var Plugin = {};

module.exports = Plugin;

var Common = require('./Common');

(function() {

    //Plugin._anonymousName = 0;
    Plugin._registry = {};

    Plugin.exports = function(options) {
        var plugin = options;

        /*plugin.uses = plugin.uses || [];
        plugin.for = plugin.for || 'matter-js@*';
        plugin.name = plugin.name || Plugin.anonymousName();
        plugin.version = plugin.version || '0.0.0';*/
        //plugin.id = plugin.name + '@' + plugin.version;

        if (!Plugin.isPlugin(plugin)) {
            Common.log('Plugin.exports: ' + plugin.name + ' does not implement all required fields.', 'warn');
        }

        if (plugin.name in Plugin._registry) {
            var registered = Plugin._registry[plugin.name];

            if (Plugin.versionGte(plugin.version, registered.version)) {
                Plugin._registry[plugin.name] = plugin;
            }
        } else {
            Plugin._registry[plugin.name] = plugin;
        }

        return plugin;
    };

    /**
     * Returns a unique identifier for anonymous plugins.
     * @method anonymousName
     * @return {Number} Unique identifier name
     */
    /*Plugin.anonymousName = function() {
        return 'anonymous-' + Plugin._nextId++;
    };*/

    Plugin.isPlugin = function(obj) {
        return obj && obj.name && Common.isFunction(obj.install);
    };

    Plugin.isUsed = function(base, name) {
        return base.used.indexOf(name) > -1;
        //return (',' + base.used.join(',')).indexOf(',' + name + '@') > -1;
    };

    Plugin.isFor = function(plugin, base) {
        var parsed = Plugin.versionParse(plugin.for);
        return base.name === parsed.name && Plugin.versionSatisfies(base.version, parsed.version);
    };

    /**
     * Installs plugins on an object and ensures all dependencies are loaded.
     * TODO: add link to wiki
     * @method installDependencies
     * @param base {} The object to install the `plugins` on.
     * @return {Array} An array of the plugins in the order they were applied after dependencies were resolved.
     */
    Plugin.installDependencies = function(base) {
        if (!base.uses || base.uses.length === 0) {
            Common.log('Plugin.installDependencies: ' + base.name + ' does not specify any dependencies to install.', 'warn');
            return;
        }

        if (base.used && base.used.length > 0) {
            Common.log('Plugin.installDependencies: ' + base.name + ' has already installed its dependencies.', 'warn');
            return;
        }

        var dependencies = Plugin.dependencies(base),
            sortedDependencies = Common.topologicalSort(dependencies),
            warnings = 0;

        console.log(dependencies, sortedDependencies);
        
        for (var i = 0; i < sortedDependencies.length; i += 1) {
            var plugin = Plugin.resolve(sortedDependencies[i]);

            if (sortedDependencies[i] === base.name) {
                continue;
            }

            if (!plugin) {
                Common.log('Plugin.installDependencies: ' + sortedDependencies[i] + ' could not be resolved.', 'warn');
                warnings += 1;
                continue;
            }

            if (Plugin.isUsed(base, plugin.name)) {
                continue;
            }

            if (!Plugin.isFor(plugin, base)) {
                Common.log('Plugin.installDependencies: ' + plugin.name + '@' + plugin.version + ' is for ' + plugin.for + ' but used on ' + base.name + '@' + base.version + '.', 'warn');
                warnings += 1;
            }

            var options = Common.isPlainObject(sortedDependencies[i]) ? sortedDependencies[i].options : null;

            if (plugin.install) {
                plugin.install(base, options);
            }

            base.used.push(plugin.name);
        }

        if (warnings > 0) {
            Common.log('Plugin.installDependencies: Some dependencies may not function as expected, see above warnings.', 'warn');
        }
    };

    Plugin.dependencies = function(base, _dependencies) {
        base = Plugin.resolve(base) || base;
        _dependencies = _dependencies || {};

        var name = Plugin.versionParse(Plugin.dependencyName(base)).name;

        if (name in _dependencies) {
            return;
        }

        _dependencies[name] = Common.map(base.uses || [], function(dependency) {
            return Plugin.versionParse(Plugin.dependencyName(dependency)).name;
        });

        for (var i = 0; i < _dependencies[name].length; i += 1) {
            Plugin.dependencies(_dependencies[name][i], _dependencies);
        }

        return _dependencies;
    };

    Plugin.dependencyName = function(dependency) {
        return (dependency.plugin && (dependency.plugin.name || dependency.plugin)) || dependency.name || dependency;
    };

    Plugin.resolve = function(dependency) {
        if (Plugin.isPlugin(dependency)) {
            return dependency;
        }

        var plugin = dependency.plugin && Plugin.resolve(dependency.plugin);

        if (plugin) {
            return plugin;
        }

        var parsed = Plugin.versionParse(Plugin.dependencyName(dependency));

        plugin = Plugin._registry[parsed.name];

        if (!plugin) {
            return null;
        }

        if (Plugin.versionSatisfies(plugin.version, parsed.version)) {
            return plugin;
        }
    };

    Plugin.versionParse = function(name) {
        return {
            name: name.split('@')[0],
            pattern: name.split('@')[1] || '*'
        };
    };

    Plugin.semverParse = function(pattern) {
        var parsed = {};

        parsed.version = pattern;

        if (+parsed.version[0] === NaN) {
            parsed.operator = parsed.version[0];
            parsed.version = parsed.version.substr(1);
        }

        parsed.parts = Common.map(parsed.version.split('.'), function(part) {
            return +part;
        });

        return parsed;
    };

    Plugin.versionNumber = function(version) {
        var parts = Plugin.semverParse(version).parts;
        return parts[0] * 1e8 + parts[1] * 1e4 + parts[2];
    };

    Plugin.versionLt = function(versionA, versionB) {
        return Plugin.versionNumber(versionA) < Plugin.versionNumber(versionB);
    };

    Plugin.versionLte = function(versionA, versionB) {
        return Plugin.versionNumber(versionA) <= Plugin.versionNumber(versionB);
    };

    Plugin.versionGt = function(versionA, versionB) {
        return Plugin.versionNumber(versionA) > Plugin.versionNumber(versionB);
    };

    Plugin.versionGte = function(versionA, versionB) {
        return Plugin.versionNumber(versionA) >= Plugin.versionNumber(versionB);
    };

    Plugin.versionSatisfies = function(version, pattern) {
        // https://docs.npmjs.com/misc/semver#advanced-range-syntax
        var operator;
        pattern = pattern || '*';

        if (isNaN(+pattern[0])) {
            operator = pattern[0];
            pattern = pattern.substr(1);
        }

        var parts = Common.map(version.split('.'), function(part) {
            return +part;
        });

        var patternParts = Common.map(pattern.split('.'), function(part) {
            return +part;
        });

        /*var parsed = Plugin.semverParse(pattern);

        if (parsed.operator === '*') {
            return true;
        }

        if (parsed.operator === '~') {
            return Plugin.versionGte(version, parsed.pattern) +
                Plugin.versionLte(version, parts[0] + '.' + (+parts[1] + 1) + '.0');
        }

        if (parsed.operator === '^') {
            return Plugin.versionGte(version, pattern) +
                Plugin.versionLte(version, parts[0] + '.' + (+parts[1] + 1) + '.0');
        }*/

        if (operator === '*') {
            return true;
        }

        if (operator === '~') {
            return parts[0] === patternParts[0] && parts[1] === patternParts[1] && parts[2] >= patternParts[2];
        }

        if (operator === '^') {
            if (patternParts[0] > 0) {
                return parts[0] === patternParts[0] && Plugin.versionGte(version, pattern);
            }

            if (patternParts[1] > 0) {
                return parts[2] >= patternParts[2];
            }

            //return parts[0] === patternParts[0] && (parts[1] >= patternParts[1] || parts[2] >= patternParts[2]);

            //return '^' + parts[0] === patternParts[0] && +parts[1] >= +patternParts[1] || +parts[2] >= +patternParts[2];
        }

        return version === pattern;
    };

})();
