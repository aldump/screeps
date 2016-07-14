/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.produceCreeps');
 * mod.thing == 'a thing'; // true
 */
var roleProduceCreeps = {
    run: function() {
        var harvesters = _.filter(Game.creeps, (creep) => creep.owner.username == 'dump');

        if(harvesters.length < 10) {
            Game.spawns.Spawn1.createCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], null, {});
        }
    }
};


module.exports = roleProduceCreeps;