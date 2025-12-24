/*
    INCOMPLETE
 */

import dbus, {Variant} from 'dbus-next';
import {app, ipcMain} from "electron";
import {mainWindow} from "../main";
import FiretailSong from "../types/FiretailSong";

const {Interface, ACCESS_READWRITE, ACCESS_READ} = dbus.interface;
let bus: dbus.MessageBus | null = null;

interface MetadataMap {
  'mpris:trackid': Variant;
  'mpris:length': Variant;
  'mpris:artUrl': Variant;
  'xesam:album': Variant;
  'xesam:albumArtist': Variant;
  'xesam:artist': Variant;
  'xesam:genre': Variant;
  'xesam:title': Variant;
  'xesam:trackNumber': Variant;
  'xesam:url': Variant;
}

class BaseInterface extends Interface {
  constructor() {
    super('org.mpris.MediaPlayer2');
  }

  Raise() {
    mainWindow.focus();
  }

  Quit() {
    app.quit();
  }

  CanQuit = true;
  Fullscreen = false;
  CanSetFullscreen = false;
  CanRaise = true;
  HasTrackList = false;
  Identity = "Firetail";
  DesktopEntry = "firetail";
  SupportedUriSchemes: string[] = [];
  SupportedMimeTypes = ['audio/mpeg', 'audio/flac'];
}

class PlayerInterface extends Interface {
  constructor() {
    super('org.mpris.MediaPlayer2.Player');
  }

  Next() {
    console.log('next')
    mainWindow.webContents.send('playerNext');
  }

  Previous() {
    mainWindow.webContents.send('playerPrevious');
  }

  Pause() {
    mainWindow.webContents.send('playerPause');
  }

  PlayPause() {
    mainWindow.webContents.send('playerPlayPause');
  }

  Stop() {
    mainWindow.webContents.send('playerStop');
  }

  Play() {
    mainWindow.webContents.send('playerPlay');
  }

  Seek(Offset: bigint) {
    //
  }

  SetPosition(TrackId: string, Position: bigint) {
    //
  }

  OpenUri(Uri: string) {
    //
  }

  Seeked(Position: bigint) {
    //
  }

  PlaybackStatus = "Paused";
  LoopStatus = "None";
  Rate = 1;
  Shuffle = false;

  _Metadata = {
    'mpris:trackid': new Variant('s', '/dev/firetail/track/notrack'),
    'mpris:length': new Variant('x', BigInt(0)),
    'mpris:artUrl': new Variant('s', ''),
    'xesam:album': new Variant('s', ''),
    'xesam:albumArtist': new Variant('as', []),
    'xesam:artist': new Variant('as', []),
    'xesam:genre': new Variant('as', []),
    'xesam:title': new Variant('s', 'Firetail'),
    'xesam:trackNumber': new Variant('i', 0),
    'xesam:url': new Variant('s', ''),
  }

  get Metadata() {
    return this._Metadata;
  }

  set Metadata(song: MetadataMap) {
    this._Metadata = song
  }

  Volume = 1;
  Position = BigInt(1);
  MinimumRate = 1;
  MaximumRate = 1;
  CanGoNext = false;
  CanGoPrevious = false;
  CanPlay = true;
  CanPause = true;
  CanSeek = true;
  CanControl = true;
}

async function setup(base: InstanceType<typeof BaseInterface>, player: InstanceType<typeof PlayerInterface>) {
  await bus.requestName('org.mpris.MediaPlayer2.firetail', dbus.NameFlag.DO_NOT_QUEUE);
  bus.export('/org/mpris/MediaPlayer2', base);
  bus.export('/org/mpris/MediaPlayer2', player);
}

// have to do it this way since dbus-next doesn't support typescript decorators
function configureMembers() {
  BaseInterface.configureMembers({
    methods: {
      Raise: {
        inSignature: '',
        outSignature: ''
      },
      Quit: {
        inSignature: '',
        outSignature: ''
      }
    },
    properties: {
      CanQuit: {
        signature: 'b',
        access: ACCESS_READ,
      },
      Fullscreen: {
        signature: 'b',
        access: ACCESS_READWRITE,
      },
      CanSetFullscreen: {
        signature: 'b',
        access: ACCESS_READ,
      },
      CanRaise: {
        signature: 'b',
        access: ACCESS_READ,
      },
      HasTrackList: {
        signature: 'b',
        access: ACCESS_READ,
      },
      Identity: {
        signature: 's',
        access: ACCESS_READ,
      },
      DesktopEntry: {
        signature: 's',
        access: ACCESS_READ,
      },
      SupportedUriSchemes: {
        signature: 'as',
        access: ACCESS_READ,
      },
      SupportedMimeTypes: {
        signature: 'as',
        access: ACCESS_READ,
      }
    }
  });
  PlayerInterface.configureMembers({
    methods: {
      Next: {
        inSignature: '',
        outSignature: ''
      },
      Previous: {
        inSignature: '',
        outSignature: ''
      },
      Pause: {
        inSignature: '',
        outSignature: ''
      },
      PlayPause: {
        inSignature: '',
        outSignature: ''
      },
      Stop: {
        inSignature: '',
        outSignature: ''
      },
      Play: {
        inSignature: '',
        outSignature: ''
      },
      Seek: {
        inSignature: 'x',
        outSignature: ''
      },
      SetPosition: {
        inSignature: 'ox',
        outSignature: ''
      },
      OpenUri: {
        inSignature: 's',
        outSignature: ''
      }
    },
    signals: {
      Seeked: {
        signature: 'x',
      }
    },
    properties: {
      PlaybackStatus: {
        signature: 's',
        access: ACCESS_READ
      },
      LoopStatus: {
        signature: 's',
        access: ACCESS_READWRITE
      },
      Rate: {
        signature: 'd',
        access: ACCESS_READWRITE
      },
      Shuffle: {
        signature: 'b',
        access: ACCESS_READWRITE
      },
      Metadata: {
        signature: 'a{sv}',
        access: ACCESS_READ
      },
      Volume: {
        signature: 'd',
        access: ACCESS_READWRITE
      },
      Position: {
        signature: 'x',
        access: ACCESS_READ
      },
      MinimumRate: {
        signature: 'd',
        access: ACCESS_READ
      },
      MaximumRate: {
        signature: 'd',
        access: ACCESS_READ
      },
      CanGoNext: {
        signature: 'b',
        access: ACCESS_READ
      },
      CanGoPrevious: {
        signature: 'b',
        access: ACCESS_READ
      },
      CanPlay: {
        signature: 'b',
        access: ACCESS_READ
      },
      CanPause: {
        signature: 'b',
        access: ACCESS_READ
      },
      CanSeek: {
        signature: 'b',
        access: ACCESS_READ
      },
      CanControl: {
        signature: 'b',
        access: ACCESS_READ
      }
    }
  });
}

export async function initMPRIS() {
  if (process.platform !== 'linux') return;
  bus = dbus.sessionBus();
  configureMembers();
  const base = new BaseInterface();
  const player = new PlayerInterface();
  await setup(base, player);
  ipcMain.on('updateMetadata', (event, song: FiretailSong) => {
    player.Metadata = {
      'mpris:trackid': new Variant('s', `/dev/firetail/track/${song.id}`),
      'mpris:length': new Variant('x', BigInt(Math.trunc(song.realdur * 1000000))),
      'mpris:artUrl': new Variant('s', ''),
      'xesam:album': new Variant('s', song.album),
      'xesam:albumArtist': new Variant('as', [song.albumArtist]),
      'xesam:artist': new Variant('as', JSON.parse(song.allArtists as string)),
      'xesam:genre': new Variant('as', song.genre ? song.genre : []),
      'xesam:title': new Variant('s', song.title),
      'xesam:trackNumber': new Variant('i', song.trackNum),
      'xesam:url': new Variant('s', song.path),
    }
    propUpdate(player, {Metadata: player.Metadata});
  });
}

function propUpdate(inter: InstanceType<typeof Interface>, toUpdate: { [p: string]: any }) {
  Interface.emitPropertiesChanged(inter, toUpdate, []);
}