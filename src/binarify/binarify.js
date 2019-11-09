
const zeros = require('zeros');

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

    return result;
};

module.exports = binarify;