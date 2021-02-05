
const test = require('ava')
const ndarray = require('ndarray');
const { chunk } = require('underscore')
const { product } = require('ramda')
const { random, abs } = Math

const triangulateVoxels = require('../voxel-triangulation');

const uniform = (array) => array.every((element) => abs(element - array[0]) < 0.0001)

const areTrianglesOverlapping = (triangleA, triangleB) => 
{
    const triAp1X = triangleA[0][0]
    const triAp1Y = triangleA[0][1]
    const triAp1Z = triangleA[0][2]
    const triAp2X = triangleA[1][0]
    const triAp2Y = triangleA[1][1]
    const triAp2Z = triangleA[1][2]
    const triAp3X = triangleA[2][0]
    const triAp3Y = triangleA[2][1]
    const triAp3Z = triangleA[2][2]

    const triBp1X = triangleB[0][0]
    const triBp1Y = triangleB[0][1]
    const triBp1Z = triangleB[0][2]
    const triBp2X = triangleB[1][0]
    const triBp2Y = triangleB[1][1]
    const triBp2Z = triangleB[1][2]
    const triBp3X = triangleB[2][0]
    const triBp3Y = triangleB[2][1]
    const triBp3Z = triangleB[2][2]

    return checkIfTrianglesAreOverlapping({
        p1: { x: triAp1X, y: triAp1Y, z: triAp1Z },
        p2: { x: triAp2X, y: triAp2Y, z: triAp2Z },
        p3: { x: triAp3X, y: triAp3Y, z: triAp3Z }
    },
    {
        p1: { x: triBp1X, y: triBp1Y, z: triBp1Z },
        p2: { x: triBp2X, y: triBp2Y, z: triBp2Z },
        p3: { x: triBp3X, y: triBp3Y, z: triBp3Z }
    })
}


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
});

test('check if indices attribute is dividable by 3', t => 
{
    t.assert(triangulations.every((triangulation) => 
    {
        return triangulation.indices.length % 3 === 0
    }))
});

test('check if normals attribute is dividable by 3', t => 
{
    t.assert(triangulations.every((triangulation) => 
    {
       return triangulation.normals.length % 3 === 0
    }))
});

test('check if uv attribute is dividable by 2', t => 
{
    t.assert(triangulations.every((triangulation) => 
    {
        return triangulation.normals.length % 3 === 0
    }))
});

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

        console.log(triangulation.indices.length / 3)
    })    
})