
const zeros = require('zeros');
const cwiseBinarify = require('./cwiseBinarify/cwiseBinarify');

const binarify = (voxelSpace) =>
{
    let shape = voxelSpace.shape;
    let filledSolidVoxelSpace = zeros(shape, 'uint8');

    cwiseBinarify(filledSolidVoxelSpace, voxelSpace);

    return filledSolidVoxelSpace;
};

module.exports = binarify;