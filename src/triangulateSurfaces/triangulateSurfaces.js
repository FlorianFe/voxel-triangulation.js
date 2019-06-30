
const libtess = require('libtess');
const { flatten } = require('ramda');

const DIRECTION_VECTOR = require('../shared/DIRECTION_VECTOR/DIRECTION_VECTOR');

const calculateCenteringTranslation = (contourList) => 
{
    let vertices = contourList.map(({ outerContour, innerContours }) => 
    {
        return flatten(outerContour
            .concat(flatten(innerContours))
            .map(({ x, y, z }) => [x, y, z]));
    });

    let minX = Math.min(...vertices.map((arr) => arr[0]));
    let maxX = Math.max(...vertices.map((arr) => arr[0]));

    let minY = Math.min(...vertices.map((arr) => arr[1]));
    let maxY = Math.max(...vertices.map((arr) => arr[1]));
    
    let minZ = Math.min(...vertices.map((arr) => arr[2]));
    let maxZ = Math.max(...vertices.map((arr) => arr[2]));

    let tx = -((maxX - minX) / 2.0 + minX);
    let ty = -((maxY - minY) / 2.0 + minY);
    let tz = -((maxZ - minZ) / 2.0 + minZ);

    return { tx, ty, tz };
}

const calculateNoralizingScale = (contourList) => 
{
    let vertices = contourList.map(({ outerContour, innerContours }) => 
    {
        return flatten(outerContour
            .concat(flatten(innerContours))
            .map(({ x, y, z }) => [x, y, z]));
    });

    let minX = Math.min(...vertices.map((arr) => arr[0]));
    let maxX = Math.max(...vertices.map((arr) => arr[0]));

    let minY = Math.min(...vertices.map((arr) => arr[1]));
    let maxY = Math.max(...vertices.map((arr) => arr[1]));
    
    let minZ = Math.min(...vertices.map((arr) => arr[2]));
    let maxZ = Math.max(...vertices.map((arr) => arr[2]));

    let result = 1.0 / Math.max(maxX - minX, maxY - minY, maxZ - minZ);

    return result;
}

const triangulateSurfaces = (contourList) =>
{
    let counter = 0;
    let tess = new libtess.GluTesselator();

    tess.gluTessCallback(libtess.gluEnum.GLU_TESS_VERTEX_DATA, (data, vertices) => vertices.push(data));
    tess.gluTessCallback(libtess.gluEnum.GLU_TESS_COMBINE, (coords) => [coords[0], coords[1], coords[2]]);
    tess.gluTessProperty(libtess.gluEnum.GLU_TESS_BOUNDARY_ONLY, false);
    
    let { tx, ty, tz} = calculateCenteringTranslation(contourList);
    let scale = calculateNoralizingScale(contourList);

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
    }))

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

        return result;
    }));

    return { vertices, normals, indices, voxelValues };
}

module.exports = triangulateSurfaces;