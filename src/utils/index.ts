import fs from 'fs';

// Variables for logging
const tstamp = Math.floor(Date.now() / 1000);
let logStream: fs.WriteStream;
const logDirectory = "./log/";

// Ensure log directory exists
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}
logStream = fs.createWriteStream(`${logDirectory}${tstamp}.log`);

// Log messages with timestamps
export const log = (message: string): void => {
    const date = new Date();
    const formattedDate = date.toISOString().replace('T', ' ').split('.')[0];
    const logMessage = `${formattedDate} - [STEAM] ${message}`;
    console.log(logMessage);
    logStream.write(logMessage + '\n');
};

// Utility function to shuffle an array
export const shuffleArray = (array: any[]): any[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};