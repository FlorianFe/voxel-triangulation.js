
const test = require('ava')
const ndarray = require('ndarray');
const { chunk } = require('underscore')
const { product } = require('ramda')
const { pow, random } = Math

const triangulateVoxels = require('../voxel-triangulation');

const uniform = (array) => array.every((element) => element === array[0])

/*
const values = [
    0, 1, 0, 
    0, 1, 2, 
    0, 1, 0,

    0, 1, 0, 
    0, 0, 2, 
    0, 1, 0,

    0, 1, 0, 
    0, 0, 2, 
    0, 0, 0
];*/

const SHAPE = [4, 4, 4]
const values = new Array(product(SHAPE)).fill(0).map(() => parseInt(random() * SHAPE.length))

const voxels = ndarray(values, SHAPE);
const config = { exclude: [0] }; 
const triangulation = triangulateVoxels(voxels, config);


test('check if vertices attribute is dividable by 3', t => 
{
    t.assert(triangulation.vertices.length % 3 === 0)
});

test('check if indices attribute is dividable by 3', t => 
{
    t.assert(triangulation.indices.length % 3 === 0)
});

test('check if normals attribute is dividable by 3', t => 
{
    t.assert(triangulation.normals.length % 3 === 0)
});

test('check if uv attribute is dividable by 2', t => 
{
    t.assert(triangulation.indices.length % 2 === 0)
});


test('check if triangles are sharing exacly one coordinate value', t => 
{
    const vertices = chunk(triangulation.vertices, 3)
    const indices = chunk(triangulation.indices, 3)

    const faces = indices.map((face) => [ vertices[face[0]], vertices[face[1]], vertices[face[2]]])

    t.assert(faces.every((face) => 
    {
        const xValues = face.map(vertex => vertex[0])
        const yValues = face.map(vertex => vertex[1])
        const zValues = face.map(vertex => vertex[2])

        const isDimensionShared = [ uniform(xValues), uniform(yValues), uniform(zValues) ]

        return (isDimensionShared.filter((val) => val).length === 1)
    }), faces)
});

