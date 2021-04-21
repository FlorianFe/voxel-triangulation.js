
const { sqrt, pow, abs } = Math
const EPSILON = 0.000000000001

const subtract = (p1, p2) => 
{
    return { 
        x: p1.x - p2.x,  
        y: p1.y - p2.y,  
        z: p1.z - p2.z 
    }
}

const equals = (p1, p2) => 
{
    return (p1.x === p2.x && p1.y === p2.y && p1.z === p2.z)
}

const ccw = (p1, p2, p3) => 
{
    return (p3.y-p1.y) * (p2.x-p1.x) > (p2.y-p1.y) * (p3.x-p1.x)
}

const areLinesIntersecting = (s1, s2) => 
{
    const a = s1.p1
    const b = s1.p2
    const c = s2.p1
    const d = s2.p2

    const v1 = normalize(subtract(a, b))
    const v2 = normalize(subtract(c, d))

    const difference = length(subtract(v1, v2))
    
    if(equals(a, c) || equals(a, d) || equals(b, c) || equals(b, d))
    {
        // Segments share one point
        return false
    }

    if(difference < EPSILON)
    {
        // Segments are parallel
        return false
    }

    return ccw(a, c, d) != ccw(b, c, d) && ccw(a, b, c) != ccw(a, b, d)
}

const length = (v) => 
{
    return sqrt(pow(v.x, 2) + pow(v.y, 2) + pow(v.z, 2))
}

const normalize = (v) => 
{
    const l = length(v)

    if(abs(l) < EPSILON)
    {
        console.warn("Division through zero")
        return { x: 1, y: 0, z : 0 }
    } 

    const x = v.x / l
    const y = v.y / l
    const z = v.z / l

    return { x, y, z }
}

const crossProduct = (v1, v2) => 
{
    const x = v1.y * v2.z - v1.z * v2.y
    const y = v1.z * v2.x - v1.x * v2.z
    const z = v1.x * v2.y - v1.y * v2.x

    return { x, y, z }
}

const skalarProduct = (v1, v2) => 
{
    const a = v1.x * v2.x
    const b = v1.y * v2.y
    const c = v1.z * v2.z

    return a + b + c
}

const areaOfTriangle = (tri) => 
{
    const a = length(subtract(tri.p1, tri.p2))
    const b = length(subtract(tri.p2, tri.p3))
    const c = length(subtract(tri.p3, tri.p1))

    const s = (a + b + c) / 2
    const area = sqrt(s * (s - a) * (s - b) * (s - c))

    return area
}

const isPointInTriangle = (tri, point) => 
{
    const triA = { p1: point, p2: tri.p2, p3: tri.p3 }
    const triB = { p1: tri.p1, p2: point, p3: tri.p3 }
    const triC = { p1: tri.p1, p2: tri.p2, p3: point }

    const areaOfOuterTriangle = areaOfTriangle(tri)
    const areaA = areaOfTriangle(triA)
    const areaB = areaOfTriangle(triB)
    const areaC = areaOfTriangle(triC)

    if(areaA < EPSILON) return false
    if(areaB < EPSILON) return false
    if(areaC < EPSILON) return false

    const difference = abs(areaOfOuterTriangle - (areaA + areaB + areaC))

    return (difference < EPSILON)
}

const checkCase2 = (triA, triB) => 
{
    // TODO: Translate 3D to 2D

    if(
        equals(triA.p1, triB.p1) && equals(triA.p2, triB.p2) && equals(triA.p3, triB.p3) ||
        equals(triA.p1, triB.p1) && equals(triA.p2, triB.p3) && equals(triA.p3, triB.p2) ||
        equals(triA.p1, triB.p2) && equals(triA.p2, triB.p1) && equals(triA.p3, triB.p3) || 
        equals(triA.p1, triB.p2) && equals(triA.p2, triB.p3) && equals(triA.p3, triB.p2) || 
        equals(triA.p1, triB.p3) && equals(triA.p2, triB.p1) && equals(triA.p3, triB.p2) || 
        equals(triA.p1, triB.p3) && equals(triA.p2, triB.p2) && equals(triA.p3, triB.p1) 
    )
    {
        return false
    }

    const triAS1 = { p1: triA.p1, p2: triA.p2 }
    const triAS2 = { p1: triA.p2, p2: triA.p3 }
    const triAS3 = { p1: triA.p3, p2: triA.p1 }

    const triBS1 = { p1: triB.p1, p2: triB.p2 }
    const triBS2 = { p1: triB.p2, p2: triB.p3 }
    const triBS3 = { p1: triB.p3, p2: triB.p1 }

    const intersectionChecks = 
    [
        areLinesIntersecting(triAS1, triBS1),
        areLinesIntersecting(triAS1, triBS2),
        areLinesIntersecting(triAS1, triBS3),

        areLinesIntersecting(triAS2, triBS1),
        areLinesIntersecting(triAS2, triBS2),
        areLinesIntersecting(triAS2, triBS3),

        areLinesIntersecting(triAS3, triBS1),
        areLinesIntersecting(triAS3, triBS2),
        areLinesIntersecting(triAS3, triBS3)
    ]

    const pointInTriangleChecks = 
    [
        isPointInTriangle(triA, triB.p1),
        isPointInTriangle(triA, triB.p2),
        isPointInTriangle(triA, triB.p3),

        isPointInTriangle(triB, triA.p1),
        isPointInTriangle(triB, triA.p2),
        isPointInTriangle(triB, triA.p3),
    ]

    const checks = intersectionChecks.concat(pointInTriangleChecks)
        
    const pass = checks.some((value) => value)

    return pass
}

const checkIfTrianglesAreOverlapping = (triA, triB) => 
{
    if(areaOfTriangle(triA) < EPSILON) return false
    if(areaOfTriangle(triB) < EPSILON) return false

    const directionVector1OfTriA = subtract(triA.p1, triA.p2)
    const directionVector2OfTriA = subtract(triA.p1, triA.p3)

    const directionVector1OfTriB = subtract(triB.p1, triB.p2)
    const directionVector2OfTriB = subtract(triB.p1, triB.p3)

    const normalOnTriA = normalize(crossProduct(directionVector1OfTriA, directionVector2OfTriA))
    const normalOnTriB = normalize(crossProduct(directionVector1OfTriB, directionVector2OfTriB))    

    const skalarProductOfNormalAndTriBDir1 = skalarProduct(normalOnTriA, directionVector1OfTriB)
    const skalarProductOfNormalAndTriBDir2 = skalarProduct(normalOnTriA, directionVector2OfTriB)

    // console.log(normalOnTriA, normalOnTriB, directionVector1OfTriB, directionVector2OfTriB, abs(skalarProductOfNormalAndTriBDir1))

    const areTrisParallel = abs(skalarProductOfNormalAndTriBDir1) < EPSILON && abs(skalarProductOfNormalAndTriBDir2) < EPSILON

    if(areTrisParallel)
    {
        const distanceToLayerOfTriA = skalarProduct(triA.p1, normalOnTriA)
        const distanceToLayerOfTriB = skalarProduct(triB.p1, normalOnTriB)

        if(abs(distanceToLayerOfTriA - distanceToLayerOfTriB) < EPSILON)
        {
            // Case 2: Tris share same Layer
            console.log("case 2")
            return checkCase2(triA, triB)       
        }
        else
        {
            // Case 3: Tris don't share same Layer (They are just parallel)
            console.log("case 3")
            return false
        }
    }
    else
    {
        // Case 1 : Tris are not parallel
        console.log("case 1")
        return false // TODO
    }
}

module.exports = checkIfTrianglesAreOverlapping

/*
// Parallel Case
console.log(checkIfTrianglesAreOverlapping(
    {
        p1: { x: 0, y: 0, z: 0},
        p2: { x: 1, y: 0, z: 0},
        p3: { x: 0, y: 1, z: 0}
    },
    {
        p1: { x: 0, y: 0, z: 1},
        p2: { x: 1, y: 0, z: 1},
        p3: { x: 0, y: 1, z: 1}
    }
))
// Same Layer Case - false
console.log(checkIfTrianglesAreOverlapping(
    {
        p1: { x: 0, y: 0, z: 0},
        p2: { x: 1, y: 0, z: 0},
        p3: { x: 1, y: 1, z: 0}
    },
    {
        p1: { x: 0, y: 0, z: 0},
        p2: { x: 0, y: 1, z: 0},
        p3: { x: 1, y: 1, z: 0}
    }
))
// Same Layer Case - true
console.log(checkIfTrianglesAreOverlapping(
    {
        p1: { x: 0, y: 1, z: 0},
        p2: { x: 1, y: 0, z: 0},
        p3: { x: 0, y: 0, z: 0}
    },
    {
        p1: { x: 0, y: 0, z: 0},
        p2: { x: 0, y: 1, z: 0},
        p3: { x: 1, y: 1, z: 0}
    }
))
// Same Layer Case - same tris
console.log(checkIfTrianglesAreOverlapping(
    {
        p1: { x: 0, y: 1, z: 0},
        p2: { x: 1, y: 0, z: 0},
        p3: { x: 0, y: 0, z: 0}
    },
    {
        p1: { x: 0, y: 1, z: 0},
        p2: { x: 1, y: 0, z: 0},
        p3: { x: 0, y: 0, z: 0}
    }
))
*/