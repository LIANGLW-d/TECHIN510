import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Placeholder3D } from './components/Placeholder3D';

console.log('Application starting...'); // Debug log

gsap.registerPlugin(ScrollTrigger);

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <div style={{ padding: '20px', color: 'red' }}>Something went wrong.</div>;
        }
        return this.props.children;
    }
}

// Color Customization Component
function ColorCustomization({ onColorChange }) {
    const colors = [
        { name: 'Midnight Blue', value: '#2c3e50' },
        { name: 'Ocean Blue', value: '#3498db' },
        { name: 'Crimson Red', value: '#e74c3c' },
        { name: 'Emerald Green', value: '#2ecc71' },
        { name: 'Amethyst Purple', value: '#9b59b6' },
        { name: 'Sunflower Yellow', value: '#f1c40f' }
    ];

    return (
        <div className="color-options">
            {colors.map((color) => (
                <div
                    key={color.value}
                    className="color-option"
                    style={{ backgroundColor: color.value }}
                    onClick={() => onColorChange(color.value)}
                    title={color.name}
                />
            ))}
        </div>
    );
}

// Main App Component
function App() {
    const [selectedColor, setSelectedColor] = useState('#3498db');
    // --- Demo Section State ---
    const [recording, setRecording] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const videoRef = React.useRef(null);

    // --- Sensor Data State ---
    const [sensorData, setSensorData] = useState({});
    const [shakeDetected, setShakeDetected] = useState(false);
    const [lastAccel, setLastAccel] = useState(null);

    // Fetch sensor data and detect shake
    React.useEffect(() => {
        const interval = setInterval(() => {
            fetch('http://localhost:5050/sensor')
                .then(res => res.json())
                .then(data => {
                    setSensorData(data);
                    // Shake detection: compare acceleration magnitude
                    if (data.ax !== undefined && data.ay !== undefined && data.az !== undefined) {
                        const accel = Math.sqrt(data.ax ** 2 + data.ay ** 2 + data.az ** 2);
                        if (lastAccel !== null && Math.abs(accel - lastAccel) > 3) { // threshold for shake
                            setShakeDetected(true);
                            setTimeout(() => setShakeDetected(false), 1000);
                        }
                        setLastAccel(accel);
                    }
                })
                .catch(() => setSensorData({}));
        }, 500);
        return () => clearInterval(interval);
    }, [lastAccel]);

    // Start webcam
    const startRecording = async () => {
        setCameraError(null);
        setRecording(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            await videoRef.current.play();
        } catch (err) {
            setCameraError('Could not access webcam: ' + err.message);
        }
    };

    // Stop webcam
    const stopRecording = () => {
        setRecording(false);
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    React.useEffect(() => {
        console.log('App component mounted'); // Debug log
        try {
            // Initialize scroll animations
            const features = document.querySelectorAll('.feature');
            features.forEach(feature => {
                ScrollTrigger.create({
                    trigger: feature,
                    start: 'top 80%',
                    onEnter: () => feature.classList.add('visible')
                });
            });
        } catch (error) {
            console.error('Error setting up scroll animations:', error);
        }
    }, []);

    return (
        <div className="app" style={{ minHeight: '100vh' }}>
            <section className="hero">
                <div className="hero-content">
                    <h1>Motion Tracker</h1>
                    <p>Revolutionize your training with real-time form analysis</p>
                </div>
            </section>

            <section id="product-3d-view">
                <Canvas camera={{ position: [0, 2, 5] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <Placeholder3D color={selectedColor} />
                    <OrbitControls />
                </Canvas>
            </section>

            <section className="features">
                <div className="feature" data-scroll>
                    <h2>Real-time Form Analysis</h2>
                    <p>Get instant feedback on your exercise form with our advanced motion tracking technology. Our system analyzes your movements in real-time, providing immediate corrections and suggestions to improve your technique.</p>
                    <p>Key features include:</p>
                    <ul>
                        <li>Precise joint angle measurement</li>
                        <li>Real-time form correction</li>
                        <li>Progress tracking over time</li>
                        <li>Customizable feedback settings</li>
                    </ul>
                </div>
                <div className="feature" data-scroll>
                    <h2>Multiple Exercise Support</h2>
                    <p>Perfect your bench press, squat, and deadlift with our comprehensive exercise library. Each exercise comes with detailed form guides and common mistakes to avoid.</p>
                    <p>Supported exercises:</p>
                    <ul>
                        <li>Bench Press - Full range of motion tracking</li>
                        <li>Squat - Depth and form analysis</li>
                        <li>Deadlift - Back position monitoring</li>
                        <li>More exercises coming soon</li>
                    </ul>
                </div>
                <div className="feature" data-scroll>
                    <h2>Smart Tracking</h2>
                    <p>Our advanced ML algorithms provide precise movement analysis, helping you achieve perfect form every time.</p>
                    <p>Technology features:</p>
                    <ul>
                        <li>Machine learning-based form detection</li>
                        <li>Customizable difficulty levels</li>
                        <li>Detailed performance metrics</li>
                        <li>Cloud-based progress tracking</li>
                    </ul>
                </div>
            </section>

            <section className="demo">
                <h2>Try it Yourself</h2>
                <div className="exercise-selector">
                    {!recording ? (
                        <button onClick={startRecording}>Start Recording</button>
                    ) : (
                        <button onClick={stopRecording}>Stop Recording</button>
                    )}
                </div>
                <div id="exercise-canvas" style={{ position: 'relative', width: '100%', maxWidth: 1600, height: 900, marginTop: 24 }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        width={1600}
                        height={900}
                        style={{ borderRadius: 8, background: '#222', width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                    />
                    {cameraError && <p style={{ color: 'red', position: 'absolute', top: 0 }}>{cameraError}</p>}
                    {/* Sensor Data Display */}
                    <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: 16, borderRadius: 8, minWidth: 220 }}>
                        <div><b>Sensor Data</b></div>
                        {sensorData && Object.keys(sensorData).length > 0 ? (
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                <li>ax: {sensorData.ax}</li>
                                <li>ay: {sensorData.ay}</li>
                                <li>az: {sensorData.az}</li>
                                <li>gx: {sensorData.gx}</li>
                                <li>gy: {sensorData.gy}</li>
                                <li>gz: {sensorData.gz}</li>
                                <li>temp: {sensorData.temp}</li>
                            </ul>
                        ) : (
                            <div>No sensor data</div>
                        )}
                        {shakeDetected && <div style={{ color: 'yellow', fontWeight: 'bold', marginTop: 8 }}>Shake detected!</div>}
                    </div>
                </div>
            </section>

            <section className="cmf">
                <h2>Design & Craftsmanship</h2>
                <div className="cmf-content">
                    <div className="color-palette">
                        <h3>Color Options</h3>
                        <ColorCustomization onColorChange={setSelectedColor} />
                        <div className="color-preview">
                            <Canvas camera={{ position: [0, 2, 5] }}>
                                <ambientLight intensity={0.5} />
                                <pointLight position={[10, 10, 10]} />
                                <Placeholder3D color={selectedColor} />
                                <OrbitControls />
                            </Canvas>
                        </div>
                    </div>
                    <div className="materials">
                        <h3>Materials</h3>
                        <p>Premium materials for durability and comfort:</p>
                        <ul>
                            <li>High-grade aluminum alloy frame</li>
                            <li>Soft-touch silicone padding</li>
                            <li>Reinforced polymer components</li>
                            <li>Medical-grade sensors</li>
                        </ul>
                    </div>
                    <div className="finish">
                        <h3>Finish</h3>
                        <p>Professional-grade finish for lasting quality:</p>
                        <ul>
                            <li>Matte powder coating</li>
                            <li>Scratch-resistant surface</li>
                            <li>Water-resistant design</li>
                            <li>Easy-to-clean materials</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Render the app
const rootElement = document.getElementById('root');
if (rootElement) {
    console.log('Root element found, mounting React app...'); // Debug log
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </React.StrictMode>
    );
} else {
    console.error('Root element not found!'); // Debug log
} 