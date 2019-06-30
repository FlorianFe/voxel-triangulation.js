
const DIRECTION_VECTOR = require('../shared/DIRECTION_VECTOR/DIRECTION_VECTOR')

const zeros = require('zeros');
const ops = require("ndarray-ops");
const floodFill = require('flood-fill');

const contourWalk = require('./contourWalk/contourWalk');

const cloneNDArray = (toClone) => 
{ 
    let result = zeros(toClone.shape);
    ops.assign(result, toClone);
    return result;
};

const getCompassInnerContoursStartPositions = (surface) => 
{
    let result = [];
    let field = cloneNDArray(surface.field);
    
    floodFill(field, 0, 0, 1);

    for(let x=0; x<field.shape[0]; x++)
    for(let y=0; y<field.shape[1]; y++)
    {
        if(field.get(x, y) == 0)
        {
            floodFill(field, x, y, 1);
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