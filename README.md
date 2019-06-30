# voxel-triangulation
converts voxel values into a minimal set of triangles using [ndarray](https://github.com/scijs/ndarray) and [libtess.js](https://github.com/brendankenny/libtess.js/)

## 💾 Installation

    npm install voxel-triangulation

## 🚀 Usage

```
  
  const ndarray = require('ndarray');
  const triangulateVoxels = require('voxel-triangulation');
  
  let voxels = new ndarray([0, 1, 0, 0, 1, 2, 0, 1, 0], [3, 3, 3]);
  let triangles = triangulateVoxels(voxels);
  
  // outputs an object with indices, vertices, normals and voxelValues of the triangles
  console.log(triangles); 

```
