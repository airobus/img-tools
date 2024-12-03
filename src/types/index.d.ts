declare module 'heic-convert' {
  interface ConvertOptions {
    buffer: Buffer;
    format: 'JPEG' | 'PNG';
    quality?: number;
  }
  
  function convert(options: ConvertOptions): Promise<Buffer>;
  export default convert;
}

declare module '@ffmpeg/ffmpeg' {
  export class FFmpeg {
    load(options?: { coreURL?: string; wasmURL?: string }): Promise<void>;
    FS(method: string, ...args: any[]): any;
    run(...args: string[]): Promise<void>;
  }
}

declare module '@ffmpeg/util' {
  export function fetchFile(file: File): Promise<Uint8Array>;
  export function toBlobURL(url: string, type: string): Promise<string>;
}

// 添加 Buffer 类型
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
} 