import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper.js';
import * as Accordion from '@radix-ui/react-accordion';



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const controls = new OrbitControls(camera, renderer.domElement);
const transform = new TransformControls(camera, renderer.domElement);  


export default function Editor() {

    const [meshArray, setMeshArray] = useState([]);
    const [mode, setMode] = useState('translate');
    const [whatsClicked,setWhatsClicked] = useState(null)
    const mountRef = useRef();

    let targetImage ;
    transform.setSize(0.5,0.5)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const gridHelper = new THREE.GridHelper(5, 5);

    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    function render() {
        renderer.render(scene, camera);
        controls.update()
    }

    const handleResize = () => {
        const { clientWidth, clientHeight } = mountRef.current;
        renderer.setSize(clientWidth, clientHeight);
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
    }
    
    let clicked = false
    function onMouseDown(event) {
        event.preventDefault();
      
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
        raycaster.setFromCamera(mouse, camera);
      
        const clickableObjects = scene.children.filter(
          (obj) => obj !== gridHelper 
          && obj !== transform
          && obj !== targetImage
        );
        console.log(transform.children);
        const intersects = raycaster.intersectObjects(clickableObjects, true);
        // const intersectsall = raycaster.intersectObjects(transform.children, true);
        console.log("i",intersects);
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            setWhatsClicked(clickedObject)
            
            transform.attach(clickedObject);
            clicked=true  
            console.log("c",clickedObject,mode);

        } else {
          // Clicked elsewhere or on an empty space, detach TransformControls
            transform.detach();
            setWhatsClicked(null)
        }
      }
      



    function keyUp(event) {

        switch (event.keyCode) {

            case 16: // Shift
                transform.setTranslationSnap(null);
                transform.setRotationSnap(null);
                transform.setScaleSnap(null);
                break;

        }
    }
    function keyDown(event) {
        switch (event.keyCode) {

            case 81: // Q
                transform.setSpace(transform.space === 'local' ? 'world' : 'local');
                break;

            case 16: // Shift
                transform.setTranslationSnap(10);
                transform.setRotationSnap(THREE.MathUtils.degToRad(15));
                transform.setScaleSnap(0.25);
                break;

            case 87: // W
                transform.setMode('translate');
                setMode('translate')
                console.log(mode === 'rotate');
                break;

            case 69: // E
                transform.setMode('rotate');
                setMode('rotate')
                console.log(mode === 'rotate');
                break;
                
                case 82: // R
                transform.setMode('scale');
                console.log(mode === 'rotate');
                setMode('scale')
                break;

            case 187:
            case 107: // +, =, num+
                transform.setSize(transform.size + 0.1);
                break;

            case 189:
            case 109: // -, _, num-
                transform.setSize(Math.max(transform.size - 0.1, 0.1));
                break;

            case 88: // X
                transform.showX = !transform.showX;
                break;

            case 89: // Y
                transform.showY = !transform.showY;
                break;

            case 90: // Z
                transform.showZ = !transform.showZ;
                break;

            case 32: // Spacebar
                transform.enabled = !transform.enabled;
                break;

            case 27: // Esc
                transform.reset();
                transform.detach();
                break;

        }

    }

    useEffect(() => {
        transform.setMode(mode)
        console.log(mode);
        console.log(transform.mode)
    }, [mode])


    useEffect(() => {
        camera.position.set(0, 5, 5);
        mountRef.current.appendChild(renderer.domElement)
        const { clientWidth, clientHeight } = mountRef.current;
        renderer.setSize(clientWidth, clientHeight)
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        renderer.setClearAlpha(0)
        scene.add(gridHelper);
        

        transform.addEventListener('change', render);
        transform.addEventListener('dragging-changed', function (event) {
            controls.enabled = !event.value;
        });
        scene.add(transform)

        const boxGeometry = new THREE.BoxGeometry(1,1,1);
        const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff,side:THREE.DoubleSide });
        const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
        scene.add(boxMesh)
        targetImage = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            new THREE.MeshBasicMaterial({ color: 0x00ff00,side:THREE.DoubleSide })
        );
        targetImage.position.set(0,0,0)
        targetImage.rotation.set(Math.PI/2,0,0)
        scene.add(targetImage)

        // transform.attach( boxMesh );
        console.log(scene.children);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update()
            render()
        };
        animate()


        window.addEventListener('keydown', keyDown);
        window.addEventListener('keyup', keyUp);
        window.addEventListener('resize', handleResize);
        mountRef.current.addEventListener('mousedown', onMouseDown);
        return () => {
            mountRef.current.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', keyDown);
            window.removeEventListener('keyup', keyUp);
            renderer.dispose()
            mountRef.current.removeChild(renderer.domElement)
            scene.remove(gridHelper)
            scene.remove(boxMesh)
            scene.remove(transform)
            scene.remove(targetImage)

            
        }
    }, [])
    return (
        <div className="editor-main flex items-center jc overflow-hidden relative">
            <div ref={mountRef} className=' h-screen w-9/12 bg-zinc-100'>
            </div>
            <div className="absolute top-4 left-2 bg-zinc-200 rounded-md h-36 w-12 overflow-hidden " style={null===null?{opacity:0,pointerEvents:'none'}:{opacity:1,pointerEvents:'all'}}>
                
                <input type="radio" className='hidden peer/translate' name="mode" id="translate" onClick={() => {
                    transform.setMode('translate')
                    setMode('translate')
                }} value={mode == 'translate' ? true : false} />
                <input type="radio" className='hidden peer/rotate' name="mode" id="rotate" onClick={() => {
                    transform.setMode('rotate')
                    setMode('rotate')
                }} value={mode == 'rotate' ? true : false} />
                <input type="radio" className='hidden peer/scale' name="mode" id="scale" onClick={() => {
                    transform.setMode('scale')
                    setMode('scale')
                }} value={mode == 'scale' ? true : false} />

                <label htmlFor='translate' className="position w-12 h-12 flex justify-center items-center peer-checked/translate:bg-blue-300">
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path d="M1 12.6673L4.18198 15.8492M1 12.6673L4.18198 9.48529M1 12.6673H8.42462M12.6673 24.3345L9.48528 21.1525M12.6673 24.3345L15.8492 21.1525M12.6673 24.3345V16.9099M12.6673 1.00001L9.48528 4.18199M12.6673 1.00001L15.8492 4.18199M12.6673 1.00001V8.42463M24.3345 12.6673L21.1525 15.8492M24.3345 12.6673L21.1525 9.48529M24.3345 12.6673H16.9099" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </label>
                <label htmlFor='rotate' className="rotate w-12 h-12 flex justify-center items-center peer-checked/rotate:bg-blue-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                    </svg>
                </label>
                <label htmlFor='scale' className="scale w-12 h-12 flex justify-center items-center peer-checked/scale:bg-blue-300">
                    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.41724 17.9173L1.41724 13.4173M1.41724 17.9173H5.91724M1.41724 17.9173L8 11.5M17.9172 1.41727L13.4172 1.41727M17.9172 1.41727V5.91727M17.9172 1.41727L11.5 8" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </label>
            </div>

            <div className="line h-screen w-px bg-zinc-300"></div>
            <div className="right w-3/12 h-screen bg-zinc-200 dark:bg-zinc-800">
                <div className="text-2xl m-4 mb-2">Added Items</div>
                <div className="list">
                    {
                        ["Target Image","Box",""].map((data,index)=>(
                            <div className='h-10 w-full p-4 flex items-center justify-start' key={index}>
                                <div className="mx-2 rounded-full h-2 w-2 bg-blue-500"></div>
                                {data}
                            </div>
                        ))
                    }
                </div>

            </div>
        </div>
    )
}

