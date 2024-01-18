import React, { useEffect, useRef } from 'react'
import * as THREE from "three"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js"
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
export default function Editor() {
    const mountRef = useRef();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    const controls = new OrbitControls(camera, renderer.domElement);
    const transform = new TransformControls( camera, renderer.domElement );
    function render() {
        renderer.render( scene, camera );
    }
    function onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        render();
    }
    
    useEffect(()=>{
        camera.position.set(0,5,5);
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement)
        renderer.setClearColor(0xeeeeee)

        const gridHelper = new THREE.GridHelper(10, 10);
        scene.add(gridHelper);

        transform.addEventListener( 'change', render );
        transform.addEventListener( 'dragging-changed', function ( event ) {
            controls.enabled = ! event.value;
		});
        scene.add(transform)
        
        const boxGeometry = new THREE.BoxGeometry();
        const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
        scene.add(boxMesh);
        transform.attach( boxMesh );

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update()
            render()
        }; 
        animate()
        return()=>{
            mountRef.current.removeChild(renderer.domElement)
        }
    },[])
    return (
        <div ref={mountRef} className='overflow-hidden'>
        </div>
    )
}
