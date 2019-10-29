
const zeros = require('zeros');

const binarify = (voxelSpace, exclude) =>
{
    const SOLID = 1;
    const NOT_SOLID = 0;

    let shape = voxelSpace.shape;
    let result = zeros(shape, 'uint8');

    for(let x=0; x<shape[0]; ++x)
    for(let y=0; y<shape[1]; ++y)
    for(let z=0; z<shape[2]; ++z)
    {
        let value = voxelSpace.get(x, y, z);

        if(exclude.includes(value)) 
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