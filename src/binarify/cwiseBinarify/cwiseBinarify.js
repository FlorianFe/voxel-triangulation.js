
const cwise = require('cwise');

const cwiseBinarify = cwise(
{
    args: ["array", "array"],
    body: function(dist, voxelSpace)
    {
        if(voxelSpace > 0)
        {
            dist = 1;
        }
        else
        {    
            dist = 0;
        }
    }
});

module.exports = cwiseBinarify;
