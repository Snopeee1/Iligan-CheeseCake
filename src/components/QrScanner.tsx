"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Icon } from "./Icon";

type Detector = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> };
type DetectorCtor = new (o: { formats: string[] }) => Detector;

/** Decode one frame/image with the native BarcodeDetector when present, else jsQR. */
async function decode(source: CanvasImageSource, w: number, h: number, canvas: HTMLCanvasElement, native: Detector | null): Promise<string | null> {
  if (native) {
    try {
      const r = await native.detect(source);
      if (r[0]?.rawValue) return r[0].rawValue;
    } catch {
      /* fall through to jsQR */
    }
  }
  const scale = Math.min(1, 720 / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, cw, ch);
  const img = ctx.getImageData(0, 0, cw, ch);
  const res = jsQR(img.data, cw, ch, { inversionAttempts: "attemptBoth" });
  return res?.data || null;
}

function feedback() {
  try {
    navigator.vibrate?.(80);
  } catch {}
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ac = new AC();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    o.frequency.value = 1046;
    g.gain.setValueAtTime(0.0001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ac.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.18);
    o.connect(g).connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + 0.2);
    setTimeout(() => ac.close(), 400);
  } catch {}
}

function cameraError(e: unknown) {
  const name = (e as { name?: string })?.name;
  if (!window.isSecureContext) return "The camera only works on a secure (https) address.";
  if (name === "NotAllowedError" || name === "SecurityError") return "Camera permission is blocked. Allow the camera for this site in your browser settings, then try again — or type the card number.";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "No camera found on this device. Type the card number, or scan from a photo.";
  if (name === "NotReadableError") return "The camera is busy in another app. Close it and try again.";
  return "Couldn’t start the camera. Type the card number, or scan from a photo.";
}

export function QrScanner({ onResult }: { onResult: (text: string) => void }) {
  const [on, setOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [camIdx, setCamIdx] = useState(0);
  const [torch, setTorch] = useState<{ supported: boolean; on: boolean }>({ supported: false, on: false });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const camsRef = useRef<MediaDeviceInfo[]>([]);
  const resultRef = useRef(onResult);
  useEffect(() => {
    resultRef.current = onResult;
  }, [onResult]);

  const native = useCallback((): Detector | null => {
    const BD = (window as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector;
    try {
      return BD ? new BD({ formats: ["qr_code"] }) : null;
    } catch {
      return null;
    }
  }, []);

  const found = useCallback((text: string) => {
    feedback();
    setOn(false);
    setStatus("");
    resultRef.current(text.trim());
  }, []);

  // camera lifecycle
  useEffect(() => {
    if (!on) return;
    let stopped = false;
    let raf = 0;
    let last = 0;
    let busy = false;
    const canvas = (canvasRef.current ??= document.createElement("canvas"));
    const det = native();
    const vEl = videoRef.current;

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(cameraError({ name: window.isSecureContext ? "NotFoundError" : "SecurityError" }));
        setOn(false);
        return;
      }
      setStatus("Starting camera…");
      const deviceId = camsRef.current[camIdx]?.deviceId;
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: deviceId ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } } : { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      } catch (e) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch {
          if (!stopped) {
            setError(cameraError(e));
            setOn(false);
            setStatus("");
          }
          return;
        }
      }
      if (stopped) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      const caps = (track.getCapabilities?.() ?? {}) as { torch?: boolean };
      setTorch({ supported: !!caps.torch, on: false });
      // list cameras (labels are available after permission)
      navigator.mediaDevices
        .enumerateDevices()
        .then((d) => {
          if (stopped) return;
          const list = d.filter((x) => x.kind === "videoinput");
          camsRef.current = list;
          setCams(list);
        })
        .catch(() => {});
      const v = vEl;
      if (!v) return;
      v.srcObject = stream;
      v.setAttribute("playsinline", "true");
      await v.play().catch(() => {});
      setStatus("Point the camera at the member’s QR");

      const tick = async (t: number) => {
        if (stopped) return;
        raf = requestAnimationFrame(tick);
        if (busy || t - last < 120 || v.readyState < 2 || !v.videoWidth) return;
        last = t;
        busy = true;
        try {
          const text = await decode(v, v.videoWidth, v.videoHeight, canvas, det);
          if (text && !stopped) found(text);
        } finally {
          busy = false;
        }
      };
      raf = requestAnimationFrame(tick);
    };
    start();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (vEl) vEl.srcObject = null;
    };
  }, [on, camIdx, native, found]);

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torch.on } as MediaTrackConstraintSet] });
      setTorch((x) => ({ ...x, on: !x.on }));
    } catch {
      setTorch({ supported: false, on: false });
    }
  };

  const fromFile = async (file: File) => {
    setError(null);
    setStatus("Reading photo…");
    try {
      const bmp = await createImageBitmap(file);
      const text = await decode(bmp, bmp.width, bmp.height, (canvasRef.current ??= document.createElement("canvas")), native());
      if (text) found(text);
      else {
        setStatus("");
        setError("No QR code found in that photo. Try again closer, with the whole code in view.");
      }
    } catch {
      setStatus("");
      setError("Couldn’t read that image.");
    }
  };

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          className={`btn ${on ? "btn-white" : "btn-dark"}`}
          onClick={() => {
            setError(null);
            setOn((x) => !x);
          }}
        >
          <Icon name={on ? "x" : "scan"} /> {on ? "Stop camera" : "Scan member QR"}
        </button>
        <button type="button" className="btn btn-white !px-4" onClick={() => fileRef.current?.click()} aria-label="Scan a QR from a photo" title="Scan from a photo">
          <Icon name="download" className="rotate-180" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) fromFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {on ? (
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black">
          <video ref={videoRef} className="absolute inset-0 size-full object-cover" muted playsInline autoPlay />
          {/* scan frame */}
          <div className="pointer-events-none absolute inset-[14%]">
            {["top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl", "top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl"].map((c) => (
              <span key={c} className={`absolute size-10 border-gold ${c}`} />
            ))}
            <span className="scanline absolute inset-x-2 h-0.5 rounded-full bg-gold-light shadow-[0_0_12px_2px_rgba(230,201,135,.8)]" />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent p-3 text-xs text-cream">
            <span>{status}</span>
            <span className="flex gap-2">
              {cams.length > 1 ? (
                <button type="button" onClick={() => setCamIdx((i) => (i + 1) % cams.length)} className="rounded-full bg-white/15 px-3 py-1.5 font-semibold backdrop-blur hover:bg-white/25">
                  Switch camera
                </button>
              ) : null}
              {torch.supported ? (
                <button type="button" onClick={toggleTorch} className={`rounded-full px-3 py-1.5 font-semibold backdrop-blur ${torch.on ? "bg-gold text-espresso" : "bg-white/15 hover:bg-white/25"}`}>
                  Light {torch.on ? "on" : "off"}
                </button>
              ) : null}
            </span>
          </div>
        </div>
      ) : status ? (
        <p className="text-xs text-muted">{status}</p>
      ) : null}

      {error ? <p className="bad-msg">{error}</p> : null}
      <p className="text-xs text-muted">Works with the phone or laptop camera. You can also scan from a photo of the QR, or type the card number above.</p>
    </div>
  );
}
