import { compress as lz4_compress, decompress as lz4_decompress } from "lz4js";
import { getLocalStorageData, LSEnum, updateLocalStorage } from "./localStorageMaster";

let compressionData;
let isDeltaFrame;

const IsLittleEndian = () => {
    const uint32 = new Uint32Array([0x11223344]);
    const uint8 = new Uint8Array(uint32.buffer);
    return uint8[0] === 0x44;
}

export const initVideoCompressionMaster = () => {
    compressionData = getLocalStorageData(LSEnum.compress);
    compressionData.isLittleEndian = IsLittleEndian();
    updateLocalStorage(LSEnum.compress, compressionData);
}

export const compressData = async (bufferIn) => {
    const time = Date.now();
    let { lastSendQuantized, lastSendKeyframeTime, options: { sendKeyframeInterval } } = compressionData;

    // Quantize the frame
    const quantized = packBytes(bufferIn);
    const quantizedView = new DataView(quantized);
    const quantizedUint8 = new Uint8Array(quantized);

    // Calculate the delta frame (if applicable)
    const delta = new ArrayBuffer(quantized.byteLength);
    const deltaView = new DataView(delta);
    const deltaUint8 = new Uint8Array(delta);

    isDeltaFrame = lastSendQuantized !== null
        && (lastSendKeyframeTime === null || (time - lastSendKeyframeTime) < sendKeyframeInterval);

    if (isDeltaFrame) {
        const lastQuantizedView = new DataView(lastSendQuantized);
        for (let i = 0; i < quantizedView.byteLength; i++) {
            let b = quantizedView.getUint8(i) - lastQuantizedView.getUint8(i);
            deltaView.setUint8(i, b);
        }
    } else {
        deltaUint8.set(quantizedUint8);
        compressionData.lastSendKeyframeTime = time;
    }

    compressionData.lastSendQuantized = quantized.slice(0);
    updateLocalStorage(LSEnum.compress, compressionData);

    const compressedFrame = compressDeltaFrame(delta, deltaUint8);
    const message = createMessage(compressedFrame);

    return message;
}

const compressDeltaFrame = (delta, deltaUint8) => {
    let time0 = Date.now();

    let compressedUint8 = lz4_compress(deltaUint8, delta.byteLength);

    let time1 = Date.now();

    compressionData.sendLastCompressionTime = time1 - time0;
    compressionData.sendLastUncompressedSize = delta.byteLength;
    compressionData.sendLastCompressedSize = compressedUint8.buffer.byteLength;
    compressionData.compressionRate = compressedUint8.buffer.byteLength / delta.byteLength;
    updateLocalStorage(LSEnum.compress, compressionData);

    return compressedUint8;
}

const createMessage = (compressedFrame) => {
    const isCompressed = true;
    const message = new ArrayBuffer(4 + compressedFrame.buffer.byteLength);
    const messageView = new DataView(message);
    const messageUint8 = new Uint8Array(message);

    let flags = 0b10000;

    if (isDeltaFrame) {
        flags |= 0b1;
    }

    if (isCompressed) {
        flags |= 0b10;
    }

    messageView.setUint32(0, flags);

    messageUint8.set(compressedFrame, 4);

    return messageUint8.buffer;
}

const packBytes = (bufferIn) => {
    let { isLittleEndian } = compressionData;
    const bufferOut = new ArrayBuffer(Math.ceil(bufferIn.byteLength / 8 * 3));

    const inView = new DataView(bufferIn);
    const outView = new DataView(bufferOut);

    const num64s = bufferIn.byteLength / 8;

    for (let i = 0; i < num64s; i++) {
        const col0 = inView.getUint32(i * 8, !isLittleEndian);
        const col1 = inView.getUint32(i * 8 + 4, !isLittleEndian);

        const b0 = ((col0 >> 24) & 0xf0) | ((col0 >> 20) & 0xf);
        const b1 = ((col0 >> 8) & 0xf0) | ((col1 >> 28) & 0xf);
        const b2 = ((col1 >> 16) & 0xf0) | ((col1 >> 12) & 0xf);

        outView.setUint8(i * 3, b0);
        outView.setUint8(i * 3 + 1, b1);
        outView.setUint8(i * 3 + 2, b2);
    }

    return bufferOut;
}

export const decompressData = (message) => {
    const time = Date.now();
    let { lastReceiveQuantized } = compressionData;
    // parse the message
    const messageView = new DataView(message);
    const messageUint8 = new Uint8Array(message);

    const flags = messageView.getUint32(0);

    const isCompressed = (flags & 0b10) == 0b10;

    let decompressedUint8;
    if (isCompressed) {
        decompressedUint8 = lz4_decompress(messageUint8.slice(4));
    }

    if (!decompressedUint8) {
        decompressedUint8 = messageUint8.slice(4);
    }

    const decompressedView = new DataView(decompressedUint8.buffer);

    // Apply frame delta (if applicable)
    const delta = new ArrayBuffer(decompressedView.buffer.byteLength);
    const deltaView = new DataView(delta);
    const deltaUint8 = new Uint8Array(delta);

    const isDeltaFrame = (flags & 0b1) == 0b1;

    if (isDeltaFrame) {
        const lastQuantizedView = new DataView(lastReceiveQuantized);
        const num8s = decompressedView.buffer.byteLength;
        for (let i = 0; i < num8s; i++) {
            let b = decompressedView.getUint8(i) + lastQuantizedView.getUint8(i);
            deltaView.setUint8(i, b);
        }
    } else {
        deltaUint8.set(decompressedUint8);

        compressionData.lastReceiveKeyframeTime = time;
    }

    compressionData.lastReceiveQuantized = delta.slice(0);
    updateLocalStorage(LSEnum.compress, compressionData);

    // unpack the frame
    const unpacked = unpackBytes(delta);

    return unpacked;
}


const unpackBytes = (bufferIn) => {
    const { isLittleEndian } = compressionData;
    const bufferOut = new ArrayBuffer(bufferIn.byteLength / 3 * 8);

    const viewIn = new DataView(bufferIn);
    const viewOut = new DataView(bufferOut);

    const num24s = bufferIn.byteLength / 3;

    for (let i = 0; i < num24s; i++) {
        const b0 = viewIn.getUint8(i * 3);
        const b1 = viewIn.getUint8(i * 3 + 1);
        const b2 = viewIn.getUint8(i * 3 + 2);

        const col0 = ((b0 << 24) & 0xf0000000) | ((b0 << 20) & 0xf00000) | ((b1 << 8) & 0xf000) | 0xff;
        const col1 = ((b1 << 28) & 0xf0000000) | ((b2 << 16) & 0xf00000) | ((b2 << 12) & 0xf000) | 0xff;

        viewOut.setUint32(i * 8, col0, !isLittleEndian);
        viewOut.setUint32(i * 8 + 4, col1, !isLittleEndian);
    }

    return bufferOut;
}