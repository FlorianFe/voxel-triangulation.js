
var show = require('ndarray-show');

const DIRECTION_VECTOR = require('../../shared/DIRECTION_VECTOR/DIRECTION_VECTOR')
const ORTHOGONAL_DIRECTIONS = require('../../shared/ORTHOGONAL_DIRECTIONS/ORTHOGONAL_DIRECTIONS');
const COMPASS_DIRECTION = require('../../shared/COMPASS_DIRECTION/COMPASS_DIRECTION')
const COMPASS_DIRECTION_VECTOR = require('../../shared/COMPASS_DIRECTION_VECTOR/COMPASS_DIRECTION_VECTOR');

const arrayAdd = (a, b) => a.slice().map((val, index) => val + b[index]);
const scaleVector = (factor, vec) => vec.map((component) => component * factor);
const arrayEqual = (a, b) => (a.every((element, index) => element == b[index]) && a.length == b.length);

const CORNER_POSITION = {
    SW: 0,
    NW: 1,
    NE: 2,
    SE: 3
};

const CORNER_POSITION_VECTOR = [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0]
];


/*
    1  N  2
    W  +  E
    0  S  3
*/

const OPTION_TABLE = [
    { when: [0, 1, 0, 0], necessary: true, cornerPos: COMPASS_DIRECTION.NORTH },
    { when: [1, 0, 0, 0], necessary: true, cornerPos: COMPASS_DIRECTION.SOUTH },
    { when: [1, 0, 0, 1], necessary: false, cornerPos: COMPASS_DIRECTION.EAST },
    { when: [0, 1, 1, 0], necessary: false, cornerPos: COMPASS_DIRECTION.EAST },
    { when: [0, 0, 1, 1], necessary: true, cornerPos: COMPASS_DIRECTION.NORTH },
    { when: [1, 1, 0, 0], necessary: true, cornerPos: COMPASS_DIRECTION.SOUTH },
    { when: [1, 0, 1, 1], necessary: true, cornerPos: COMPASS_DIRECTION.NORTH },
    { when: [0, 1, 1, 1], necessary: true, cornerPos: COMPASS_DIRECTION.SOUTH },

    { when: [0, 1, 0, 1], necessary: true, cornerPos: COMPASS_DIRECTION.NORTH, danger: true },
    { when: [1, 0, 1, 0], necessary: true, cornerPos: COMPASS_DIRECTION.SOUTH, danger: true }
];

const rotateClockwise = (direction, cornerPos) => 
{
    let rotation = 0;
    
    if(direction == COMPASS_DIRECTION.EAST) rotation = 0;
    if(direction == COMPASS_DIRECTION.SOUTH) rotation = 1;
    if(direction == COMPASS_DIRECTION.WEST) rotation = 2;
    if(direction == COMPASS_DIRECTION.NORTH) rotation = 3;

    let rotatedCornerPos = (cornerPos + rotation) % 4;

    return rotatedCornerPos;
} 

const contourWalk = (surface, compassStartPosition, isAHole) =>
{
    let contourVertices = [];

    compassStartPosition = arrayAdd(compassStartPosition, [-1, -1]);

    let currentDirection = COMPASS_DIRECTION.EAST;
    let currentDirectionVector = COMPASS_DIRECTION_VECTOR[currentDirection];
    let currentPosition = arrayAdd(compassStartPosition, currentDirectionVector);
    let field = surface.field;

    let done = false

    while(!done)
    {
        if(arrayEqual(currentPosition, compassStartPosition)) done = true;

        const sw = field.get(...arrayAdd(currentPosition, CORNER_POSITION_VECTOR[rotateClockwise(currentDirection, CORNER_POSITION.SW)]));
        const nw = field.get(...arrayAdd(currentPosition, CORNER_POSITION_VECTOR[rotateClockwise(currentDirection, CORNER_POSITION.NW)]));
        const ne = field.get(...arrayAdd(currentPosition, CORNER_POSITION_VECTOR[rotateClockwise(currentDirection, CORNER_POSITION.NE)]));
        const se = field.get(...arrayAdd(currentPosition, CORNER_POSITION_VECTOR[rotateClockwise(currentDirection, CORNER_POSITION.SE)]));

        const currentSituation = (isAHole) ? [sw, nw, ne, se].map((value) => (value === 0) ? 1 : 0) : [sw, nw, ne, se];
        const option = OPTION_TABLE.find((option) => arrayEqual(option.when, currentSituation));

        currentDirection = rotateClockwise(currentDirection, option.cornerPos);

        const minPosition = surface.fieldMinPosition; // voxel coordinate
        const hasMargin = DIRECTION_VECTOR[surface.direction].reduce((acc, element) => acc + element, 0) > 0 ? 1 : 0;
        const marginVector = scaleVector(hasMargin, DIRECTION_VECTOR[surface.direction]);
        const cornerMinPosition = arrayAdd(marginVector, minPosition);

        const orthogonalVectorY = DIRECTION_VECTOR[ORTHOGONAL_DIRECTIONS[surface.direction][0]];
        const orthogonalVectorX = DIRECTION_VECTOR[ORTHOGONAL_DIRECTIONS[surface.direction][1]]; 
        const moveVectorX = scaleVector(currentPosition[0], orthogonalVectorX);
        const moveVectorY = scaleVector(currentPosition[1], orthogonalVectorY);
        const moveVector = arrayAdd(moveVectorX, moveVectorY);
        const cornerPosition = arrayAdd(cornerMinPosition, moveVector);
        const cornerVertex = { x: cornerPosition[0], y: cornerPosition[1], z: cornerPosition[2], necessary: option.necessary };

        if(option.necessary) contourVertices.push(cornerVertex);
        
        currentPosition = arrayAdd(currentPosition, COMPASS_DIRECTION_VECTOR[currentDirection]);
    } 
    
    return contourVertices;
};

module.exports = contourWalk;