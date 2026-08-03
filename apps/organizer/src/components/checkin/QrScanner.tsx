// apps/organizer/src/components/checkin/QrScanner.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const REGION_ID = 'tiketin-qr-scanner-region';

export function QrScanner({
    onDecode,
    isPaused,
}: {
    onDecode: (text: string) => void;
    isPaused: boolean;
}) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const onDecodeRef = useRef(onDecode);
    const isPausedRef = useRef(isPaused);

    useEffect(() => {
        onDecodeRef.current = onDecode;
    }, [onDecode]);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    useEffect(() => {
        const scanner = new Html5Qrcode(REGION_ID);
        scannerRef.current = scanner;

        scanner
            .start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 240, height: 240 } },
                (decodedText) => {
                    if (!isPausedRef.current) onDecodeRef.current(decodedText);
                },
                () => { },
            )
            .catch(() => { });

        return () => {
            scanner
                .stop()
                .then(() => scanner.clear())
                .catch(() => { });
        };
    }, []);

    return (
        <div className="rounded-[var(--radius-md)] overflow-hidden bg-black">
            <div id={REGION_ID} className="w-full aspect-square" />
        </div>
    );
}