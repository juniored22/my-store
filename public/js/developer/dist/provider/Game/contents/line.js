
import { CreateLabel } from './utils.js';

function Line({color=0x0000ff}={}) {
    
    const materialLine = new THREE.LineBasicMaterial( { color } );
    const points = [];
    points.push( new THREE.Vector3( -1, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 1, 0 ) );
    points.push( new THREE.Vector3( 1, 0, 0 ) );
    const geometryLine = new THREE.BufferGeometry().setFromPoints( points );
    const line = new THREE.Line( geometryLine, materialLine );
    const lineLabel = CreateLabel('line', line.position);

    return { line, lineLabel }
}


export { Line }