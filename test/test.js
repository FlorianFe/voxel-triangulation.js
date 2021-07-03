
const test = require('ava')
const ndarray = require('ndarray')
const { chunk } = require('underscore')
const { product, flatten } = require('ramda')
const { random, abs } = Math

const triangulateVoxels = require('../voxel-triangulation')

const EPSILON = 0.00001

const uniform = (array) => array.every((element) => abs(element - array[0]) < EPSILON)


const TRIANGULATIONS_AMOUNT = 10
const SHAPE = [30, 30, 30]
let triangulations = []

for(let i=0; i<TRIANGULATIONS_AMOUNT; i++)
{
    const values = new Array(product(SHAPE)).fill(0).map(() => parseInt(random() * 3))

    const voxels = ndarray(values, SHAPE);
    const config = { exclude: [0] }; 

    const triangulation = triangulateVoxels(voxels, config);

    triangulations.push(triangulation)

    console.log(`triangulation: (${i+1} / ${TRIANGULATIONS_AMOUNT})`)    
}

test('check if vertices attribute is dividable by 3', t => 
{
    t.assert(triangulations.every((triangulation) => 
    {
        return triangulation.vertices.length % 3 === 0
    }))
})

test('check if indices attribute is dividable by 3', t => 
{
    t.assert(triangulations.every((triangulation) => 
    {
        return triangulation.indices.length % 3 === 0
    }))
})

test('check if normals attribute is dividable by 3', t => 
{
    t.assert(triangulations.every((triangulation) => 
    {
       return triangulation.normals.length % 3 === 0
    }))
})

test('check if uv attribute is dividable by 2', t => 
{
    t.assert(triangulations.every((triangulation) => 
    {
        return triangulation.normals.length % 3 === 0
    }))
})

test('check if triangles are sharing one (for normal tris) or two (for degenerated tris) coordinate values', t => 
{
    triangulations.forEach((triangulation) => 
    {
        const vertices = chunk(triangulation.vertices, 3)
        const indices = chunk(triangulation.indices, 3)

        const faces = indices.map((face) => [ vertices[face[0]], vertices[face[1]], vertices[face[2]] ])

        t.assert(faces.every((face) => 
        {
            const xValues = face.map(vertex => vertex[0])
            const yValues = face.map(vertex => vertex[1])
            const zValues = face.map(vertex => vertex[2])

            const isDimensionShared = [ uniform(xValues), uniform(yValues), uniform(zValues) ]
            const countOfSharedDimensions = isDimensionShared.filter((val) => val).length

            return (countOfSharedDimensions == 1 || countOfSharedDimensions == 2)
        }))
    })    
})

test('check if triangles are overlapping', t => 
{
    triangulations.forEach((triangulation) => 
    {
        const vertices = chunk(triangulation.vertices, 3)
        const indices = chunk(triangulation.indices, 3)

        const faces = indices.map((face) => [ vertices[face[0]], vertices[face[1]], vertices[face[2]] ])

        t.assert(faces.every((face) => 
        {
            const xValues = face.map(vertex => vertex[0])
            const yValues = face.map(vertex => vertex[1])
            const zValues = face.map(vertex => vertex[2])

            const isDimensionShared = [ uniform(xValues), uniform(yValues), uniform(zValues) ]
            const countOfSharedDimensions = isDimensionShared.filter((val) => val).length

            return (countOfSharedDimensions == 1 || countOfSharedDimensions == 2)
        }))
    })
})


test('libtess is working like I expect', t => 
{
    const libtess = require('libtess');
    let tess = new libtess.GluTesselator();

    tess.gluTessCallback(libtess.gluEnum.GLU_TESS_VERTEX_DATA, (data, vertices) => vertices.push(data));
    tess.gluTessProperty(libtess.gluEnum.GLU_TESS_BOUNDARY_ONLY, false);

    let result = []
    let counter = 0

    tess.gluTessBeginPolygon(result);
    tess.gluTessBeginContour();

    let outerContour = [
        { x: 19, y: 8, z: 24 }, 
        { x: 23, y: 8, z: 24 }, 
        { x: 23, y: 9, z: 24 }, 
        { x: 22, y: 9, z: 24 }, 
        { x: 22, y: 10, z: 24 }, 
        { x: 21, y: 10, z: 24 },
        { x: 21, y: 9, z: 24 }, 
        { x: 20, y: 9, z: 24 }, 
        { x: 20, y: 10, z: 24 }, 
        { x: 21, y: 10, z: 24 },  
        { x: 21, y: 11, z: 24 }, 
        { x: 19, y: 11, z: 24 }
    ]

    let innerContours = [
        [
            { x: 20, y: 10, z: 24 },
            { x: 20, y: 9, z: 24 },
            { x: 21, y: 9, z: 24 }, 
            { x: 21, y: 10, z: 24 }
        ]
    ]

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

    t.pass()
})

