
const libtess = require('libtess');
const { flatten } = require('ramda');
const { chunk } = require('underscore')

const DIRECTION_VECTOR = require('../shared/DIRECTION_VECTOR/DIRECTION_VECTOR');

const min = (arr) => 
{
    let minimum = Infinity

    for(let i=0; i<arr.length; i++)
    {
        if(arr[i] < minimum)
        {
            minimum = arr[i]
        }
    }

    return minimum
}

const max = (arr) => 
{
    let maximum = -Infinity

    for(let i=0; i<arr.length; i++)
    {
        if(arr[i] > maximum)
        {
            maximum = arr[i]
        }
    }

    return maximum
}


const calculateCenteringTranslation = (contourList) => 
{
    let vertices = contourList.map(({ outerContour, innerContours }) => 
    {
        return flatten(outerContour
            .concat(flatten(innerContours))
            .map(({ x, y, z }) => [x, y, z]));
    });

    let minX = min(vertices.map((arr) => arr[0]));
    let maxX = max(vertices.map((arr) => arr[0]));

    let minY = min(vertices.map((arr) => arr[1]));
    let maxY = max(vertices.map((arr) => arr[1]));
    
    let minZ = min(vertices.map((arr) => arr[2]));
    let maxZ = max(vertices.map((arr) => arr[2]));

    let tx = -((maxX - minX) / 2.0 + minX);
    let ty = -((maxY - minY) / 2.0 + minY);
    let tz = -((maxZ - minZ) / 2.0 + minZ);

    return { tx, ty, tz };
}

const calculateNormalizingScale = (contourList) => 
{
    let vertices = contourList.map(({ outerContour, innerContours }) => 
    {
        return flatten(outerContour
            .concat(flatten(innerContours))
            .map(({ x, y, z }) => [x, y, z]));
    });

    let minX = min(vertices.map((arr) => arr[0]));
    let maxX = max(vertices.map((arr) => arr[0]));

    let minY = min(vertices.map((arr) => arr[1]));
    let maxY = max(vertices.map((arr) => arr[1]));
    
    let minZ = min(vertices.map((arr) => arr[2]));
    let maxZ = max(vertices.map((arr) => arr[2]));

    let result = 1.0 / Math.max(maxX - minX, maxY - minY, maxZ - minZ);

    return result;
}

const triangulateSurfaces = (contourList) =>
{
    let counter = 0;
    let tess = new libtess.GluTesselator();

    tess.gluTessCallback(libtess.gluEnum.GLU_TESS_VERTEX_DATA, (data, vertices) => vertices.push(data));
    tess.gluTessProperty(libtess.gluEnum.GLU_TESS_BOUNDARY_ONLY, false);
    
    let { tx, ty, tz} = calculateCenteringTranslation(contourList);
    let scale = calculateNormalizingScale(contourList);

    let vertices = flatten(contourList.map(({ outerContour, innerContours }) => 
    {
        let unflattedVertices = outerContour
            .concat(flatten(innerContours))
            .map(({ x, y, z }) => [(x + tx) * scale, (y + ty) * scale, (z + tz) * scale]);

        return flatten(unflattedVertices);
    }));

    let voxelValues = flatten(contourList.map(({ outerContour, innerContours, voxelValue }) => 
    {
        let unflattedVertices = outerContour
            .concat(flatten(innerContours))
            .map(() => voxelValue);

        return flatten(unflattedVertices);
    }));

    let normals = flatten(contourList.map(({ outerContour, innerContours, direction }) => 
    {
        let unflattedNormals = outerContour
            .concat(flatten(innerContours))
            .map(() => DIRECTION_VECTOR[direction]);

        return flatten(unflattedNormals);
    }));

    let indices = flatten(contourList.map(({ outerContour, innerContours }) => 
    {
        let result = [];

        tess.gluTessBeginPolygon(result);
        tess.gluTessBeginContour();

        outerContour.forEach(({ x, y, z }) => 
        {   
            tess.gluTessVertex([x, y, z], counter);
            counter++;
        });

        innerContours.forEach((innerContour) => 
        {
            tess.gluTessEndContour();
            tess.gluTessBeginContour();

            let holeContour = innerContour.slice();
            
            holeContour.forEach(({ x, y, z }) => 
            {
                tess.gluTessVertex([x, y, z], counter);
                counter++;
            });
        });

        tess.gluTessEndContour();
        tess.gluTessEndPolygon();

        result = result.filter(index => Number.isInteger(index))

        if(result.length % 3 !== 0)
        {
            console.log("not dividable by 3")
            console.log(result.length)
        }

        if(!result.every(index => Number.isInteger(index)))
        {
            console.log("not every index seems to be an Integer")
            console.log(outerContour, innerContours)
        }

        return result;
    }));


    if(indices.length % 3 !== 0)
    {
        console.log("indices are not dividable by 3")
    }

    let unresizedVertices = flatten(chunk(flatten(contourList.map(({ outerContour, innerContours }) => 
    {
        let unflattedVertices = outerContour
            .concat(flatten(innerContours))
            .map(({ x, y, z }) => [ 
                Math.round(x + tx + 0.5), 
                Math.round(y + ty + 0.5), 
                Math.round(z + tz + 0.5) 
            ]);

        return flatten(unflattedVertices);
    })), 3));

    let uvs = flatten(chunk(indices, 3).map((triangle) => 
    {
        let coordIndices = [
            triangle[0] * 3 + 0, triangle[0] * 3 + 1, triangle[0] * 3 + 2,
            triangle[1] * 3 + 0, triangle[1] * 3 + 1, triangle[1] * 3 + 2,
            triangle[2] * 3 + 0, triangle[2] * 3 + 1, triangle[2] * 3 + 2
        ];

        let fc = coordIndices.map(index => unresizedVertices[index]);

        if(fc[0] === fc[3] && fc[3] === fc[6]) return [fc[1], fc[2], fc[4], fc[5], fc[7], fc[8]];
        if(fc[1] === fc[4] && fc[4] === fc[7]) return [fc[0], fc[2], fc[3], fc[5], fc[6], fc[8]];
        if(fc[2] === fc[5] && fc[5] === fc[8]) return [fc[0], fc[1], fc[3], fc[4], fc[6], fc[7]];

        // throw new Error("UV calculation failed for some reason!")
        //console.log("uv calculation failed!")
    }));

    return { vertices, normals, indices, uvs, voxelValues };
}

module.exports = triangulateSurfaces;