
const DIRECTION_VECTOR = require('../shared/DIRECTION_VECTOR/DIRECTION_VECTOR')
const contourWalk = require('./contourWalk/contourWalk');

const zeros = require('zeros');
const ops = require("ndarray-ops");

const arrayAdd = (a, b) => a.slice().map((val, index) => val + b[index]);

const inRange = (pos, arr) => 
{
    return pos.every((coordinate, index) => coordinate >= 0 && coordinate < arr.shape[index])
}


const floodFill = (arr, pos, replacingValue) => 
{
    let result = cloneNDArray(arr)
    let queue = [ pos ]

    const valueToReplace = arr.get(...pos)

    if(replacingValue === valueToReplace)
    {
        throw Error("Value to replace must be different from the replacing value")
    }
    
    const directions = [
        [-1, -1],
        [0, -1],
        [1, -1],

        [-1, 0],
        [1, 0],

        [-1, 1],
        [0, 1],
        [1, 1]
    ]

    while(queue.length > 0)
    {
        const currentPos = queue.shift()
        const valueOfCurrentPos = result.get(...currentPos)

        if(inRange(currentPos, arr) && valueOfCurrentPos === valueToReplace)
        {
            result.set(...currentPos, replacingValue)

            directions.forEach(direction =>  
            {
                const nextPos = arrayAdd(currentPos, direction)
                
                queue.push(nextPos)
            })
        }
    }

    return result
}

const cloneNDArray = (toClone) => 
{ 
    let result = zeros(toClone.shape);
    ops.assign(result, toClone);
    return result;
};

const getCompassInnerContoursStartPositions = (surface) => 
{
    let result = [];
    
    let field = floodFill(surface.field, [0, 0], 1);

    for(let x=0; x<field.shape[0]; x++)
    for(let y=0; y<field.shape[1]; y++)
    {
        if(field.get(x, y) == 0)
        {
            field = floodFill(field, [x, y], 1);
            result.push([x, y]);
        }
    }

    return result;
}

const getCompassOuterContourStartPosition = (surface) => 
{
    let field = surface.field;

    for(let i=0; i<field.shape[0]; i++)
    {
        if(field.get(i, 1) == 1)
        {
            return [i, 1].slice();
        }
    }

    throw new Exception("getContourWalkCompassStartPosition failed!");
}

const calculateContourOfSurfaces = (surfaces) => 
{
    const contourList = surfaces.map((surface) => 
    {
        const compassOuterContourStartPosition = getCompassOuterContourStartPosition(surface);
        const outerContour = contourWalk(surface, compassOuterContourStartPosition, false);
        const compassInnerCountoursStartPositions = getCompassInnerContoursStartPositions(surface);
        const innerContours = compassInnerCountoursStartPositions.map(startPosition => contourWalk(surface, startPosition, true)); 

        const hasMargin = DIRECTION_VECTOR[surface.direction].reduce((acc, element) => acc + element, 0) > 0 ? 1 : 0;

        if(hasMargin == 0) outerContour.reverse();

        return { outerContour, innerContours, direction: surface.direction, voxelValue: surface.voxelValue };
    });

    return contourList;
}

module.exports = calculateContourOfSurfaces;