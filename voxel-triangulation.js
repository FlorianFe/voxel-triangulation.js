
const expandVoxelSpace = require('./src/expandVoxelSpace/expandVoxelSpace');
const binarify = require('./src/binarify/binarify');
const extractSurfaces = require('./src/extractSurfaces/extractSurfaces');
const triangulateSurfaces = require('./src/triangulateSurfaces/triangulateSurfaces');
const calculateContourOfSurfaces = require('./src/calculateContourOfSurfaces/calculateContourOfSurfaces');

// voxels : ndarray<Integer>
// config : Object 

const voxelTriangulation = (voxels, config) => 
{
    const exclude = (config === undefined) ? [0] : config.exclude || [0];

    console.log(exclude);

    const expandedVoxelSpace = expandVoxelSpace(voxels);
    const solidVoxelSpace = binarify(expandedVoxelSpace, exclude);
    const extractedSurfaces = extractSurfaces(expandedVoxelSpace, solidVoxelSpace);
    const contourList = calculateContourOfSurfaces(extractedSurfaces);
    const triangles = triangulateSurfaces(contourList);

    return triangles;
};

module.exports = voxelTriangulation;