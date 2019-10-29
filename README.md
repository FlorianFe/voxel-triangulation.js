# voxel-triangulation
converts voxels into a set of triangles using [ndarray](https://github.com/scijs/ndarray) and [libtess.js](https://github.com/brendankenny/libtess.js/)

## 💾 Installation

    npm install voxel-triangulation

## 🚀 Usage

```
  
  const ndarray = require('ndarray');
  const triangulateVoxels = require('voxel-triangulation');
  
  let values = [0, 1, 0, 0, 1, 2, 0, 1, 0]
  let voxels = new ndarray(values, [3, 3, 3]);

  // gives list of voxel values which will be excluded (handled as void)
  let config = { exclude: [0] }; 

  let triangulation = triangulateVoxels(voxels, config);
  
  // outputs an object with vertices, normals, indices, uvs and voxel values of the triangles
  console.log(triangulation); 

  // vertices (3 entries for every vertex): [ v1.x, v1.y, v1.z,  v2.x, v2.y, v2.z,  ... ] 
  // normals (3 entries for every vertex): [ n1.x, n1.y, n1.z,  n2.x, n2.y, n2.z,  ... ]
  // indices (3 entries for every face): [ f1.a, f1.b, f1.c,  f2.a, f2.b, f2.c,  ... ] 
  // uvs (2 for every vertex): [ v1.xu, v1.v, v2.u, v2.v, ... ] 
  // voxelValues (1 entry for every face): [ value1, value2, ... ]

```
## 📖 License

(c) 2019 Florian Fechner. [MIT License](https://github.com/FlorianFe/voxel-triangulation/blob/master/LICENSE)
