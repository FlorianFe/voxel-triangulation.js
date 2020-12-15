
import { BufferGeometry, BufferAttribute, MeshStandardMaterial, Mesh } from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

import ndarray from 'ndarray'
import { product, flatten } from 'ramda'
const { random } = Math

import triangulateVoxels from '../voxel-triangulation'

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

const componentizedColores = [
    [255, 0, 0], 
    [0, 255, 0], 
    [0, 0, 255]
]

const loadVoxels = () => 
{
    const AMOUNT_OF_VOXEL_VALUES = 3
    const SHAPE = [75, 75, 75]
    const values = new Array(product(SHAPE)).fill(0).map((_, index) => 1 + (index % AMOUNT_OF_VOXEL_VALUES))

    const voxels = ndarray(values, SHAPE);
    const config = { exclude: [0] }; 

    let { vertices, normals, indices, voxelValues } = triangulateVoxels(voxels, config);

    let normalizedColors = componentizedColores.map((color) => color.map((c) => c / 255.0));
    let alignedColors = [ [0, 0, 0], ...normalizedColors ];
    let flattenedColors = flatten(voxelValues.map((v) => alignedColors[v]));

    let geometry = new BufferGeometry();

    geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
    geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(flattenedColors), 3) );
    geometry.setIndex(new BufferAttribute(new Uint32Array(indices), 1));

    let material = new MeshStandardMaterial({ color: '#ffffff', roughness: 1.0, metalness: 0.0 });
    let mesh = new Mesh(geometry, material);
    let exporter = new GLTFExporter();

    exporter.parse(mesh, (json) => 
    {
        let string = JSON.stringify(json);
        let blob = new Blob([string], { type:'text/plain' });
        let url = URL.createObjectURL(blob);

        let modelViewer = document.querySelector('#model-viewer')
        modelViewer.src = url;
    });
}

loadVoxels()