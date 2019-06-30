const zeros = require('zeros');

const expandVoxelSpace = (voxelSpace) =>
{
    const shape = voxelSpace.shape;
    const expandedShape = shape.map((dim) => dim + 2);
    
    const sx = expandedShape[0] - 1;
    const sy = expandedShape[1] - 1;
    const sz = expandedShape[2] - 1;

    let expandedVoxelSpace = zeros(expandedShape, 'uint32');
    
    for(let x=1; x<sx; ++x)
    for(let y=1; y<sy; ++y)
    for(let z=1; z<sz; ++z)
    {
        const value = voxelSpace.get(x - 1, y - 1, z - 1);
        expandedVoxelSpace.set(x, y, z, value);
    }
    
    return expandedVoxelSpace;
};

module.exports = expandVoxelSpace;