// 统一场论可视化系统 - JavaScript逻辑
class UnifiedFieldVisualization {
    constructor() {
        this.init();
        this.animate();
    }

    init() {
        // 初始化Three.js场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0c0c1d);
        
        // 初始化相机
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        
        // 初始化渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);
        
        // 初始化参数
        this.params = {
            directionCount: 14,
            omega: 1.5,
            velocity: 1.0,
            radius: 0.8,
            mass: 1.0,
            showVectors: true,
            showTrails: true,
            animationSpeed: 1.0,
            colorScheme: 'aurora'
        };
        
        // 初始化控件
        this.initControls();
        this.initParticles();
        this.initLights();
        this.initOrbitControls();
        
        // 事件监听
        window.addEventListener('resize', () => this.onWindowResize());
        
        // 性能监控
        this.stats = {
            startTime: Date.now(),
            frameCount: 0,
            fps: 60
        };
    }

    initControls() {
        // 绑定滑块事件
        const sliders = ['directions', 'omega', 'velocity', 'radius', 'mass', 'animSpeed'];
        sliders.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', (e) => this.onParameterChange(id, parseFloat(e.target.value)));
            }
        });
        
        // 初始化滑块值
        this.updateSliderValues();
    }

    initParticles() {
        this.particles = new THREE.Group();
        this.vectors = new THREE.Group();
        this.trails = new THREE.Group();
        
        this.scene.add(this.particles);
        this.scene.add(this.vectors);
        this.scene.add(this.trails);
        
        this.createParticles();
    }

    createParticles() {
        // 清除现有粒子
        while(this.particles.children.length > 0) { 
            this.particles.remove(this.particles.children[0]); 
        }
        while(this.vectors.children.length > 0) { 
            this.vectors.remove(this.vectors.children[0]); 
        }
        while(this.trails.children.length > 0) { 
            this.trails.remove(this.trails.children[0]); 
        }

        const colors = this.getColorScheme();
        
        // 创建新粒子
        for (let i = 0; i < this.params.directionCount; i++) {
            const angle = (i / this.params.directionCount) * Math.PI * 2;
            
            // 创建粒子
            const particleGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const particleMaterial = new THREE.MeshPhongMaterial({ 
                color: colors.particle,
                emissive: colors.particleEmissive
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // 设置初始位置
            const x = this.params.radius * Math.cos(angle);
            const y = this.params.radius * Math.sin(angle);
            particle.position.set(x, y, 0);
            particle.userData = { 
                initialAngle: angle,
                phase: Math.random() * Math.PI * 2
            };
            
            this.particles.add(particle);
            
            // 创建矢量箭头
            if (this.params.showVectors) {
                this.createVectorArrow(particle, colors.vector);
            }
            
            // 创建轨迹
            if (this.params.showTrails) {
                this.createTrail(particle, colors.trail);
            }
        }
    }

    createVectorArrow(particle, color) {
        const direction = new THREE.Vector3().copy(particle.position).normalize();
        const arrowHelper = new THREE.ArrowHelper(
            direction,
            particle.position,
            1.5,
            color,
            0.3,
            0.2
        );
        arrowHelper.userData = { parentParticle: particle };
        this.vectors.add(arrowHelper);
    }

    createTrail(particle, color) {
        const trailGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(300 * 3); // 100 points * 3 coordinates
        trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const trailMaterial = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6
        });
        
        const trail = new THREE.Line(trailGeometry, trailMaterial);
        trail.userData = {
            parentParticle: particle,
            positionIndex: 0,
            positions: positions
        };
        
        this.trails.add(trail);
    }

    initLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // 定向光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        // 点光源
        const pointLight = new THREE.PointLight(0x4fc3f7, 1, 100);
        pointLight.position.set(0, 0, 5);
        this.scene.add(pointLight);
    }

    initOrbitControls() {
        // 简单的鼠标控制
        let isMouseDown = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        this.renderer.domElement.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            this.camera.position.x += deltaX * 0.01;
            this.camera.position.y -= deltaY * 0.01;
            
            this.camera.lookAt(this.scene.position);
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        // 鼠标滚轮缩放
        this.renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camera.position.z += e.deltaY * 0.01;
            this.camera.position.z = Math.max(2, Math.min(20, this.camera.position.z));
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = 0.016 * this.params.animationSpeed;
        this.updateParticles(deltaTime);
        this.updateVectors();
        this.updateTrails();
        this.updateStats();
        
        this.renderer.render(this.scene, this.camera);
    }

    updateParticles(deltaTime) {
        const time = Date.now() * 0.001;
        
        this.particles.children.forEach((particle, index) => {
            const angle = particle.userData.initialAngle;
            const phase = particle.userData.phase;
            
            // 螺旋运动方程
            const x = this.params.radius * Math.cos(angle + this.params.omega * time + phase);
            const y = this.params.radius * Math.sin(angle + this.params.omega * time + phase);
            const z = this.params.velocity * time;
            
            particle.position.set(x, y, z);
            
            // 粒子大小随质量变化
            particle.scale.setScalar(0.1 + this.params.mass * 0.05);
        });
    }

    updateVectors() {
        if (!this.params.showVectors) return;
        
        this.vectors.children.forEach(arrow => {
            const particle = arrow.userData.parentParticle;
            const direction = new THREE.Vector3().copy(particle.position).normalize();
            
            arrow.setDirection(direction);
            arrow.position.copy(particle.position);
            
            // 矢量长度随速度变化
            arrow.setLength(1.0 + this.params.velocity * 0.5, 0.3, 0.2);
        });
    }

    updateTrails() {
        if (!this.params.showTrails) return;
        
        this.trails.children.forEach(trail => {
            const particle = trail.userData.parentParticle;
            const positions = trail.userData.positions;
            let positionIndex = trail.userData.positionIndex;
            
            // 更新轨迹点
            positions[positionIndex * 3] = particle.position.x;
            positions[positionIndex * 3 + 1] = particle.position.y;
            positions[positionIndex * 3 + 2] = particle.position.z;
            
            positionIndex = (positionIndex + 1) % 100;
            trail.userData.positionIndex = positionIndex;
            
            // 更新几何体
            trail.geometry.attributes.position.needsUpdate = true;
        });
    }

    updateStats() {
        // 更新FPS
        this.stats.frameCount++;
        const now = Date.now();
        if (now - this.stats.startTime >= 1000) {
            this.stats.fps = Math.round((this.stats.frameCount * 1000) / (now - this.stats.startTime));
            this.stats.frameCount = 0;
            this.stats.startTime = now;
            
            document.getElementById('fpsCounter').textContent = this.stats.fps;
        }
        
        // 更新其他统计信息
        const simTime = (Date.now() * 0.001).toFixed(2);
        document.getElementById('timeValue').textContent = simTime + 's';
        document.getElementById('particleCount').textContent = this.params.directionCount;
        
        const fieldStrength = (this.params.omega * this.params.velocity * this.params.mass).toFixed(2);
        document.getElementById('fieldStrength').textContent = fieldStrength;
        
        const curvature = (this.params.omega / this.params.radius).toFixed(2);
        document.getElementById('curvature').textContent = curvature;
    }

    onParameterChange(param, value) {
        this.params[param] = value;
        this.updateSliderValues();
        
        if (param === 'directions') {
            this.params.directionCount = value;
            this.createParticles();
        }
    }

    updateSliderValues() {
        // 更新显示值
        document.getElementById('directionCount').textContent = this.params.directionCount;
        document.getElementById('omegaValue').textContent = this.params.omega.toFixed(1);
        document.getElementById('velocityValue').textContent = this.params.velocity.toFixed(1);
        document.getElementById('radiusValue').textContent = this.params.radius.toFixed(1);
        document.getElementById('massValue').textContent = this.params.mass.toFixed(1);
        document.getElementById('speedValue').textContent = this.params.animationSpeed.toFixed(1) + 'x';
        
        // 更新进度条
        const progressBars = {
            directionProgress: (this.params.directionCount - 8) / 18 * 100,
            omegaProgress: (this.params.omega - 0.2) / 3.8 * 100,
            velocityProgress: (this.params.velocity - 0.3) / 2.2 * 100,
            radiusProgress: (this.params.radius - 0.2) / 1.8 * 100,
            massProgress: (this.params.mass - 0.5) / 2.5 * 100
        };
        
        Object.entries(progressBars).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.style.width = value + '%';
            }
        });
    }

    getColorScheme() {
        const schemes = {
            aurora: {
                particle: 0x4fc3f7,
                particleEmissive: 0x00b0ff,
                vector: 0xff6b6b,
                trail: 0xbb86fc
            },
            nebula: {
                particle: 0xff6b6b,
                particleEmissive: 0xff5252,
                vector: 0x4fc3f7,
                trail: 0xffd54f
            },
            plasma: {
                particle: 0xbb86fc,
                particleEmissive: 0x9c27b0,
                vector: 0xffd54f,
                trail: 0x4fc3f7
            }
        };
        
        return schemes[this.params.colorScheme] || schemes.aurora;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// 全局函数供HTML按钮调用
function resetSimulation() {
    if (window.visualization) {
        window.visualization.params = {
            directionCount: 14,
            omega: 1.5,
            velocity: 1.0,
            radius: 0.8,
            mass: 1.0,
            showVectors: true,
            showTrails: true,
            animationSpeed: 1.0,
            colorScheme: 'aurora'
        };
        window.visualization.updateSliderValues();
        window.visualization.createParticles();
    }
}

function toggleAnimation() {
    const btn = document.getElementById('pauseBtn');
    if (window.visualization) {
        window.visualization.params.animationSpeed = window.visualization.params.animationSpeed === 0 ? 1.0 : 0;
        btn.textContent = window.visualization.params.animationSpeed === 0 ? '▶️ 继续' : '⏸️ 暂停';
    }
}

function toggleVectors() {
    const btn = document.getElementById('vectorBtn');
    if (window.visualization) {
        window.visualization.params.showVectors = !window.visualization.params.showVectors;
        btn.textContent = window.visualization.params.showVectors ? '📐 隐藏矢量' : '📐 显示矢量';
        if (window.visualization.params.showVectors) {
            window.visualization.createParticles();
        } else {
            while(window.visualization.vectors.children.length > 0) { 
                window.visualization.vectors.remove(window.visualization.vectors.children[0]); 
            }
        }
    }
}

function toggleTrails() {
    const btn = document.getElementById('trailBtn');
    if (window.visualization) {
        window.visualization.params.showTrails = !window.visualization.params.showTrails;
        btn.textContent = window.visualization.params.showTrails ? '✨ 隐藏轨迹' : '✨ 显示轨迹';
        if (window.visualization.params.showTrails) {
            window.visualization.createParticles();
        } else {
            while(window.visualization.trails.children.length > 0) { 
                window.visualization.trails.remove(window.visualization.trails.children[0]); 
            }
        }
    }
}

function toggleCameraMode() {
    alert('相机模式切换功能待实现');
}

function captureFrame() {
    if (window.visualization) {
        const link = document.createElement('a');
        link.download = 'unified-field-screenshot.png';
        link.href = window.visualization.renderer.domElement.toDataURL();
        link.click();
    }
}

function changeColorScheme(scheme) {
    if (window.visualization) {
        window.visualization.params.colorScheme = scheme;
        window.visualization.createParticles();
    }
}

function loadPreset(preset) {
    const presets = {
        default: { directionCount: 14, omega: 1.5, velocity: 1.0, radius: 0.8, mass: 1.0 },
        intense: { directionCount: 20, omega: 2.5, velocity: 1.8, radius: 1.2, mass: 2.0 },
        gentle: { directionCount: 10, omega: 0.8, velocity: 0.6, radius: 0.4, mass: 0.7 },
        spiral: { directionCount: 16, omega: 3.0, velocity: 1.2, radius: 1.5, mass: 1.5 }
    };
    
    if (window.visualization && presets[preset]) {
        Object.assign(window.visualization.params, presets[preset]);
        window.visualization.updateSliderValues();
        window.visualization.createParticles();
        
        // 更新滑块值
        document.getElementById('directions').value = window.visualization.params.directionCount;
        document.getElementById('omega').value = window.visualization.params.omega;
        document.getElementById('velocity').value = window.visualization.params.velocity;
        document.getElementById('radius').value = window.visualization.params.radius;
        document.getElementById('mass').value = window.visualization.params.mass;
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    window.visualization = new UnifiedFieldVisualization();
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('可视化系统错误:', e.error);
    alert('可视化系统初始化失败，请检查浏览器控制台获取详细信息');
});