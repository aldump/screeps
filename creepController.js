/**
 * Created by dump on 05.07.2016.
 */
var globalVariables = require('globalVariables');

var tryAttack = function (object) {
    var targets = [];
    
    if(Game.rooms[globalVariables.roomToInvade]) {
        targets = Game.rooms[globalVariables.roomToInvade].find(object, {
            filter: (creep) => {
                if (!creep.owner || (creep.structureType && creep.structureType == STRUCTURE_CONTROLLER)) {
                    return false;
                }
                return creep.owner.username != 'dump';
            }
        });
    }

    return targets;
};


var roles = {
    'harvester': {
        /**
         * @param Creep creep
         */
        targets: function (creep) {
            return Game.rooms[globalVariables.myRooms[0]].find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.energy < structure.energyCapacity;
                }
            });
        },
        /**
         * @param Creep creep
         */
        workFunction: function (creep, target) {
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        },
        operatingRoom: globalVariables.myRooms[0]
    },
    'updater': {
        /**
         * @param Creep creep
         */
        targets: function (creep) {
            return [Game.rooms[globalVariables.myRooms[0]].controller];
        },
        /**
         * @param Creep creep
         */
        workFunction: function (creep, target) {
            if(creep.upgradeController(Game.rooms[globalVariables.myRooms[0]].controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.rooms[globalVariables.myRooms[0]].controller);
            }
        },
        operatingRoom: globalVariables.myRooms[0]
    },
    'builder': {
        /**
         * @param Creep creep
         */
        targets: function (creep) {
            return Game.rooms[globalVariables.myRooms[0]].find(FIND_CONSTRUCTION_SITES);
        },
        /**
         * @param Creep creep
         */
        workFunction: function (creep, target) {
            if(creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        },
        operatingRoom: globalVariables.myRooms[0]
    },
    'repairer': {
        /**
         * @param Creep creep
         */
        targets: function (creep) {
            return Game.rooms[globalVariables.myRooms[0]].find(FIND_STRUCTURES,
                {
                    filter: (structure) => {
                        if(structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) {
                            return structure.hits < 100000
                        }

                        return structure.hits < structure.hitsMax
                    }
                });
        },
        /**
         * @param Creep creep
         */
        workFunction: function (creep, target) {
            if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        },
        operatingRoom: globalVariables.myRooms[0]
    },
    'supplier': {
        /**
         * @param Creep creep
         */
        targets: function (creep) {
            return Game.rooms[globalVariables.myRooms[0]].find(FIND_STRUCTURES,
                {
                    filter: (structure) =>
                        structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity
                }
            );
        },
        /**
         * @param Creep creep
         */
        workFunction: function (creep, target) {
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        },
        operatingRoom: globalVariables.myRooms[0]
    },
    'attacker': {
        /**
         * @param Creep creep
         */
        targets: function (creep) {
            var targets = tryAttack(FIND_CREEPS);

            if (targets.length == 0) {
                targets = tryAttack(FIND_STRUCTURES);
            }

            return targets;
        },
        /**
         * @param Creep creep
         */
        workFunction: function (creep, target) {
            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        },
        operatingRoom: globalVariables.roomToInvade
    },
    'guardian': {
        /**
         * @param Creep creep
         */
        targets: function (creep) {
            return tryAttack(FIND_CREEPS);
        },
        /**
         * @param Creep creep
         */
        workFunction: function (creep, target) {
            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        },
        operatingRoom: globalVariables.myRooms[0]
    }
};

module.exports = {
    controllCreeps: function () {
        var myCreeps = _.filter(Game.creeps, (creep) => creep.owner.username == 'dump');

        for (var id in myCreeps) {
            var creep = myCreeps[id];

            if(creep) {
                this.executeRole(creep);
            }
        }
    },

    processCreeps: function () {
        var needs = {
            harvester: 0,
            updater: 0,
            builder: 0,
            repairer: 5,
            supplier: 0
        };
        var changableRoles = ['harvester', 'builder', 'repairer', 'supplier'];

        var myCreeps = _.filter(Game.creeps, (creep) => creep.owner.username == 'dump');

        for(var id in changableRoles) {
            var roleName = changableRoles[id];
            var role = roles[roleName];
            var roleCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);

            var targets = role.targets();
            
            if(targets.length == 0) {
                for (var creepId in roleCreeps) {
                    roleCreeps[creepId].memory.role = null;
                }
            } else {
                if(needs[roleName] == 0) {
                    needs[roleName] = targets.length - roleCreeps.length;
                } else {
                    needs[roleName] = needs[roleName] - roleCreeps.length;
                }
                
                if(targets.length < needs[roleName]) {
                    needs[roleName] = targets.length - roleCreeps.length
                }
            }

            if(needs[roleName] < 0) {
                for(var creepId in roleCreeps) {
                    if(needs[roleName] >= 0) {
                        break;
                    }

                    roleCreeps[creepId].memory.role = null;
                    needs[roleName]++;
                }
            }
        }

        for (var id in myCreeps) {
            var creep = myCreeps[id];

            if(! creep.memory.role) {
                creep.memory.role = 'updater';
            }

            if(needs.harvester > 0 && creep.memory.role == 'updater') {
                creep.memory.role = 'harvester';
                needs.harvester--;
                continue;
            }

            if(needs.builder > 0 && creep.memory.role == 'updater') {
                creep.memory.role = 'builder';
                needs.builder--;
                continue;
            }

            if(needs.repairer > 0 && creep.memory.role == 'updater') {
                creep.memory.role = 'repairer';
                needs.repairer--;
                continue;
            }

            if(needs.supplier > 0 && creep.memory.role == 'updater') {
                creep.memory.role = 'supplier';
                needs.supplier--;
                continue;
            }
        }
    },
    /**
     * @param Creep creep
     */
    executeRole: function (creep) {
        var role = roles[creep.memory.role];

        if (! role) {
            return;
        }

        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if(creep.room.name != role.operatingRoom) {
            creep.memory.goToOperatingRoom = true;
        } else {
            creep.memory.goToOperatingRoom = false;
        }

        if(creep.memory.goToOperatingRoom) {
            if(creep.room.name != role.operatingRoom) {
                var trip = Game.map.findRoute(creep.room, role.operatingRoom);

                if(trip.length != 0) {
                    var exit = creep.pos.findClosestByRange(trip[0].exit);

                    if(exit) {
                        creep.moveTo(exit);
                    }
                }
            }
        }

        if(creep.memory.working) {
            if(creep.room.name != role.operatingRoom) {
                creep.memory.goToOperatingRoom = true;
            }

            var target = creep.pos.findClosestByRange(role.targets(creep));

            if(target) {
                role.workFunction(creep, target);
            }
        }
        else {
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            var errorCode = creep.harvest(source);

            switch (errorCode) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(source);
                    break;
                case ERR_NOT_OWNER:
                    creep.memory.goToOperatingRoom = true;
                    break;
                default:
                    break;
            }
        }
    }
};