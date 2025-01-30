// assets/js/main.js

// Navigation handling
document.addEventListener('DOMContentLoaded', () => {
    // Update active navigation state
    const updateActiveNav = () => {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPath = window.location.pathname;
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    // Initialize navigation state
    updateActiveNav();

    // Handle HTMX after-settle event
    document.body.addEventListener('htmx:afterSettle', (event) => {
        updateActiveNav();
        initializeVisualizations();
    });
});

// Visualization management
const visualizations = new Map();

class BaseVisualization {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        // Setup Three.js scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);

        // Add orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        
        // Setup basic scene
        this.setupScene();
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    setupScene() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);

        // Add grid helper
        const gridHelper = new THREE.GridHelper(10, 10);
        this.scene.add(gridHelper);

        // Add axes helper
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);

        // Set camera position
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
    }

    onWindowResize() {
        if (!this.container) return;
        
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        if (!this.container) return;
        
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Function to initialize visualizations on page load
function initializeVisualizations() {
    // Clear existing visualizations
    visualizations.forEach(viz => {
        viz.container?.removeChild(viz.renderer.domElement);
    });
    visualizations.clear();

    // Find all visualization containers and initialize them
    document.querySelectorAll('[data-viz]').forEach(container => {
        const vizType = container.dataset.viz;
        const vizId = container.id;
        
        let visualization;
        switch (vizType) {
            case 'vector-field':
                visualization = new VectorFieldVisualization(vizId);
                break;
            case 'electric-field':
                visualization = new ElectricFieldVisualization(vizId);
                break;
            // Add more visualization types as needed
            default:
                visualization = new BaseVisualization(vizId);
        }
        
        visualizations.set(vizId, visualization);
        visualization.animate();
    });
}

// Initialize MathJax configuration
window.MathJax = {
    tex: {
        inlineMath: [['\\(', '\\)']],
        displayMath: [['\\[', '\\]']],
        packages: ['base', 'ams', 'noerrors', 'noundefined']
    },
    options: {
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process'
    }
};