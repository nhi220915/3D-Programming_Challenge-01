// src/Game.js
import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';
import * as CANNON from 'https://unpkg.com/cannon-es@0.20.0/dist/cannon-es.js';
import { GAME_LOGIC } from './Constants.js';
import InputController from './InputController.js';
import UI from './UI.js';
import TrackBuilder from './TrackBuilder.js';
import Vehicle from './Vehicle.js';
import SettingsMenu from './SettingsMenu.js';

export default class Game {
    constructor() {
        // Core components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null; // Physics world
        this.clock = new THREE.Clock();

        // Game entities
        this.vehicle = null;
        this.trackBuilder = null;
        this.input = new InputController();
        this.ui = new UI();
        this.settingsMenu = null;

        // Game logic
        this.gameLogic = {
            startTime: Date.now(),
            lap: 0,
            checkpoint: false,
            gameFinished: false,
            totalLaps: GAME_LOGIC.TOTAL_LAPS
        };
        this.checkpointBodies = {};
    }

    // Hàm khởi tạo chính
    init() {
        this.initThree();
        this.initCannon();

        // Tạo thế giới (đèn, đường đua, tường)
        this.trackBuilder = new TrackBuilder(this.scene, this.world);
        // Lấy về các trigger của checkpoint
        this.checkpointBodies = this.trackBuilder.init(); 

        // Tạo xe - đặt ở cạnh dưới, nằm dọc với đường đua (hướng lên trên)
        // Xe bắt đầu ở cạnh dưới, hướng lên trên (về phía z âm)
        const outerSize = 100;
        const trackWidth = 8;
        // Đặt xe ở cạnh dưới, cách mép một khoảng
        this.vehicle = new Vehicle(this.scene, this.world, new CANNON.Vec3(0, 4, outerSize / 2 - trackWidth / 2 - 5));

        // Khởi tạo menu cài đặt
        this.settingsMenu = new SettingsMenu(this);

        this.initGameLogicListeners();
        this.initResizeListener();
        this.startGameLoop();
    }

    // R1: Thiết lập Scene, Camera, Renderer
    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, -15);

        const canvas = document.getElementById('gameCanvas');
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
    }

    // R1: Thiết lập Physics World
    initCannon() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        this.world.allowSleep = true;
    }

    // R3: Thiết lập các sự kiện va chạm
    initGameLogicListeners() {
        // Biến để tránh trigger nhiều lần trong cùng một lần đi qua
        let lastCheckpointTime = 0;
        let lastFinishLineTime = 0;
        const triggerCooldown = 500; // 500ms cooldown giữa các lần trigger

        this.vehicle.chassisBody.addEventListener('collide', (e) => {
            if (this.gameLogic.gameFinished) return;
            const currentTime = Date.now();

            // Va chạm với Checkpoint giữa
            if (e.body === this.checkpointBodies.midCheckpoint) {
                if (currentTime - lastCheckpointTime > triggerCooldown) {
                    this.gameLogic.checkpoint = true;
                    this.ui.showMessage("Checkpoint!");
                    lastCheckpointTime = currentTime;
                }
            }
            
            // Va chạm với Vạch Đích - đi ngang qua sẽ tính là 1 vòng
            if (e.body === this.checkpointBodies.finishLine) {
                if (currentTime - lastFinishLineTime > triggerCooldown) {
                    if (this.gameLogic.checkpoint) {
                        this.gameLogic.lap++;
                        this.gameLogic.checkpoint = false; // Reset checkpoint
                        this.ui.showMessage(`Vòng ${this.gameLogic.lap} / ${this.gameLogic.totalLaps}`, 2000, "rgba(0, 255, 100, 0.75)");
                        
                        if (this.gameLogic.lap >= this.gameLogic.totalLaps) {
                            this.gameLogic.gameFinished = true;
                            this.ui.showMessage(`Hoàn thành!`, 5000, "rgba(255, 215, 0, 0.8)");
                        }
                    } else {
                        // Nếu chưa qua checkpoint, chỉ hiển thị thông báo
                        this.ui.showMessage("Cần qua checkpoint trước!", 1500, "rgba(255, 100, 0, 0.75)");
                    }
                    lastFinishLineTime = currentTime;
                }
            }
        });
    }

    // Bắt đầu vòng lặp game (animate)
    startGameLoop() {
        // Sử dụng setAnimationLoop để có vòng lặp tối ưu
        this.renderer.setAnimationLoop(() => this.animate());
    }

    // Vòng lặp game chính
    animate() {
        const deltaTime = this.clock.getDelta();
        
        // Cập nhật vật lý
        this.world.step(1 / 60, deltaTime);

        // Xử lý điều khiển
        const controls = this.input.getControls();

        if (!this.gameLogic.gameFinished) {
            this.vehicle.applyControls(controls);
        } else {
            // Dừng xe nếu game kết thúc
            this.vehicle.applyControls({ forward: false, backward: false, left: false, right: false });
        }

        // Đồng bộ hóa đồ họa
        this.vehicle.syncGraphics();

        // R2: Camera bám theo xe (mượt mà)
        this.updateCamera();

        // R3: Cập nhật HUD
        this.updateHUD();

        // Render cảnh
        this.renderer.render(this.scene, this.camera);
    }

    // R2: Camera bám theo xe
    updateCamera() {
        const vehiclePosition = this.vehicle.getPosition();
        const vehicleQuaternion = this.vehicle.getQuaternion();
        
        const cameraMode = this.settingsMenu 
            ? this.settingsMenu.settings.cameraMode 
            : 'follow';
        
        if (cameraMode === 'thirdPerson') {
            // Góc nhìn thứ 3 - camera ở phía sau và trên xe, nhìn xuống
            const offset = this.settingsMenu 
                ? new THREE.Vector3(
                    this.settingsMenu.settings.cameraOffsetX,
                    this.settingsMenu.settings.cameraOffsetY + 8, // Cao hơn một chút
                    this.settingsMenu.settings.cameraOffsetZ + 15 // Xa hơn một chút
                )
                : new THREE.Vector3(0, 13, 25);
            
            offset.applyQuaternion(vehicleQuaternion);
            const targetPosition = vehiclePosition.clone().add(offset);
            
            const lerpValue = this.settingsMenu 
                ? this.settingsMenu.settings.cameraLerp 
                : 0.1;
            this.camera.position.lerp(targetPosition, lerpValue);
            
            // Nhìn về phía trước xe (một chút phía trước vị trí xe)
            const lookAhead = new THREE.Vector3(0, 0, -5);
            lookAhead.applyQuaternion(vehicleQuaternion);
            this.camera.lookAt(vehiclePosition.clone().add(lookAhead));
        } else {
            // Chế độ theo dõi mặc định
            const offset = this.settingsMenu 
                ? new THREE.Vector3(
                    this.settingsMenu.settings.cameraOffsetX,
                    this.settingsMenu.settings.cameraOffsetY,
                    this.settingsMenu.settings.cameraOffsetZ
                )
                : new THREE.Vector3(0, 5, 10);
            
            offset.applyQuaternion(vehicleQuaternion);
            const targetPosition = vehiclePosition.clone().add(offset);

            const lerpValue = this.settingsMenu 
                ? this.settingsMenu.settings.cameraLerp 
                : 0.1;
            this.camera.position.lerp(targetPosition, lerpValue);
            this.camera.lookAt(vehiclePosition);
        }
    }

    // R3: Cập nhật HUD
    updateHUD() {
        // Cập nhật tốc độ
        const speed = this.vehicle.getVelocity();
        this.ui.updateSpeed(speed);

        // Cập nhật vòng đua
        this.ui.updateLap(this.gameLogic.lap, this.gameLogic.totalLaps);

        // Cập nhật thời gian
        if (!this.gameLogic.gameFinished) {
            const elapsedTime = (Date.now() - this.gameLogic.startTime) / 1000;
            this.ui.updateTimer(elapsedTime);
        }
    }

    // Xử lý thay đổi kích thước cửa sổ
    initResizeListener() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
}