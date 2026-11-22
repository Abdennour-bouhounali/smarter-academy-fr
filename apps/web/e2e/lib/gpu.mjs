// How the walks draw WebGL (the 3D worlds): with the real GPU when the machine has one, by the CPU otherwise.
//
// MEASURED 2026-11-18 on the AMD Radeon 680M (16 cores), the same walk (`gameworld-qawasim-hub`, 199 checks, 0 failures
// both ways): SwiftShader (software) 795 CPU-seconds in 66 s — about twelve cores flat out, which froze the screen of the
// laptop when several walks ran —; the GPU through Vulkan 51.7 CPU-seconds in 40 s. Only the Vulkan option reaches the GPU:
// `--use-angle=gl` and `--use-gl=egl` fall back to SwiftShader silently (WebGL reports « SwiftShader »).
//
//   default      GPU if `/dev/dri/renderD128` exists, else software (a CI machine has no GPU: it stays on software)
//   E2E_GPU=0    force software — the same picture on every machine
//   E2E_GPU=1    force the GPU
//
// A walk's verdict is the same both ways (the check is on the DOM and the layout, never on pixels); screenshots differ
// by anti-aliasing only.
import { existsSync } from 'node:fs';

const SOFTWARE = ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const GPU = ['--no-sandbox', '--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist'];

const wanted = process.env.E2E_GPU;
export const USE_GPU = wanted === '1' || (wanted !== '0' && existsSync('/dev/dri/renderD128'));
/** The Chromium arguments of every walk that draws WebGL. */
export const GL_ARGS = USE_GPU ? GPU : SOFTWARE;
