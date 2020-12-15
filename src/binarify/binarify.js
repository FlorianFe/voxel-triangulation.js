
const zeros = require('zeros');
const ops = require('ndarray-ops')
const DIRECTION_VECTOR = require('../shared/DIRECTION_VECTOR/DIRECTION_VECTOR')

const arrayAdd = (a, b) => a.slice().map((val, index) => val + b[index]);
const arraySub = (a, b) => a.slice().map((val, index) => val - b[index]);
const scaleVector = (factor, vec) => vec.map((component) => component * factor);

const inRange = (pos, arr) => 
{
    return pos.every((coordinate, index) => coordinate >= 0 && coordinate < arr.shape[index])
}

const cloneNDArray = (toClone) => 
{ 
    let result = zeros(toClone.shape);
    ops.assign(result, toClone);
    return result;
};

const floodFill = (arr, pos, replacingValue) => 
{
    let result = cloneNDArray(arr)
    let queue = [ pos ]

    const valueToReplace = arr.get(...pos)

    while(queue.length > 0)
    {
        const currentPos = queue.shift()

        result.set(...currentPos, replacingValue)

        DIRECTION_VECTOR.forEach(direction =>  
        {
            const nextPos = arrayAdd(currentPos, direction)
            const nextValue = result.get(...nextPos)

            if(inRange(nextPos, arr) && nextValue === valueToReplace)
            {
                queue.push(nextPos)
            }
        })
    }

    return result
}

const isBorder = (x, y, z, sx, sy, sz) => 
{
    if(x === 0) return true;
    if(y === 0) return true;
    if(z === 0) return true;

    if(x === sx - 1) return true;
    if(y === sy - 1) return true;
    if(z === sz - 1) return true;

    return false;
}

const binarify = (voxelSpace, exclude) =>
{
    const SOLID = 1;
    const NOT_SOLID = 0;
    const NOT_SOLID_AND_ACCESSABLE = 2

    let shape = voxelSpace.shape;
    let result = zeros(shape, 'uint8');

    const [sx, sy, sz] = shape;

    for(let x=0; x<sx; ++x)
    for(let y=0; y<sy; ++y)
    for(let z=0; z<sz; ++z)
    {
        let value = voxelSpace.get(x, y, z);

        if(exclude.includes(value) || isBorder(x, y, z, sx, sy, sz)) 
        {
            result.set(x, y, z, NOT_SOLID);
        }
        else
        {
            result.set(x, y, z, SOLID);
        }
    }
    
    result = floodFill(result, [0, 0, 0], NOT_SOLID_AND_ACCESSABLE)

    for(let x=0; x<sx; ++x)
    for(let y=0; y<sy; ++y)
    for(let z=0; z<sz; ++z)
    {
        let value = voxelSpace.get(x, y, z);

        if(value === NOT_SOLID_AND_ACCESSABLE) 
        {
            result.set(x, y, z, NOT_SOLID);
        }
        else
        {
            result.set(x, y, z, SOLID);
        }
    }

    return result;
};

module.exports = binarify;