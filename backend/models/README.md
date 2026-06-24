# NeoFace — AI Model Assets

Place ONNX model files in this directory. They are **excluded from git** (`.gitignore` blocks `*.onnx`, `*.pt`, `*.pth`, `*.bin`).

> **Status:** All 8 models are downloaded and verified working (June 2026).

---

## Quick Start

```bash
cd backend/

# See which models are present / missing
python scripts/download_models.py --status

# Download all 8 models (takes ~5 min, ~800 MB total)
python scripts/download_models.py --all

# Download a specific model
python scripts/download_models.py --model anti_spoof
```

---

## Model Inventory

All 8 models are used by NeoFace Trust Engine services.  
**Every service has a graceful heuristic fallback** — the app runs without any ONNX file, though with reduced accuracy.

| File | Service | Actual Size | Architecture | Required |
|---|---|---|---|---|
| `anti_spoof.onnx` | Anti-Spoofing | 1.7 MB | MiniFASNetV2 | ✅ Yes |
| `MiniFASNetV1.onnx` | Passive Liveness V1 | 1.7 MB | MiniFASNetV2 (copy) | Optional |
| `MiniFASNetV2.onnx` | Passive Liveness V2 | 1.7 MB | MiniFASNetV2 (copy) | Optional |
| `emotion_mobilenetv3.onnx` | Emotion Recognition | 33.4 MB | FER+ ONNX Model Zoo | Optional |
| `midas_small.onnx` | Depth Estimation (fast) | 63.3 MB | MiDaS Small v2.1 | Optional |
| `dpt_hybrid.onnx` | Depth Estimation (HQ) | 508.3 MB | DPT Hybrid (HF Transformers) | Optional |
| `efficientnet_b4_deepfake.onnx` | Deepfake Detection Primary | 83.3 MB | ViT (3-class) | Optional |
| `xceptionnet_deepfake.onnx` | Deepfake Detection Secondary | 84.6 MB | ViT (2-class) | Optional |

---

## 1. Anti-Spoofing: `anti_spoof.onnx`

**Architecture:** MiniFASNetV2 — lightweight CNN, <10 ms on CPU.  
**Source:** [garciafido/minifasnet-v2-anti-spoofing-onnx](https://huggingface.co/garciafido/minifasnet-v2-anti-spoofing-onnx)

Detects: printed photos, screen/replay attacks, flat mask attacks.

```bash
python scripts/download_models.py --model anti_spoof
# Or manually:
curl -L "https://huggingface.co/garciafido/minifasnet-v2-anti-spoofing-onnx/resolve/main/minifasnet_v2.onnx" \
  -o ./models/anti_spoof.onnx
```

### Model spec
| Property | Value |
|---|---|
| Input name | `input` |
| Input shape | `[batch, 3, 80, 80]` NCHW float32 |
| Input range | `[-1.0, 1.0]` (pixel/127.5 − 1.0) |
| Output name | `output` |
| Output shape | `[batch, 3]` softmax probabilities |
| Output layout | `[P(spoof), P(real), P(partial)]` |
| Config key | `ANTI_SPOOF_MODEL_PATH` |

### Graceful fallback
If absent → texture-complexity heuristic (Laplacian + LBP + histogram entropy). Set `ANTI_SPOOF_ENABLED=false` to skip entirely.

---

## 2. Passive Liveness V1: `MiniFASNetV1.onnx`

**Note:** No public MiniFASNetV1 ONNX is available. This is a copy of V2 weights used as the V1 arm of the ensemble.

```bash
# Created automatically by --all (copies anti_spoof.onnx)
cp ./models/anti_spoof.onnx ./models/MiniFASNetV1.onnx
```

| Property | Value |
|---|---|
| Input shape | `[batch, 3, 80, 80]` NCHW float32 |
| Output shape | `[batch, 3]` — `[P(spoof), P(real), P(partial)]` |
| Config key | `MINIFASNET_V1_PATH` |

---

## 3. Passive Liveness V2: `MiniFASNetV2.onnx`

Same weights as `anti_spoof.onnx`.

```bash
cp ./models/anti_spoof.onnx ./models/MiniFASNetV2.onnx
```

| Config key | `MINIFASNET_V2_PATH` |
|---|---|

---

## 4. Emotion Recognition: `emotion_mobilenetv3.onnx`

**Architecture:** FER+ (Facial Expression Recognition Plus) ONNX Model Zoo  
**Source:** [onnxmodelzoo/emotion-ferplus-8](https://huggingface.co/onnxmodelzoo/emotion-ferplus-8)

```bash
python scripts/download_models.py --model emotion
# Or manually:
curl -L "https://huggingface.co/onnxmodelzoo/emotion-ferplus-8/resolve/main/emotion-ferplus-8.onnx" \
  -o ./models/emotion_mobilenetv3.onnx
```

### Model spec
| Property | Value |
|---|---|
| Input name | `Input3` |
| Input shape | `[1, 1, 64, 64]` single-channel (grayscale) float32 |
| Input range | `[0.0, 1.0]` |
| Output name | `Plus692_Output_0` |
| Output shape | `[1, 8]` logits |
| Classes | `neutral, happy, surprise, fear, disgust, angry, contempt, sad` |
| Config key | `EMOTION_MODEL_PATH` |

### Graceful fallback
If absent → MediaPipe/geometry-based emotion heuristic from facial landmarks.

---

## 5. Depth Estimation (Fast): `midas_small.onnx`

**Architecture:** MiDaS Small v2.1  
**Source:** [Heliosoph/midas-small-onnx](https://huggingface.co/Heliosoph/midas-small-onnx)

```bash
python scripts/download_models.py --model midas_small
# Or manually:
curl -L "https://huggingface.co/Heliosoph/midas-small-onnx/resolve/main/midas_v21_small_256.onnx" \
  -o ./models/midas_small.onnx
```

| Property | Value |
|---|---|
| Input name | `input_image` |
| Input shape | `[1, 3, 256, 256]` NCHW float32 |
| Normalization | ImageNet: mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]` |
| Output name | `output_depth` |
| Output shape | `[1, 256, 256]` inverse depth map |
| Config key | `MIDAS_SMALL_PATH` |

---

## 6. Depth Estimation (High Quality): `dpt_hybrid.onnx` [Optional — 508 MB]

**Architecture:** DPT Hybrid (HuggingFace Transformers ONNX export)  
**Source:** [lquint/dpt-hybrid-midas-onnx](https://huggingface.co/lquint/dpt-hybrid-midas-onnx)

```bash
python scripts/download_models.py --model dpt_hybrid
# Or manually (~508 MB, ~3 min):
curl -L "https://huggingface.co/lquint/dpt-hybrid-midas-onnx/resolve/main/onnx/model.onnx" \
  -o ./models/dpt_hybrid.onnx
```

| Property | Value |
|---|---|
| Input name | `pixel_values` |
| Input shape | `[batch, 3, 384, 384]` (dynamic) |
| Normalization | ImageNet: mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]` |
| Output name | `predicted_depth` |
| Output shape | `[batch, 384, 384]` inverse depth map |
| Config key | `DPT_HYBRID_PATH` |

### Graceful fallback
If absent → falls back to MiDaS Small automatically.

---

## 7. Deepfake Detection (Primary): `efficientnet_b4_deepfake.onnx`

**Architecture:** Vision Transformer (ViT) — 3-class  
**Source:** [prithivMLmods/AI-vs-Deepfake-vs-Real-ONNX](https://huggingface.co/prithivMLmods/AI-vs-Deepfake-vs-Real-ONNX)

```bash
python scripts/download_models.py --model efficientnet_b4
# Or manually:
curl -L "https://huggingface.co/prithivMLmods/AI-vs-Deepfake-vs-Real-ONNX/resolve/main/onnx/model_int8.onnx" \
  -o ./models/efficientnet_b4_deepfake.onnx
```

| Property | Value |
|---|---|
| Input name | `pixel_values` |
| Input shape | `[batch, 3, 224, 224]` NCHW float32 |
| Normalization | mean=0.5, std=0.5 (all channels) |
| Output name | `logits` |
| Output shape | `[batch, 3]` |
| Classes | `{0: Artificial/AI-Art, 1: Deepfake, 2: Real}` |
| Config key | `EFFICIENTNET_DEEPFAKE_PATH` |

---

## 8. Deepfake Detection (Secondary): `xceptionnet_deepfake.onnx`

**Architecture:** Vision Transformer (ViT) — 2-class  
**Source:** [prithivMLmods/Deepfake-Detection-Exp-02-22-ONNX](https://huggingface.co/prithivMLmods/Deepfake-Detection-Exp-02-22-ONNX)

```bash
python scripts/download_models.py --model xceptionnet
# Or manually:
curl -L "https://huggingface.co/prithivMLmods/Deepfake-Detection-Exp-02-22-ONNX/resolve/main/onnx/model_int8.onnx" \
  -o ./models/xceptionnet_deepfake.onnx
```

| Property | Value |
|---|---|
| Input name | `pixel_values` |
| Input shape | `[batch, 3, 224, 224]` NCHW float32 |
| Normalization | mean=0.5, std=0.5 (all channels) |
| Output name | `logits` |
| Output shape | `[batch, 2]` |
| Classes | `{0: Fake, 1: Real}` |
| Config key | `XCEPTIONNET_DEEPFAKE_PATH` |

---

## 9. InsightFace (buffalo_l) — Auto-downloaded

InsightFace downloads its own models (`buffalo_l`) automatically to `~/.insightface/models/buffalo_l/` on first backend startup.

**No manual step required.** Files needed:
- `det_10g.onnx` — RetinaFace detection
- `w600k_r50.onnx` — ArcFace recognition (512-d embeddings)

---

## Directory Layout

```
backend/models/
  anti_spoof.onnx                   ← MiniFASNetV2 (required, 1.7 MB)
  MiniFASNetV1.onnx                 ← Passive liveness V1 (1.7 MB)
  MiniFASNetV2.onnx                 ← Passive liveness V2 (1.7 MB)
  emotion_mobilenetv3.onnx          ← FER+ emotion (33.4 MB)
  midas_small.onnx                  ← Depth fast (63.3 MB)
  dpt_hybrid.onnx                   ← Depth HQ (508.3 MB)
  efficientnet_b4_deepfake.onnx     ← Deepfake primary ViT (83.3 MB)
  xceptionnet_deepfake.onnx         ← Deepfake secondary ViT (84.6 MB)
  README.md                         ← this file
```

---

## Fallback Behavior Summary

| Model Missing | Fallback | Impact |
|---|---|---|
| `anti_spoof.onnx` | Texture heuristic (LBP + Laplacian + entropy) | Reduced spoofing detection |
| `MiniFASNetV1/V2.onnx` | Same texture heuristic | Reduced passive liveness accuracy |
| `emotion_mobilenetv3.onnx` | Landmark geometry heuristic | Emotion labels less accurate |
| `midas_small.onnx` | Gradient magnitude variance | Depth check is approximate |
| `dpt_hybrid.onnx` | Falls back to MiDaS Small | No functional impact if Small present |
| `efficientnet_b4_deepfake.onnx` | Frequency-domain heuristic (threshold=0.85) | Deepfake detection less sensitive |
| `xceptionnet_deepfake.onnx` | Single-model or heuristic | Minor accuracy reduction |

> **Development:** Set `STRICT_MODEL_VERIFICATION=false` in `.env` to suppress startup warnings about missing models.  
> **Production:** All required models must be present or startup will fail.
