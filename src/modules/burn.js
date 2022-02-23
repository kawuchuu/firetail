import childProcess from 'child_process';
import tmp from 'tmp';
import fs from 'fs';

let currentId = 0;

class Burn {
    constructor(options, sender) {
        this.jobId = currentId;
        this.options = options;
        this.burnState = 0;
        this.sender = sender;

        currentId++;
        this.runJob();
    }

    async runJob() {
        this.sender.send("burnStarted", this.jobId);
        this.sender.send("burnDescription", {
            jobId: this.jobId,
            description: `Preparing to burn...`
        });

        //Transcode all the tracks
        tmp.dir({
            prefix: "firetail_"
        }, async (err, path, cleanup) => {
            if (err) {
                //Error!
                console.log("Could not create temporary directory for burn job");
                return;
            }

            try {
                console.log(`BURN: temporary directory: ${path}`);
    
                //First, transcode all the files
                let current = 0;
                for (let file of this.options.items) {
                    await this.ffmpeg(file.path, `${path}/Track${current}.wav`);
                    current++;
                }
    
                //Create a TOC file
                let tocFile = [
                    "CD_DA",
                    "CD_TEXT {",
                    "LANGUAGE_MAP {",
                    "0:EN",
                    "}",
                    "LANGUAGE 0 {",
                    `TITLE "${this.options.title}"`,
                    "}",
                    "}"
                ]
                for (let i = 0; i < this.options.items.length; i++) {
                    let file = this.options.items[i];
                    tocFile.push(`TRACK AUDIO`)
                    tocFile.push("CD_TEXT {");
                    tocFile.push("LANGUAGE 0 {");
                    tocFile.push(`TITLE "${file.title}"`);
                    tocFile.push(`ARRANGER "${file.artist}"`);
                    tocFile.push(`COMPOSER "${file.artist}"`);
                    tocFile.push(`PERFORMER "${file.artist}"`);
                    tocFile.push(`SONGWRITER "${file.artist}"`);
                    tocFile.push("}");
                    tocFile.push("}");
                    tocFile.push(`FILE "Track${i}.wav" 0`)
                }
                fs.writeFileSync(`${path}/contents.toc`, tocFile.join("\n"));
    
                console.log("BURN: TOC file written");
    
                //Burn files with cdrdao
                let device = this.options.device || "/dev/sr0";
                await this.cdrdao(device, path);
        
                //Burn job complete!
                this.sender.send("burnComplete", this.jobId);
            } catch {
                this.sender.send("burnFailed", this.jobId);
            } finally {
                cleanup();
            }
        });
    }

    ffmpeg(from, to) {
        //Transcode a track
        console.log(`BURN: FFMPEG: transcoding track: ${from} -> ${to}`);
        return new Promise((res, rej) => {
            let proc = childProcess.spawn("ffmpeg", ["-i", from, "-ar", "44100", to]);
            proc.on("close", (exitCode) => {
                if (exitCode === 0) {
                    res();
                } else {
                    rej();
                }
            });
        });
    }

    cdrdao(device, path) {
        return new Promise((res, rej) => {
            let proc = childProcess.spawn("cdrdao", ["write", "-n", "--eject", "--device", device, "--driver", "generic-mmc-raw", "contents.toc"], {
                cwd: path,
                encoding: "utf8"
            });

            let stdio = data => {
                let output = data.toString("utf8");
                for (let line of output.split("\r")) {
                    line = line.trim();
                    console.log(line);

                    if (line.startsWith("Writing track")) {
                        let parts = line.split(" ");
                        this.sender.send("burnDescription", {
                            jobId: this.jobId,
                            description: `Burning Track ${parts[2]}`
                        });
                        this.burnState = 1;
                    } else if (line.startsWith("Wrote ")) {
                        if (line.includes("blocks.")) {
                            this.sender.send("burnDescription", {
                                jobId: this.jobId,
                                description: `Finalising CD`
                            });
                            this.burnState = 2;
                        } else {
                            let parts = line.split(" ");
                            let partProgress = parseInt(parts[1]);
                            let partMaxProgress = parseInt(parts[3]);

                            let totalProgress;
                            let maxProgress;
                            switch (this.burnState) {
                                case 0: //Take up 1/4 of the full progress
                                    totalProgress = partProgress;
                                    maxProgress = partMaxProgress * 4;
                                    break;
                                case 1: //Take up 1/2 of the full progress
                                    totalProgress = partProgress + partMaxProgress / 2;
                                    maxProgress = partMaxProgress * 2;
                                    break;
                                case 2: //Take up 1/4 of the full progress
                                    totalProgress = partProgress + partMaxProgress * 3;
                                    maxProgress = partMaxProgress * 4;
                                    break;

                            }

                            this.sender.send("burnProgress", {
                                jobId: this.jobId,
                                progress: totalProgress,
                                maximum: maxProgress
                            });
                        }
                    }
                }
            }

            proc.stdout.on("data", stdio);
            proc.stderr.on("data", stdio);
            proc.on("close", (exitCode) => {
                if (exitCode === 0) {
                    res();
                } else {
                    rej();
                }
            });
        });
    }

    get id() {
        return this.jobId;
    }

    static canBurn() {
        return new Promise(res => {
            let proc = childProcess.spawn("cdrdao", ["disk-info"]);

            let canBurn = true;
            let stdio = data => {
                let output = data.toString("utf8");
                if (output.includes("WARNING: Unit not ready")) {
                    canBurn = false;
                    proc.kill('SIGINT');
                }
            }

            proc.stdout.on("data", stdio);
            proc.stderr.on("data", stdio);
            proc.on("close", () => {
                res(canBurn);
            });
        });
    }
}

export default Burn;