import {AudioPlayer} from "zeaker";
import {ipcMain} from "electron";

export class AudioBackend extends AudioPlayer {
  constructor() {
    super();
    ipcMain.handle('play', this.wrap(this.play.bind(this)));
    ipcMain.handle('stop', this.wrap(this.stop.bind(this)));
    ipcMain.handle('playGapless', this.wrap(this.playGapless.bind(this)));
    ipcMain.handle('seek', this.wrap(this.seek.bind(this)));
    ipcMain.handle('getCurrentTime', this.wrap(this.getCurrentTime.bind(this)));
  }

  play(filePath: string, startPosition: number) {
    return super.play(filePath, startPosition);
  }

  stop() {
    return super.stop();
  }

  playGapless(nextTrack: string): Promise<void> {
    return super.playGapless(nextTrack);
  }

  seek(positionSeconds: number) {
    return super.seek(positionSeconds);
  }

  getCurrentTime(): number {
    return super.getCurrentTime();
  }

  private wrap<T extends (...args: any[]) => any>(fn: T) {
    return (_event: Electron.IpcMainInvokeEvent, ...args: Parameters<T>): ReturnType<T> => {
      return fn.apply(this, args);
    };
  }
}