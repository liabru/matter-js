(function() {

    var chain = Matter.Common.chain;

    var MatterPlugin2 = {
        name: 'matter-plugin-2',

        version: '0.1.0',

        for: 'matter-js@^0.10.0',

        uses: ['matter-plugin'],

        options: {
            thing: 1
        },

        install: function(matter) {
            matter.Engine.create = chain(
                matter.Engine.create,
                MatterPlugin2.engineCreate
            );
        },

        engineCreate: function(element, options, engine) {
            console.log('patched engine create!', arguments);
        }
    };

    Matter.Plugin.exports(MatterPlugin2);

    window.MatterPlugin2 = MatterPlugin2;

})();
