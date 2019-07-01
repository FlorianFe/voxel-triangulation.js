
const zeros = require('zeros');

const DIRECTION = require('../shared/DIRECTION/DIRECTION');
const DIRECTION_VECTOR = require('../shared/DIRECTION_VECTOR/DIRECTION_VECTOR');
const ORTHOGONAL_DIRECTIONS = require('../shared/ORTHOGONAL_DIRECTIONS/ORTHOGONAL_DIRECTIONS');
const COMPASS_DIRECTION_VECTOR = require('../shared/COMPASS_DIRECTION_VECTOR/COMPASS_DIRECTION_VECTOR');

const arrayAdd = (a, b) => a.slice().map((val, index) => val + b[index]);
const arraySub = (a, b) => a.slice().map((val, index) => val - b[index]);
const scaleVector = (factor, vec) => vec.map((component) => component * factor);

const getPositionOfCoordinate = (basePosition, coordinates, orthogonalDirectionVectors) => 
{
    let swappedCoordinates = [coordinates[1], coordinates[0]]; 

    return swappedCoordinates
        .map((coord, index) => scaleVector(coord, orthogonalDirectionVectors[index]))
        .reduce((acc, vec) => arrayAdd(acc, vec), basePosition);
};

const extractSurface = (voxelSpace, solidSpace, markedSpace, position, direction) => 
{
    const directionVector = DIRECTION_VECTOR[direction];
    const orthogonalDirectionVectors = ORTHOGONAL_DIRECTIONS[direction].map((element) => DIRECTION_VECTOR[element]);

    let voxelValue = voxelSpace.get(...position);

    let stack1 = [ [0, 0] ];
    let stack2 = [ [0, 0] ];
    let minCoordinates = [0, 0];
    let maxCoordinates = [0, 0];

    while(stack1.length > 0)
    {
        let currentCoordinates = stack1.pop();
        let currentPosition = getPositionOfCoordinate(position, currentCoordinates, orthogonalDirectionVectors);
        
        if(markedSpace.get(...currentPosition, direction) == 0)
        {
            stack2.push(currentCoordinates.slice());
            markedSpace.set(...currentPosition, direction, 1);

            if(currentCoordinates[0] < minCoordinates[0]) minCoordinates[0] = currentCoordinates[0];
            if(currentCoordinates[1] < minCoordinates[1]) minCoordinates[1] = currentCoordinates[1];
            if(currentCoordinates[0] > maxCoordinates[0]) maxCoordinates[0] = currentCoordinates[0];
            if(currentCoordinates[1] > maxCoordinates[1]) maxCoordinates[1] = currentCoordinates[1];

            orthogonalDirectionVectors.forEach((orthogonalDirectionVector, index) => 
            {
                let nextPosition = arrayAdd(currentPosition, orthogonalDirectionVector);
                let potentialOccludingPosition = arrayAdd(nextPosition, directionVector);

                if(voxelSpace.get(...nextPosition) == voxelValue && solidSpace.get(...potentialOccludingPosition) == 0)
                {
                    // clockwise | North - East - South - West
                    let nextCoordinates = arrayAdd(currentCoordinates, COMPASS_DIRECTION_VECTOR[index]);
                    stack1.push(nextCoordinates.slice());
                }
            });
        }   
    }

    let field = zeros(arrayAdd(arraySub(maxCoordinates, minCoordinates), [3, 3]), 'uint32');

    while(stack2.length > 0)
    {
        let currentCoordinates = stack2.pop();

        if(field.get(...arrayAdd(arraySub(currentCoordinates, minCoordinates), [1, 1])) == 0)
        {
            field.set(...arrayAdd(arraySub(currentCoordinates, minCoordinates), [1, 1]), 1);
        }
    };

    return {
        voxelValue: voxelSpace.get(...position),
        direction: direction,
        field: field, 
        fieldMinPosition: getPositionOfCoordinate(position, minCoordinates, orthogonalDirectionVectors)
    };
};

const extractSurfaces = (voxelSpace, solidSpace) => 
{
    let markedSpace = zeros([...voxelSpace.shape, 6]);
    let surfaceList = [];

    const sx = voxelSpace.shape[0];
    const sy = voxelSpace.shape[1];
    const sz = voxelSpace.shape[2];

    for(let y=0; y<sy; ++y)
    for(let z=0; z<sz; ++z)
    {
        let lastSolid = 0;
        
        for(let x=0; x<sx; ++x)
        {
            let currentSolid = solidSpace.get(x, y, z);
            
            if(lastSolid != currentSolid)
            {
                if(currentSolid == 1 && markedSpace.get(x, y, z, DIRECTION.NEGATIVE_X) == 0)
                {
                    let surface = extractSurface(voxelSpace, solidSpace, markedSpace, [x, y, z], DIRECTION.NEGATIVE_X);
                    surfaceList.push(surface);
                }
                
                if(currentSolid == 0 && markedSpace.get(x - 1, y, z, DIRECTION.POSITIVE_X) == 0)
                {
                    let surface = extractSurface(voxelSpace, solidSpace, markedSpace, [x - 1, y, z], DIRECTION.POSITIVE_X);
                    surfaceList.push(surface);
                }
            }

            lastSolid = currentSolid;
        }
    }

    for(let x=0; x<sx; ++x)
    for(let z=0; z<sz; ++z)
    {
        let lastSolid = 0;
        
        for(let y=0; y<sy; ++y)
        {
            let currentSolid = solidSpace.get(x, y, z);
            
            if(lastSolid != currentSolid)
            {
                if(currentSolid == 1 && markedSpace.get(x, y, z, DIRECTION.NEGATIVE_Y) == 0)
                {
                    let surface = extractSurface(voxelSpace, solidSpace, markedSpace, [x, y, z], DIRECTION.NEGATIVE_Y);
                    surfaceList.push(surface);
                }
                
                if(currentSolid == 0 && markedSpace.get(x, y - 1, z, DIRECTION.POSITIVE_Y) == 0)
                {
                    let surface = extractSurface(voxelSpace, solidSpace, markedSpace, [x, y - 1, z], DIRECTION.POSITIVE_Y);
                    surfaceList.push(surface);
                }
            }

            lastSolid = currentSolid;
        }
    }

    for(let x=0; x<sx; ++x)
    for(let y=0; y<sy; ++y)
    {
        let lastSolid = 0;

        for(let z=0; z<sz; ++z)
        {
            let currentSolid = solidSpace.get(x, y, z);
            
            if(lastSolid != currentSolid)
            {
                if(currentSolid == 1 && markedSpace.get(x, y, z, DIRECTION.NEGATIVE_Z) == 0)
                {
                    let surface = extractSurface(voxelSpace, solidSpace, markedSpace, [x, y, z], DIRECTION.NEGATIVE_Z);
                    surfaceList.push(surface);
                }
                
                if(currentSolid == 0 && markedSpace.get(x, y, z - 1, DIRECTION.POSITIVE_Z) == 0)
                {
                    let surface = extractSurface(voxelSpace, solidSpace, markedSpace, [x, y, z - 1], DIRECTION.POSITIVE_Z);
                    surfaceList.push(surface);
                }
            }

            lastSolid = currentSolid;
        }
    }

    return surfaceList;
}

module.exports = extractSurfaces;