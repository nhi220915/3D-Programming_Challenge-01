# 3D Racing Game Prototype - Challenge 1

## 🛠️ 1. Setup and Running

This project uses JavaScript module files (`type="module"`), and therefore **must be run through a Local Web Server**.

### Requirements

  * A modern web browser (Chrome, Firefox).
  * Node.js or Python installed.

### How to Run

1.  **Open the Terminal** (or CMD/PowerShell) in the project root directory (`Racing Game/`).
2.  Run one of the following commands to start the server:
      * **Using Python:**
        ```bash
        python -m http.server
        ```
      * **Using Node.js (requires `http-server` to be installed first):**
        ```bash
        npx http-server
        ```
3.  Open your browser and navigate to the address: **`http://localhost:8081/`** (or the port displayed in the Terminal).

-----

## 2\. Control Instructions

The project uses standard keys (WASD or Arrow Keys).

| Action | WASD Key | Arrow Key |
| :--- | :--- | :--- |
| **Accelerate** | `W` | `Arrow Up` |
| **Brake/Reverse** | `S` | `Arrow Down` |
| **Turn Left** | `A` | `Arrow Left` |
| **Turn Right** | `D` | `Arrow Right` |

-----

## 3\. Technical Implementation (Meeting Requirements)

The project is implemented using ES Module architecture (`.js` files in the `src/` folder) to separate functional classes:

### R1 – 3D Environment and Physics (40%)

  * **Scene:** Uses `THREE.Scene` with `AmbientLight` and `DirectionalLight`.
  * **Physics:** Initializes `CANNON.World` with gravity **$9.82 \text{ m/s}^2$** and uses `CANNON.SAPBroadphase` for collision optimization.
  * **Track:** A closed rectangular race track (100x100 units). The boundary walls are created using `CANNON.Box` with `mass: 0`.
  * **Materials:** Set up `CANNON.ContactMaterial` with a **friction coefficient of $0.8$** between the car and the ground to ensure grip.

### R2 – Car Control and Interaction (30%)

  * **Car Model:** The car is modeled using `THREE.BoxGeometry` and `CANNON.Box` (Mass: 100kg).
  * **Control:** **Local Force (`applyLocalForce`)** is applied for acceleration/deceleration and **Local Torque (`applyLocalTorque`)** for steering, ensuring the car moves in its current rotation direction.
  * **Synchronization:** The position and rotation (`position` and `quaternion`) of the 3D Mesh are continuously synchronized from the physics Body in every frame.
  * **Camera:** The camera follows the car using the **LERP (Linear Interpolation)** technique to create a smooth tracking effect.

### R3 – Game Logic and Visual Feedback (30%)

  * **Lap Counting:** Implements **2 Checkpoint Logic** in `Game.js`. A lap is only counted when the car crosses the Finish Line (Z=0) **after** having passed the Mid-track Checkpoint (Z \< -30).
  * **HUD:** Displays **Speed** (Km/h), **Lap Count** (Current Lap/Total Laps), and **Timer** in real-time.
  * **Collision Detection:** Catches collision events between the car and static objects (`mass: 0`) and displays a **"CRASH\!"** notification if the collision force exceeds a safe threshold.

-----

## 4\. Libraries and Assets

  * **Rendering:** THREE.js
  * **Physics:** CANNON-ES
  * **Assets:** Textures: `assets/textures/track_texture.jpg`, `grass_texture.jpg`
