/**
* The `Matter.Plugin` module contains utility functions that are Plugin to all modules.
*
* @class Plugin
*/

var Plugin = {};

module.exports = Plugin;

var Common = require('./Common');

(function() {

    Plugin._registry = {};

    Plugin.exports = function(plugin) {
        if (!Plugin.isValid(plugin)) {
            Common.warn('Plugin.exports:', Plugin.toString(plugin), 'does not implement all required fields.');
        }

        if (plugin.name in Plugin._registry) {
            var registered = Plugin._registry[plugin.name];

            if (Plugin.versionParse(plugin.version).number >= Plugin.versionParse(registered.version).number) {
                Common.warn('Plugin.exports:', Plugin.toString(registered), 'was upgraded to', Plugin.toString(plugin));
                Plugin._registry[plugin.name] = plugin;
            } else {
                Common.warn('Plugin.exports:', Plugin.toString(registered), 'can not be downgraded to', Plugin.toString(plugin));
            }
        } else {
            Plugin._registry[plugin.name] = plugin;
        }

        return plugin;
    };

    Plugin.resolve = function(dependency) {
        return Plugin._registry[Plugin.dependencyParse(dependency).name];
    };

    Plugin.toString = function(plugin) {
        return (plugin.name || 'anonymous') + '@' + (plugin.version || plugin.range || '0.0.0');
    };

    Plugin.isValid = function(obj) {
        return obj && obj.name && obj.version;
    };

    Plugin.isUsed = function(base, name) {
        return base.used.indexOf(name) > -1;
    };

    Plugin.isFor = function(plugin, base) {
        var parsed = plugin.for && Plugin.dependencyParse(plugin.for);
        return !plugin.for || (base.name === parsed.name && Plugin.versionSatisfies(base.version, parsed.range));
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
            Common.warn('Plugin.installDependencies:', Plugin.toString(base), 'does not specify any dependencies to install.');
            return;
        }

        if (base.used && base.used.length > 0) {
            Common.warn('Plugin.installDependencies:', Plugin.toString(base), 'has already installed its dependencies.');
            return;
        }

        var dependencies = Plugin.trackDependencies(base),
            sortedDependencies = Common.topologicalSort(dependencies),
            status = [];

        for (var i = 0; i < sortedDependencies.length; i += 1) {
            if (sortedDependencies[i] === base.name) {
                continue;
            }

            var plugin = Plugin.resolve(sortedDependencies[i]);

            if (!plugin) {
                status.push('❌ ' + sortedDependencies[i]);
            }

            if (!plugin || Plugin.isUsed(base, plugin.name)) {
                continue;
            }

            if (!Plugin.isFor(plugin, base)) {
                Common.warn('Plugin.installDependencies:', Plugin.toString(plugin), 'is for', plugin.for, 'but installed on', Plugin.toString(base) + '.');
            }

            if (plugin.install) {
                plugin.install(base);
                status.push('✅ ' + Plugin.toString(plugin));
            }

            base.used.push(plugin.name);
        }

        Common.info('Plugin status:', status.join(', '));
    };

    Plugin.trackDependencies = function(base, tracked) {
        var parsedBase = Plugin.dependencyParse(base),
            name = parsedBase.name;

        tracked = tracked || {};

        if (name in tracked) {
            return;
        }

        base = Plugin.resolve(base) || base;

        tracked[name] = Common.map(base.uses || [], function(dependency) {
            var parsed = Plugin.dependencyParse(dependency),
                resolved = Plugin.resolve(dependency);

            if (resolved && !Plugin.versionSatisfies(resolved.version, parsed.range)) {
                Common.warn(
                    'Plugin.trackDependencies:', Plugin.toString(resolved), 'does not satisfy',
                    Plugin.toString(parsed), 'used by', Plugin.toString(parsedBase) + '.'
                );
            } else if (!resolved) {
                Common.warn(
                    'Plugin.trackDependencies:', dependency, 'used by',
                    Plugin.toString(parsedBase), 'could not be resolved.'
                );
            }

            return parsed.name;
        });

        for (var i = 0; i < tracked[name].length; i += 1) {
            Plugin.trackDependencies(tracked[name][i], tracked);
        }

        return tracked;
    };

    Plugin.dependencyParse = function(dependency) {
        if (Common.isString(dependency)) {
            return {
                name: dependency.split('@')[0],
                range: dependency.split('@')[1] || '*'
            };
        }

        return {
            name: dependency.name,
            range: dependency.range || dependency.version
        };
    };

    Plugin.versionParse = function(range) {
        var isRange = isNaN(Number(range[0])),
            version = isRange ? range.substr(1) : range,
            parts = Common.map(version.split('.'), function(part) {
                return Number(part);
            });

        return {
            isRange: isRange,
            version: version,
            range: range,
            operator: isRange ? range[0] : '',
            parts: parts,
            number: parts[0] * 1e8 + parts[1] * 1e4 + parts[2]
        };
    };

    Plugin.versionSatisfies = function(version, range) {
        // https://docs.npmjs.com/misc/semver#advanced-range-syntax
        
        range = range || '*';

        var rangeParsed = Plugin.versionParse(range),
            rangeParts = rangeParsed.parts,
            versionParsed = Plugin.versionParse(version),
            versionParts = versionParsed.parts;

        if (rangeParsed.isRange) {
            if (rangeParsed.operator === '*') {
                return true;
            }

            if (rangeParsed.operator === '~') {
                return versionParts[0] === rangeParts[0] && versionParts[1] === rangeParts[1] && versionParts[2] >= rangeParts[2];
            }

            if (rangeParsed.operator === '^') {
                if (rangeParts[0] > 0) {
                    return versionParts[0] === rangeParts[0] && versionParsed.number >= rangeParsed.number;
                }

                if (rangeParts[1] > 0) {
                    return versionParts[1] === rangeParts[1] && versionParts[2] >= rangeParts[2];
                }

                return versionParts[2] === rangeParts[2];
            }
        }

        return version === range;
    };

})();
