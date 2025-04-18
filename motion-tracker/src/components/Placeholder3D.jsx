import React from 'react';
import { Box, Sphere } from '@react-three/drei';

export function Placeholder3D({ color = '#3498db' }) {
    return (
        <group>
            <Box args={[1, 1, 1]} position={[0, 0, 0]}>
                <meshStandardMaterial color={color} />
            </Box>
            <Sphere args={[0.5, 32, 32]} position={[0, 1.5, 0]}>
                <meshStandardMaterial color={color} />
            </Sphere>
        </group>
    );
} 