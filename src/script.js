import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'

/**
 * Loaders
 */
let sceneReady = false
const loadingBarElement = document.querySelector('.loading-bar')
const buttonInspect = document.querySelector('.inspect')
const buttonReturn = document.querySelector('.buttonReturn')
const buttonGame = document.querySelector('.game')
let pointsInspect = []
let pointsMenu = []
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
        // Wait a little
        window.setTimeout(() =>
        {
            // Animate overlay
            gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })

            // Update loadingBarElement
            loadingBarElement.classList.add('ended')
            loadingBarElement.style.transform = ''
        }, 500)
        
        window.setTimeout(() =>
        {
            for(const mesh of scene.children[2].children)
            {
                if(mesh.name === 'buttonA')
                {
                    pointsInspect.push(
                        {
                            position: mesh.position,
                            element: document.querySelector('.pointInspect-0')
                        }
                    )
                }
                if(mesh.name === 'buttonB')
                {   
                    pointsInspect.push(
                        {
                            position: mesh.position,
                            element: document.querySelector('.pointInspect-1')
                        }
                    )
                }
                if(mesh.name === 'controls')
                {
                    pointsInspect.push(
                        {
                            position: mesh.position,
                            element: document.querySelector('.pointInspect-2')
                        }
                    )
                }
                if(mesh.name === 'buttonStart')
                {
                    pointsInspect.push(
                        {
                            position: mesh.position,
                            element: document.querySelector('.pointInspect-3')
                        }
                    )
                    pointsMenu.push(
                        {
                            position: mesh.position,
                            element: document.querySelector('.game')
                        }
                    )
                }
                if(mesh.name === 'buttonSelect')
                {
                    pointsMenu.push(
                        {
                            position: mesh.position,
                            element: document.querySelector('.inspect')
                        }
                    )
                    pointsInspect.push(
                        {
                            position: mesh.position,
                            element: document.querySelector('.pointInspect-7')
                        }
                    )
                }
                if(mesh.name === 'sign')
                {
                    gsap.timeline()
                        .to(mesh.position, {y: 2.0, duration: 2})
                }
            }
            buttonInspect.classList.add('visible')
            // console.log(scene.children[2].children)
            sceneReady = true
        }, 3000)
    },

    // Progress
    (itemUrl, itemsLoaded, itemsTotal) =>
    {
        // Calculate the progress and update the loadingBarElement
        const progressRatio = itemsLoaded / itemsTotal
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
    }
)

// Sound
const music = new Audio('/sounds/mario.mp3')

// Texture loader
const textureLoader = new THREE.TextureLoader(loadingManager)
const gltfLoader = new GLTFLoader(loadingManager)

/**
 * Base
 */
// Debug
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    // wireframe: true,
    transparent: true,
    uniforms:
    {
        uAlpha: { value: 1 }
    },
    vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;

        void main()
        {
            // gl_FragColor = vec4(16.0/255.0, 35.0/255.0, 114.0/255.0, uAlpha);
            gl_FragColor = vec4(21.0/255.0, 29.0/255.0, 71.0/255.0, uAlpha);
        }
    `
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)


/**
 * Textures
 */
const bakedTexture = textureLoader.load('./models/Gameboy/gameboy_baked_texture.jpg')
bakedTexture.flipY = false
bakedTexture.colorSpace = THREE.SRGBColorSpace

/**
 * Materials
 */
// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

/**
 * Model
 */
gltfLoader.load(
    './models/Gameboy/gameboy_animated.glb',
    (gltf) =>
    {
        // Modelin materyalini uygula
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material = bakedMaterial
            }
        })

        // Modeli ortalamak için bounding box hesapla
        const box = new THREE.Box3().setFromObject(gltf.scene)
        const center = new THREE.Vector3()
        box.getCenter(center)
        gltf.scene.position.sub(center) // Modeli merkezde (0,0,0) olacak şekilde taşı

        // Modeli sahneye ekle
        scene.add(gltf.scene)

        // Kamera ayarları: Modelin tamamı görünsün
        // Modelin boyutları: 14.57m x 2.57m (en x boy)
        const size = new THREE.Vector3()
        box.getSize(size)
        // Kamerayı modelin önüne ve biraz yukarıya yerleştir
        const cameraDistance = size.x * 1.2 // Modelin genişliğinin 1.2 katı kadar uzakta
        camera.position.set(0, size.y * 0.5, cameraDistance)
        camera.lookAt(0, 0, 0)
        controls.target.set(0, 0, 0)
        controls.update()
    }
)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})



/**
 * Camera
 */
// Base camera

const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(5, sizes.width / sizes.height, 0.1, 10)
camera.position.set(20, 2, 1)
const initialPosition = new THREE.Vector3(20, 2, 1)
const inspectPosition = new THREE.Vector3(20, 2, 6)
const gamePosition = new THREE.Vector3(10, 2, 1)
const initialPositionGroup = cameraGroup.position.clone()S
cameraGroup.add(camera)


// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.target.y = 4
controls.enablePan = false
controls.minAzimuthAngle = Math.PI * 0.15
controls.maxAzimuthAngle = Math.PI * 0.85
controls.minPolarAngle = Math.PI * 0.20
controls.maxPolarAngle = Math.PI * 0.55
controls.minDistance = 4
controls.maxDistance = 25

/**
 * pointsInspect of interest
 */
const raycaster = new THREE.Raycaster()
const raycasterInspect = new THREE.Raycaster()
const raycasterMenu = new THREE.Raycaster()
const initialRayPosition = new THREE.Vector2(- 1, 1)
raycaster.setFromCamera(initialRayPosition, camera)


pointsInspect.push(
    // Gumba
    {
        position: new THREE.Vector3(0.6, 4.05, - 0.42),
        element: document.querySelector('.pointInspect-4')
    },
    // Mario
    {
        position: new THREE.Vector3(0.45, 4.2, 1.03),
        element: document.querySelector('.pointInspect-5')
    },
    // Sign
    {
        position: new THREE.Vector3(0, 4.8, 0.28),
        element: document.querySelector('.pointInspect-6')
    },
    // Grass
    {
        position: new THREE.Vector3(0.7, 3.7, 0.154),
        element: document.querySelector('.pointInspect-8')
    }
)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
// renderer.setClearColor('#102372')
renderer.setClearColor('#151d47')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Cursor
 */
const cursor = {}
cursor.x = 0
cursor.y = 0
const mouse = new THREE.Vector2()
let mouseAppeared = 0

window.addEventListener('mousemove', (event) =>
{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5

    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height * 2 - 1)

    if (sceneReady)
    {
        mouseAppeared = 1
    }
})

/**
 * Modes
 */
let mode = 'menu'

document.onkeydown = ((evt) => 
{
    evt = evt || window.event
    if (evt.keyCode == 27) {
        buttonReturn.classList.remove('visible')
        mode = 'menu'
        music.pause();
        music.currentTime = 0;

        gsap.timeline()
            .to(camera.position, {x: initialPosition.x, y: initialPosition.y, z: initialPosition.z, duration: 2})
        gsap.timeline()
            .to(cameraGroup.position, {x: initialPositionGroup.x, y: initialPositionGroup.y, z: initialPositionGroup.z, duration: 2})

        // Mario
        gsap.timeline()
            .to(scene.children[2].children[6].position, {x: 0.33, y: 0, z: 1.03, duration: 2})

        // Gumba
        gsap.timeline()
            .to(scene.children[2].children[7].position, {x: 0.46, y: 0, z: - 0.42, duration: 2})

        // Sign
        gsap.timeline()
            .to(scene.children[2].children[8].position, {x: - 0.12, y: 2.0, z: 0.28, duration: 2})
        
        // Grass    
        gsap.timeline()
            .to(scene.children[2].children[9].position, {x: 0.625, y: 0, z: 0.154, duration: 2})


        buttonInspect.classList.add('visible')
    }
    
    if (evt.keyCode == 77) {
        mode = 'game'
        moveGoomba = 'left'
        moveMarioH = 'right'
        moveMarioV = 'up'

        for(const point of pointsInspect)
        {
            point.element.classList.remove('visible')
        }

        music.volume = 0.5
        music.currentTime = 0
        music.play()

        gsap.timeline()
            .to(camera.position, {x: gamePosition.x, y: gamePosition.y, z: gamePosition.z, duration: 2})
        gsap.timeline()
            .to(cameraGroup.position, {x: initialPositionGroup.x, y: initialPositionGroup.y, z: initialPositionGroup.z, duration: 2})

        // Mario
        gsap.timeline()
            .to(scene.children[2].children[6].position, {x: 0.33, y: 2.0, z: 1.03, duration: 2})

        // Gumba
        gsap.timeline()
            .to(scene.children[2].children[7].position, {x: 0.46, y: 2.85, z: - 0.42, duration: 2})

        // Sign
        gsap.timeline()
            .to(scene.children[2].children[8].position, {x: - 0.12, y: 0, z: 0.28, duration: 2})
        
        // Grass    
        gsap.timeline()
            .to(scene.children[2].children[9].position, {x: 0.625, y: 2.3, z: 0.154, duration: 2})

        
        buttonReturn.classList.add('visible')
    }
    if (evt.keyCode == 73) {
        buttonInspect.classList.remove('visible')
        mode = 'inspect'

        music.pause();
        music.currentTime = 0;

        // Camera 
        gsap.timeline()
            .to(camera.position, {x: inspectPosition.x, y: inspectPosition.y, z: inspectPosition.z, duration: 2})
        gsap.timeline()
            .to(cameraGroup.position, {x: initialPositionGroup.x, y: initialPositionGroup.y, z: initialPositionGroup.z, duration: 2})

        // Mario
        gsap.timeline()
            .to(scene.children[2].children[6].position, {x: 0.33, y: 2, z: 1.03, duration: 2})
        gsap.timeline()
            .to(scene.children[2].children[6].rotation, {x: 0, y: 0, z: 0, duration: 2})
        
        // Gumba
        gsap.timeline()
            .to(scene.children[2].children[7].position, {x: 0.46, y: 2.85, z: - 0.42, duration: 2})
        gsap.timeline()
            .to(scene.children[2].children[7].rotation, {x: 0, y: 0, z: 0, duration: 2})

        // Sign
        gsap.timeline()
            .to(scene.children[2].children[8].position, {x: - 0.12, y: 2.5, z: 0.28, duration: 2})
        gsap.timeline()
            .to(scene.children[2].children[8].rotation, {x: 0, y: 0, z: 0, duration: 2})

        // Grass    
        gsap.timeline()
            .to(scene.children[2].children[9].position, {x: 0.625, y: 2.3, z: 0.154, duration: 2})

        buttonReturn.classList.add('visible')
    }
    
})

// Inspect Mode
buttonInspect.addEventListener('click', () =>
{   
    buttonInspect.classList.remove('visible')
    mode = 'inspect'
    music.pause();
    music.currentTime = 0;

    // Camera 
    gsap.timeline()
        .to(camera.position, {x: inspectPosition.x, y: inspectPosition.y, z: inspectPosition.z, duration: 2})
    gsap.timeline()
        .to(cameraGroup.position, {x: initialPositionGroup.x, y: initialPositionGroup.y, z: initialPositionGroup.z, duration: 2})

    // Mario
    gsap.timeline()
        .to(scene.children[2].children[6].position, {x: 0.33, y: 2, z: 1.03, duration: 2})
    gsap.timeline()
        .to(scene.children[2].children[6].rotation, {x: 0, y: 0, z: 0, duration: 2})
    
    // Gumba
    gsap.timeline()
        .to(scene.children[2].children[7].position, {x: 0.46, y: 2.85, z: - 0.42, duration: 2})
    gsap.timeline()
        .to(scene.children[2].children[7].rotation, {x: 0, y: 0, z: 0, duration: 2})

    // Sign
    gsap.timeline()
        .to(scene.children[2].children[8].position, {x: - 0.12, y: 2.5, z: 0.28, duration: 2})
    gsap.timeline()
        .to(scene.children[2].children[8].rotation, {x: 0, y: 0, z: 0, duration: 2})

    // Grass    
    gsap.timeline()
        .to(scene.children[2].children[9].position, {x: 0.625, y: 2.3, z: 0.154, duration: 2})

    buttonReturn.classList.add('visible')
})

buttonReturn.addEventListener('click', () =>
{   
    buttonReturn.classList.remove('visible')
    mode = 'menu'
    music.pause();
    music.currentTime = 0;

    gsap.timeline()
        .to(camera.position, {x: initialPosition.x, y: initialPosition.y, z: initialPosition.z, duration: 2})
    gsap.timeline()
        .to(cameraGroup.position, {x: initialPositionGroup.x, y: initialPositionGroup.y, z: initialPositionGroup.z, duration: 2})

    // Mario
    gsap.timeline()
        .to(scene.children[2].children[6].position, {x: 0.33, y: 0, z: 1.03, duration: 2})

    // Gumba
    gsap.timeline()
        .to(scene.children[2].children[7].position, {x: 0.46, y: 0, z: - 0.42, duration: 2})

    // Sign
    gsap.timeline()
        .to(scene.children[2].children[8].position, {x: - 0.12, y: 2.0, z: 0.28, duration: 2})
    
    // Grass    
    gsap.timeline()
        .to(scene.children[2].children[9].position, {x: 0.625, y: 0, z: 0.154, duration: 2})


    buttonInspect.classList.add('visible')
})

buttonGame.addEventListener('click', () =>
{   
    mode = 'game'

    moveGoomba = 'left'
    moveMarioH = 'right'
    moveMarioV = 'up'

    music.volume = 0.5
    music.currentTime = 0
    music.play()

    gsap.timeline()
        .to(camera.position, {x: gamePosition.x, y: gamePosition.y, z: gamePosition.z, duration: 2})
    gsap.timeline()
        .to(cameraGroup.position, {x: initialPositionGroup.x, y: initialPositionGroup.y, z: initialPositionGroup.z, duration: 2})

    // Mario
    gsap.timeline()
        .to(scene.children[2].children[6].position, {x: 0.33, y: 2.0, z: 1.03, duration: 2})

    // Gumba
    gsap.timeline()
        .to(scene.children[2].children[7].position, {x: 0.46, y: 2.85, z: - 0.42, duration: 2})

    // Sign
    gsap.timeline()
        .to(scene.children[2].children[8].position, {x: - 0.12, y: 0, z: 0.28, duration: 2})
    
    // Grass    
    gsap.timeline()
        .to(scene.children[2].children[9].position, {x: 0.625, y: 2.3, z: 0.154, duration: 2})

    
    buttonReturn.classList.add('visible')
})




/**
 * Game
 */
// Goomba
const initialGoombaRight = new THREE.Vector3(0.46, 2.85, -0.42)
const initialGoombaLeft = new THREE.Vector3(0.46, 2.85, 1.03)
let moveGoomba = 'left'

// Mario
const initialMarioRight = new THREE.Vector3(0.33, 2, -0.42)
const initialMarioLeft = new THREE.Vector3(0.33, 2, 1.03)
let moveMarioH = 'right'
let moveMarioV = 'up'

/**
 * Animate
 */
const clock = new THREE.Clock()
let previuosTime = 0

const tick = () =>
{
    // Update controls
    controls.update()

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previuosTime
    previuosTime = elapsedTime


    // Animate camera
    if(mode === 'menu')
    {   
        for(const point of pointsInspect)
        {
            point.element.classList.remove('visible')
        }
        controls.enableRotate = false
        controls.enablePan = false
        controls.enableZoom = false
        const parallaxX = - cursor.x * 1.5
        const parallaxY = - cursor.y * 1.5
        cameraGroup.position.z += (parallaxX - cameraGroup.position.z) * 5 * deltaTime
        cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime
        if(sceneReady)
        {
            // Go through each point
            for(const point of pointsMenu)
            {
                const screenPosition = point.position.clone()
                screenPosition.project(camera)

                raycasterMenu.setFromCamera(screenPosition, camera)
                const intersects = raycasterMenu.intersectObjects(scene.children[2].children, true)

                if(intersects.length === 0)
                {
                    point.element.classList.add('visible')
                }
                else
                {   
                    const intersectionDistance = intersects[0].distance
                    const pointDistance = point.position.distanceTo(cameraGroup.position)
                    if(intersectionDistance < pointDistance)
                    {
                        point.element.classList.remove('visible')
                    }
                    else
                    {
                        point.element.classList.add('visible')
                    }
                }

                const translateX = screenPosition.x * sizes.width * 0.5
                const translateY = - screenPosition.y * sizes.height * 0.5
                point.element.style.transform = `translate(${translateX}px, ${translateY}px)`
            }
        }
    }

    if(mode === 'inspect')
    {   
        controls.enableRotate = true
        controls.enableZoom = true

        for(const point of pointsMenu)
        {
            point.element.classList.remove('visible')
        }

        if(sceneReady)
        {
            // Go through each point
            for(const point of pointsInspect)
            {
                const screenPosition = point.position.clone()
                screenPosition.project(camera)

                raycasterInspect.setFromCamera(screenPosition, camera)
                const intersects = raycasterInspect.intersectObjects(scene.children[2].children, true)

                if(intersects.length === 0)
                {
                    point.element.classList.add('visible')
                }
                else
                {   
                    const intersectionDistance = intersects[0].distance
                    const pointDistance = point.position.distanceTo(cameraGroup.position)
                    if(intersectionDistance < pointDistance)
                    {
                        point.element.classList.remove('visible')
                    }
                    else
                    {
                        point.element.classList.add('visible')
                    }
                }

                const translateX = screenPosition.x * sizes.width * 0.5
                const translateY = - screenPosition.y * sizes.height * 0.5
                point.element.style.transform = `translate(${translateX}px, ${translateY}px)`
            }
        }
    }

    if(mode === 'game')
    {   
        const parallaxX = - cursor.x * 1.5
        const parallaxY = - cursor.y * 1.5
        cameraGroup.position.z += (parallaxX - cameraGroup.position.z) * 5 * deltaTime
        cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime
        for(const point of pointsMenu)
        {
            point.element.classList.remove('visible')
        }
        controls.enableRotate = false
        controls.enablePan = false
        controls.enableZoom = false

        if(moveGoomba === 'left')
        {
            scene.children[2].children[7].position.z += 0.002
            if(scene.children[2].children[7].position.z > initialGoombaLeft.z)
            {   
                moveGoomba = 'right' 
            } 
        }
        if(moveGoomba === 'right')
        {
            scene.children[2].children[7].position.z -= 0.002
            if(scene.children[2].children[7].position.z < initialGoombaRight.z)
            {   
                moveGoomba = 'left' 
            } 
        }

        if(moveMarioH === 'left')
        {
            scene.children[2].children[6].position.z += 0.002
            if(scene.children[2].children[6].position.z > 0.305)
            {   
                moveMarioV = 'down' 
            }
            if(scene.children[2].children[6].position.z > initialMarioLeft.z)
            {   
                moveMarioH = 'right'
                moveMarioV = 'up'  
            } 
        }
        if(moveMarioH === 'right')
        {
            scene.children[2].children[6].position.z -= 0.002
            if(scene.children[2].children[6].position.z < 0.305)
            {   
                moveMarioV = 'down' 
            } 
            if(scene.children[2].children[6].position.z < initialMarioRight.z)
            {   
                moveMarioH = 'left'
                moveMarioV = 'up'  
            } 
        }

        if(moveMarioV === 'up')
        {
            scene.children[2].children[6].position.y += 0.002
        }
        if(moveMarioV === 'down')
        {
            scene.children[2].children[6].position.y -= 0.002
        }
        
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()