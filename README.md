# voxel-triangulation
converts voxels into a minimal set of triangles using [ndarray](https://github.com/scijs/ndarray) and [libtess.js](https://github.com/brendankenny/libtess.js/)

## 💾 Installation

    npm install voxel-triangulation

## 🚀 Usage

```
  
  const ndarray = require('ndarray');
  const triangulateVoxels = require('voxel-triangulation');
  
  // values of 0 mean there is no voxel
  // values of x>0 mean there is a voxel with a value of x
  let values = [0, 1, 0, 0, 1, 2, 0, 1, 0]
  let voxels = new ndarray(values, [3, 3, 3]);
  let triangles = triangulateVoxels(voxels);
  
  // outputs an object with indices, vertices, normals and voxelValues of the triangles
  console.log(triangles); 

```
