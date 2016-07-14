/**
 * Created by dump on 14.07.2016.
 */

var globalVariables = require('globalVariables');

var towerController = {
    run: function() {
        var towers = Game.rooms[globalVariables.myRooms[0]].find(STRUCTURE_TOWER);

        for(var towerId in towers) {
            var tower = towers[towerId];

            if(tower) {
                var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

                if(closestHostile) {
                    tower.attack(closestHostile);
                }

                // var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                //     filter: (structure) => structure.hits < structure.hitsMax
                // });
                // if(closestDamagedStructure) {
                //     tower.repair(closestDamagedStructure);
                // }
            }
        }
    }
};


module.exports = towerController;