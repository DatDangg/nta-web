"""image_sniff.py — Nhận diện ảnh theo NỘI DUNG (magic bytes), đồng bộ src/lib/uploads/image-file.ts (CR-035).

Chỉ JPEG/PNG/WebP; kích thước đọc thẳng từ header (không decode). GIF/SVG/AVIF/HEIC/HTML giả → ImageSkip.
Thêm cạnh tối thiểu 200 px (loại favicon/pixel) so với quy tắc upload. Python stdlib only.
"""
import collections
import hashlib
import struct

MIN_IMAGE_SIDE, MAX_IMAGE_SIDE = 200, 8192

Image = collections.namedtuple("Image", "data sha256 ext width height")


class ImageSkip(Exception):
    """Tin này không có ảnh (lý do ngắn trong message) — không bao giờ làm fail bài."""


def _png_size(data: bytes):
    if len(data) < 24 or data[12:16] != b"IHDR":
        return None
    return struct.unpack(">II", data[16:24])


def _is_start_of_frame(marker: int) -> bool:
    return 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC)


def _jpeg_size(data: bytes):
    offset = 2
    while offset + 9 <= len(data):
        if data[offset] != 0xFF:
            return None
        marker = data[offset + 1]
        if marker == 0xFF:
            offset += 1
            continue
        if _is_start_of_frame(marker):
            height, width = struct.unpack(">HH", data[offset + 5:offset + 9])
            return width, height
        if marker in (0xD9, 0xDA):
            return None
        offset += 2 + struct.unpack(">H", data[offset + 2:offset + 4])[0]
    return None


def _webp_size(data: bytes):
    if len(data) < 30:
        return None
    chunk = data[12:16]
    if chunk == b"VP8 ":
        width, height = struct.unpack("<HH", data[26:30])
        return width & 0x3FFF, height & 0x3FFF
    if chunk == b"VP8L":
        bits = struct.unpack("<I", data[21:25])[0]
        return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
    if chunk == b"VP8X":
        return int.from_bytes(data[24:27], "little") + 1, int.from_bytes(data[27:30], "little") + 1
    return None


def inspect_image(data: bytes) -> Image:
    """Theo NỘI DUNG (magic bytes); GIF/SVG/AVIF/HEIC/HTML giả → ImageSkip."""
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        ext, size = "png", _png_size(data)
    elif data.startswith(b"\xff\xd8\xff"):
        ext, size = "jpg", _jpeg_size(data)
    elif len(data) >= 12 and data[0:4] == b"RIFF" and data[8:12] == b"WEBP":
        ext, size = "webp", _webp_size(data)
    else:
        raise ImageSkip("không phải JPEG/PNG/WebP")
    if not size:
        raise ImageSkip(f"không đọc được kích thước {ext}")
    width, height = size
    if min(width, height) < MIN_IMAGE_SIDE:
        raise ImageSkip(f"ảnh nhỏ {width}x{height}")
    if max(width, height) > MAX_IMAGE_SIDE:
        raise ImageSkip(f"ảnh quá lớn {width}x{height}")
    return Image(data, hashlib.sha256(data).hexdigest(), ext, width, height)
